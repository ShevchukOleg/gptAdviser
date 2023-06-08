import { DotenvParseOutput, config } from 'dotenv';
import { ErrorMessages } from '../constants/constants.js';
import { ConfigServiceModel } from '../models/config.model.js';
import { runtimeError } from '../utils/error.handlers.js';

export class ConfigService implements ConfigServiceModel {
  private env: DotenvParseOutput | null = null;

  constructor() {
    this.env = this.obtainConfig();
  }

  public obtainConfig() {
    const { error, parsed } = config();

    if (error || !parsed) {
      throw new Error(ErrorMessages.NO_CONFIG);
    }
    return parsed;
  }

  public get(k: string): string {
    let res = '';
    if (!this.env) {
      runtimeError(ErrorMessages.NO_CONFIG);
    } else if (!this.env[k]) {
      runtimeError(ErrorMessages.NO_CONFIG_KEY);
    } else {
      res = this.env[k];
    }

    return res;
  }
}
