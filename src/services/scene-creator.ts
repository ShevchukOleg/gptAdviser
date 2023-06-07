import { Markup, Scenes } from 'telegraf';
import { Actions, ScenesID } from '../constants/constants.js';
import { BotContext } from '../models/config.model.js';
import { Guard } from './guard.js';

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
      const authorizationStatus = this.guard.isAuthorized(ctx.from!.id)
        ? 'Authorization compleated.'
        : 'Ви покинули діалог авторизації🤫';
      ctx.reply(authorizationStatus);
    });

    passwordScene.action(Actions.INCOMING_PASSWORD, async (ctx) => {
      console.log('Password scene generator action hendler: INCOMING_PASSWORD');
      if (this.guard.isBlocked(ctx.from!.id)) ctx.scene.leave();
      await ctx.reply('Будьласка введіть повний стаціонарний телефон будинку 86 Гв. Дивізії №1');
    });

    passwordScene.action(Actions.REJECT_PASSWORD_INPUT, async (ctx) => {
      if (this.guard.isBlocked(ctx.from!.id)) ctx.scene.leave();
      await ctx.reply('Кількість спроб вводу паролю обмежена трьома, вас внесено в перелік підозрілих користувачів 😄!');
      this.guard.addSuspects(ctx.from!.id)
        ? await ctx.scene.leave()
        : (await ctx.reply('Вас тимчасово заблоковано 😏!'), await ctx.scene.leave());
    });

    passwordScene.action(Actions.BAN, async (ctx) => {
      await ctx.reply('Вас тимчасово заблоковано 😶‍🌫️!');
      this.guard.banUser(ctx.from!.id);
    });

    passwordScene.on('text', (ctx) => {
      const userID = ctx.from!.id;
      if (this.guard.isBlocked(userID)) ctx.scene.leave();
      const password = Number(ctx.message.text);
      if (!isNaN(password)) {
        this.guard.checkPassword(ctx.message.text, userID) ? ctx.scene.leave() : this.handleIncorrectPass(ctx, 'невірне');
      } else {
        this.handleIncorrectPass(ctx, 'не числове');
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

  private handleIncorrectPass(ctx: BotContext, reason: string): void {
    const { first_name = 'Stranger', id: userID = 0 } = ctx.from!;
    if (this.guard.isUserSuspected(userID)) {
      this.handleSuspectBehaviour(ctx);
    }

    ctx.replyWithHTML(
      `<b>${first_name}, було введено ${reason} значення.</b>`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback('Спробувати ще', Actions.INCOMING_PASSWORD),
          Markup.button.callback('Відмовитись', Actions.REJECT_PASSWORD_INPUT),
        ],
      ])
    );
  }

  private handleSuspectBehaviour(ctx: BotContext): void {
    const { first_name = 'Stranger', id: userID = 0 } = ctx.from!;
    const attemptCount = this.guard.getSuspectAttempt(userID);
    ctx.replyWithHTML(
      `<b>${first_name}, чи готові ви ввести коректний пароль? Залишилось ${attemptCount} спроб! </b>`,
      Markup.inlineKeyboard([
        [Markup.button.callback('Так', Actions.INCOMING_PASSWORD), Markup.button.callback('Ні', Actions.BAN)],
      ])
    );
  }
}
