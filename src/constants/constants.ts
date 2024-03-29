export enum EnvConstants {
  ENV_BOT_TOKEN_KEY = 'dbGRE66pe8L6',
  PASS = 'yev2893ZHFvB',
  OPEN_AI_API_KEY = 'H72X9m7vHi',
}

export enum ErrorMessages {
  NO_CONFIG_KEY = 'There are no such keys in the configuration',
  NO_CONFIG = 'Cant obtain base config from .env file',
}

export enum ScenesID {
  PASSWORD = 'PasswordScene',
}

export enum Actions {
  INCOMING_PASSWORD = '<= pass',
  INCOMING_PASSWORD_GENERAL = '<= pass from general chat',
  REJECT_PASSWORD_INPUT = 'reject pass',
  BAN = 'repeated refusal',
}

export enum InteractionRole {
  ASSISTANT = 'assistant',
  USER = 'user',
  SYSTEM = 'system',
}
