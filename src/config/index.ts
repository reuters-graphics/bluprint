import os from 'os';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { loadConfig } from './load';
import type { BluprintConfig } from './types';
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

export const defineConfig = (userConfig: BluprintConfig) => {
  return userConfig;
};
