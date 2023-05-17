import { DotenvParseOutput, config } from 'dotenv';
import { ErrorMessages } from '../constants/constants';
import { ConfigServiceModel } from '../models/config.model';
import { runtimeError } from '../utils/error.handlers';

export class ConfigService implements ConfigServiceModel {
  private env: DotenvParseOutput | null = null;

  constructor() {
    this.obtainConfig();
  }

  public obtainConfig() {
    const { error, parsed } = config();

    if (error || !parsed) {
      throw new Error(ErrorMessages.NO_CONFIG);
    }
    this.env = parsed;
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
