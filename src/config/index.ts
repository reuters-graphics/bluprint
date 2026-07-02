import os from 'os';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { loadConfig } from './load';
import type { BluprintConfig } from './types';
import type { DefaultContext } from '../actions/types';
import { log } from '@clack/prompts';
import { fetchLocalConfig, fetchRemoteConfig } from './fetch';

class Config {
  public module?: BluprintConfig;
  private static instance: Config;
  /** Path to the bluprint config file */
  private tmpPath: string;

  constructor() {
    const tmpDir = os.tmpdir();
    const random = crypto.randomBytes(4).toString('hex');
    this.tmpPath = path.join(tmpDir, `bluprint.${random}.config.ts`);
  }

  public static getInstance(): Config {
    if (!Config.instance) Config.instance = new Config();
    return Config.instance;
  }

  private writeTmp(content: string) {
    if (!fs.existsSync(path.dirname(this.tmpPath)))
      fs.mkdirSync(path.dirname(this.tmpPath), { recursive: true });
    fs.writeFileSync(this.tmpPath, content);
  }

  private cleanupTmp() {
    if (fs.existsSync(this.tmpPath)) fs.unlinkSync(this.tmpPath);
  }

  /**
   * Load bluprint config module
   * @param urlOrPath Either a git URL (or shorthand) or a path to a local bluprint directory.
   */
  async load(urlOrPath: string) {
    let content: string;
    if (urlOrPath.startsWith('file://')) {
      content = await fetchLocalConfig(urlOrPath);
    } else {
      content = await fetchRemoteConfig(urlOrPath);
    }
    this.writeTmp(content);
    try {
      this.module = await loadConfig(this.tmpPath);
    } catch {
      log.error('Error loading bluprint config');
      this.cleanupTmp();
      process.exit(0);
    }
    this.cleanupTmp();
    return this.module;
  }
}

export const config = Config.getInstance();

/**
 * Identity helper that types a bluprint's config module.
 *
 * Pass an `Extra` type argument describing the values your `prompt` / `run`
 * actions contribute to the run context, and every action's `when`, `run`, and
 * editor callback is typed against `DefaultContext & Extra` — so `ctx.myValue`
 * autocompletes and type-checks instead of being `unknown`.
 *
 * @example
 * interface Ctx { projectName: string; useTypeScript: boolean }
 * export default defineConfig<Ctx>({
 *   name: 'My bluprint',
 *   files: ['**\/*'],
 *   ignores: [],
 *   actions: [
 *     prompt({ name: 'projectName', type: 'text', message: 'Name?' }),
 *     render({ files: ['README.md'], when: (ctx) => ctx.projectName !== '' }),
 *   ],
 * });
 */
export const defineConfig = <Extra extends object = Record<string, unknown>>(
  userConfig: BluprintConfig<DefaultContext & Extra>
): BluprintConfig<DefaultContext & Extra> => {
  return userConfig;
};
