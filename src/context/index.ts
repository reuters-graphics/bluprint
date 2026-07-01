import { type BluprintConfig } from './../config/types';

export class Context {
  private static instance: Context;
  private _config: BluprintConfig | undefined;
  public static getInstance(): Context {
    if (!Context.instance) Context.instance = new Context();
    return Context.instance;
  }

  get config() {
    return this._config as BluprintConfig;
  }

  set config(config: BluprintConfig) {
    this._config = config;
  }
}

/** The {@link Context} singleton. */
export const context = Context.getInstance();
