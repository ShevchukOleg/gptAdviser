import { Context, Scenes, session, Telegraf } from 'telegraf';

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
