import { DotenvParseOutput } from 'dotenv';
import { ChatCompletionRequestMessageRoleEnum, ChatCompletionResponseMessageRoleEnum } from 'openai';
import { Context, Scenes } from 'telegraf';

export interface ConfigServiceModel {
  get(k: string): string;
}

export interface BotContext extends Context {
  contextProp: string;
  // session: PasswordSceneSession;
  scene: Scenes.SceneContextScene<BotContext, PasswordSceneSession>;
}

export interface PasswordSceneSession extends Scenes.SceneSessionData {
  password: number;
}

export interface ContextItem {
  role: ChatCompletionRequestMessageRoleEnum | ChatCompletionResponseMessageRoleEnum;
  content: string;
  name?: string;
}
