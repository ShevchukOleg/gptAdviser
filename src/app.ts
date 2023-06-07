import { Scenes, Telegraf, session } from 'telegraf';
import { EnvConstants, ScenesID } from './constants/constants.js';
import { Command } from './interaction/general.command.js';
import { Start } from './interaction/start.command.js';
import { Сorrespondence } from './interaction/text.command.js';
import { Voice } from './interaction/voice.command.js';
import { BotContext, ConfigServiceModel } from './models/config.model.js';
import { ConfigService } from './services/config-service.js';
import { Guard } from './services/guard.js';
import { SceneCreator } from './services/scene-creator.js';
// import LocalSession from 'telegraf-session-local';

class Bot {
  public bot: Telegraf<BotContext>;
  public stage: any;
  public taskHandlerList: Command[] = [];
  public guard = guard;
  public scenes = new Map<string, Scenes.BaseScene<BotContext>>();
  constructor(private readonly configService: ConfigServiceModel, private readonly sceneCreator: SceneCreator) {
    this.bot = new Telegraf(this.configService.get(EnvConstants.ENV_BOT_TOKEN_KEY));
    this.taskHandlerList = [new Start(this.bot, guard), new Voice(this.bot, guard), new Сorrespondence(this.bot, guard)];
    // this.bot.use(new LocalSession({ database: 'sessions_db.json' }).middleware());
  }

  public initBot(): void {
    this.registerScene(this.initPasswordScene());
    this.initTaskHandlers();
    this.bot.launch();
    this.gracefullyTerminateBot();
  }

  private initTaskHandlers(): void {
    for (let task of this.taskHandlerList) {
      task.handle();
    }
  }

  private initPasswordScene(): Scenes.BaseScene<BotContext> {
    if (!this.scenes.has(ScenesID.PASSWORD)) {
      const scene = this.sceneCreator.getPasswordScene();
      this.scenes.set(ScenesID.PASSWORD, scene);
      return scene;
    }

    const passwordScene = this.scenes.get(ScenesID.PASSWORD);
    if (passwordScene !== undefined) {
      return passwordScene;
    }

    throw new Error(`Password scene not found.`);
  }

  private registerScene(scene: Scenes.BaseScene<BotContext>) {
    this.stage = new Scenes.Stage([scene]);
    this.bot.use(session());
    this.bot.use(this.stage.middleware());
    this.bot.use((ctx, next) => {
      // we now have access to the the fields defined above
      ctx.contextProp ??= '';
      ctx.scene.session.password ??= 0;
      return next();
    });
  }

  public gracefullyTerminateBot(): void {
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }
}

const guard = new Guard(new ConfigService().get(EnvConstants.PASS));
const bot = new Bot(new ConfigService(), new SceneCreator(guard));
bot.initBot();
