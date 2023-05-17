import { Scenes, Telegraf, session } from 'telegraf';
import { ENV_BOT_TOKEN_KEY, ScenesID } from './constants/constants';
import { Command } from './interaction/general.command';
import { Start } from './interaction/start.command';
import { Сorrespondence } from './interaction/text.command';
import { Voice } from './interaction/voice.command';
import { BotContext, ConfigServiceModel } from './models/config.model';
import { ConfigService } from './services/config.s';
import { Guard } from './services/guard';
import { SceneCreator } from './services/scene-creator';
// import LocalSession from 'telegraf-session-local';

class Bot {
  public bot: Telegraf<BotContext>;
  public stage: any;
  public taskHandlerList: Command[] = [];
  public guard = guard;
  public scenes = new Map<string, Scenes.BaseScene<BotContext>>();
  constructor(private readonly configService: ConfigServiceModel, private readonly sceneCreator: SceneCreator) {
    this.bot = new Telegraf(this.configService.get(ENV_BOT_TOKEN_KEY));
    this.taskHandlerList = [new Start(this.bot, guard), new Voice(this.bot), new Сorrespondence(this.bot)];
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

const guard = new Guard(1);
const bot = new Bot(new ConfigService(), new SceneCreator(guard));
bot.initBot();
