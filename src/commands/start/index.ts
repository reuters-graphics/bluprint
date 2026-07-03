import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk-template';
import { log } from '@clack/prompts';

import { profile } from '../../profile';
import { config } from '../../config';
import { checkVersion } from '../../config/checkVersion';
import { runActions } from '../../actions';
import { runtime, isInteractive } from '../../runtime';
import { choosePart } from './choosePart';
import { scaffold } from '../../scaffold';

export interface StartOptions {
  /** Path to a JSON file of answers for the bluprint's `prompt` actions. */
  input?: string;
  /** Scaffold a specific part instead of the whole bluprint. */
  part?: string;
  /** Force non-interactive mode (also auto-detected off TTY / `CI`). */
  ci?: boolean;
}

/** Read and validate a `--input` answers file into a values object. */
const loadValues = (inputPath?: string): Record<string, unknown> => {
  if (!inputPath) return {};
  const abs = path.resolve(inputPath);
  if (!fs.existsSync(abs)) {
    throw new Error(`--input file not found: ${inputPath}`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(abs, 'utf-8'));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`--input ${inputPath} is not valid JSON: ${message}`);
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(`--input ${inputPath} must be a JSON object of answers`);
  }
  return parsed as Record<string, unknown>;
};

/**
 * Start a new project from a bluprint: pick a bluprint, load its config, choose
 * a part (if any), scaffold its files into the current directory, then run its
 * actions.
 *
 * Runs interactively by default. In non-interactive mode (`--ci`, no TTY, or
 * `CI` set) it never prompts: prompt answers come from `--input`, the part comes
 * from `--part`, and any action failure aborts with a non-zero exit.
 *
 * @param bluprint A registered bluprint title, or a git URL/shorthand. Required
 *   in non-interactive mode; otherwise the user picks from installed bluprints.
 * @param options `--input`, `--part`, `--ci`.
 */
export const start = async (
  bluprint?: string,
  options: StartOptions = {}
): Promise<void> => {
  runtime.interactive = isInteractive(options.ci);

  let values: Record<string, unknown> = {};
  try {
    values = loadValues(options.input);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error(message);
    process.exit(1);
  }

  let urlOrPath: string;

  if (!bluprint) {
    if (!runtime.interactive) {
      log.error(
        chalk`Pass a bluprint (git URL or shorthand) — can't prompt for one in non-interactive mode.`
      );
      process.exit(1);
    }
    if (profile.bluprintTitles.length === 0) {
      log.info(
        chalk`You have no bluprints yet. Add one with {yellow bluprint add}.`
      );
      return;
    }
    urlOrPath = await profile.promptForBluprint();
  } else {
    // A registered title resolves to its URL; otherwise treat it as a git URL.
    urlOrPath = profile.getBluprintUrl(bluprint) ?? bluprint;
  }

  if (urlOrPath.startsWith('file://')) {
    log.error(
      chalk`{yellow start} doesn't support local {yellow file://} bluprints yet — pass a git repo like {green user/repo}.`
    );
    return;
  }

  await config.load(urlOrPath);
  if (!config.module) return;

  checkVersion(config.module);

  let selection;
  try {
    selection = await choosePart(config.module, options.part);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error(message);
    process.exit(1);
  }
  const { part, files, ignores, actions } = selection;

  try {
    await scaffold(urlOrPath, { files, ignores });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error(chalk`Couldn't fetch the bluprint's files:\n${message}`);
    process.exit(1);
  }

  try {
    await runActions(actions, {
      bluprintPart: part ?? undefined,
      values,
      failFast: !runtime.interactive,
    });
  } catch {
    log.error('A bluprint action failed, so scaffolding was halted.');
    process.exit(1);
  }

  const name =
    typeof config.module.name === 'string' ?
      config.module.name
    : config.module.name.title;
  log.success(chalk`Scaffolded your project from {green ${name}}.`);
};
