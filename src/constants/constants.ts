export const ENV_BOT_TOKEN_KEY = 'TOKEN';

export enum ErrorMessages {
  NO_CONFIG_KEY = 'There are no such keys in the configuration',
  NO_CONFIG = 'Cant obtain base config',
}

export enum ScenesID {
  PASSWORD = 'PasswordScene',
}

export enum Actions {
  INCOMING_PASSWORD = '<= pass',
  REJECT_PASSWORD_INPUT = 'reject pass',
}
