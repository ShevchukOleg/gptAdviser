import { Markup, Scenes } from 'telegraf';
import { Actions, ScenesID } from '../constants/constants';
import { BotContext } from '../models/config.model';
import { Guard } from './guard';

export class SceneCreator {
  constructor(private readonly guard: Guard) {}

  public getPasswordScene(): Scenes.BaseScene<BotContext> {
    const passwordScene: Scenes.BaseScene<BotContext> = new Scenes.BaseScene<BotContext>(ScenesID.PASSWORD);
    passwordScene.enter(async (ctx) => {
      const { first_name = 'Stranger', id: userID = 0 } = await ctx.from!;
      if (this.guard.isBlocked(userID)) ctx.scene.leave();
      await ctx.replyWithHTML(
        `<b>Привіт ${first_name}, нажаль доспуп обмежено без авторизації 🤨</b>`,
        Markup.inlineKeyboard([[Markup.button.callback('Ввести пароль', Actions.INCOMING_PASSWORD)]])
      );
    });

    passwordScene.leave(async (ctx) => {
      const authorizationStatus = this.guard.isAuthorized() ? 'Authorization compleated.' : 'By🤫';
      ctx.reply(authorizationStatus);
    });

    passwordScene.action(Actions.INCOMING_PASSWORD, async (ctx) => {
      if (this.guard.isBlocked(ctx.from!.id)) ctx.scene.leave();
      await ctx.reply('Будьласка введіть повний стаціонарний телефон будинку 86 Гв. Дивізії №1');
    });
    passwordScene.action(Actions.REJECT_PASSWORD_INPUT, async (ctx) => {
      if (this.guard.isBlocked(ctx.from!.id)) ctx.scene.leave();
      await ctx.reply('У вас залишилось 2 спроби, вас внесено в перелік підозрілих користувачів 😄!');
      this.guard.addSuspects(ctx.from!.id) ? await ctx.scene.leave() : await ctx.reply('Вас тимчасово заблоковано 😏!');
    });

    passwordScene.on('text', (ctx) => {
      if (this.guard.isBlocked(ctx.from!.id)) ctx.scene.leave();
      const password = Number(ctx.message.text);
      if (!isNaN(password)) {
        this.guard.checkPassword(password) ? ctx.scene.leave() : this.handleIncorrectPass(ctx);
      } else {
        this.handleIncorrectPass(ctx);
      }
    });

    passwordScene.command('cancel', async (ctx) => {
      ctx.scene.leave();
      await ctx.reply('Операцію скасовано.');
    });

    passwordScene.on('message', async (ctx) => {
      if (this.guard.isBlocked(ctx.from!.id)) ctx.scene.leave();
      await ctx.reply('Діалог сприймає лише текст');
    });

    return passwordScene;
  }

  private handleIncorrectPass(ctx: BotContext): void {
    const user = ctx.from?.first_name ? ctx.from?.first_name : 'Stranger';
    ctx.replyWithHTML(
      `<b>${user}, було введено нечислове значення.</b>`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback('Спробувати ще', Actions.INCOMING_PASSWORD),
          Markup.button.callback('Відмовитись', Actions.REJECT_PASSWORD_INPUT),
        ],
      ])
    );
  }

  private handleSuspectBehaviour(): void {}
}
