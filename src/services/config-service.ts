import { DotenvParseOutput, config } from 'dotenv';
import { ErrorMessages } from '../constants/constants.js';
import { ConfigServiceModel } from '../models/config.model.js';
import { runtimeError } from '../utils/error.handlers.js';

export class ConfigService implements ConfigServiceModel {
  private env: DotenvParseOutput | NodeJS.ProcessEnv = {};

  constructor() {
    this.env = this.obtainConfig();
    console.log('Base config: ', this.env);
  }

  public obtainConfig() {
    const { error, parsed } = config();
    console.log('obtainConfig Error: ', error);
    console.log('obtainConfig parsedData: ', parsed);

    return parsed ?? process.env;
  }

  public get(k: string): string {
    if (!this.env) {
      throw new Error(`ObtainConfig: ${ErrorMessages.NO_CONFIG}`);
    } else if (!this.env[k]) {
      runtimeError(`Cant obtain field: ${k}`);
    }
    return this.env[k] ?? '';
  }
}
