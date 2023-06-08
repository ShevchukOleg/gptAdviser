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
import { OpenAIService } from './services/openAI-service.js';
// import LocalSession from 'telegraf-session-local';

class Bot {
  public bot: Telegraf<BotContext>;
  public stage: any;
  public taskHandlerList: Command[] = [];
  public guard: Guard;
  public scenes = new Map<string, Scenes.BaseScene<BotContext>>();
  constructor(
    private readonly configService: ConfigServiceModel,
    private readonly openAIService: OpenAIService,
    private readonly sceneCreator: SceneCreator,
    public guardInstance: Guard
  ) {
    this.bot = new Telegraf(this.configService.get(EnvConstants.ENV_BOT_TOKEN_KEY));
    this.guard = guardInstance;
    this.taskHandlerList = [
      new Start(this.bot, this.guard),
      new Voice(this.bot, this.guard, this.openAIService),
      new Сorrespondence(this.bot, this.guard),
    ];
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

const configServiceSingleton = new ConfigService();
const guardIns = new Guard(configServiceSingleton.get(EnvConstants.PASS));
const bot = new Bot(
  configServiceSingleton,
  new OpenAIService(configServiceSingleton.get(EnvConstants.OPEN_AI_API_KEY)),
  new SceneCreator(guardIns),
  guardIns
);
bot.initBot();
