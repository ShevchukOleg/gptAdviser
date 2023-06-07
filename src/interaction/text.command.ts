import { Markup, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { Actions } from '../constants/constants.js';
import { BotContext } from '../models/config.model.js';
import { Guard } from '../services/guard.js';
import { Command } from './general.command.js';

export class Сorrespondence extends Command {
  constructor(public bot: Telegraf<BotContext>, private guard: Guard) {
    super(bot);
  }
  public handle(): void {
    this.bot.on(message('text'), async (ctx) => {
      const { first_name = 'Stranger', id: userID = 0 } = await ctx.from!;
      if (this.guard.isUserSuspected(userID) && !this.guard.isAuthorized(userID)) {
        await ctx.replyWithHTML(
          `<b>То що, ${first_name}, авторизуємось? 🤞</b>`,
          Markup.inlineKeyboard([[Markup.button.callback('Ввести пароль', Actions.INCOMING_PASSWORD_GENERAL)]])
        );
      } else if (!this.guard.isUserSuspected(userID) && !this.guard.isAuthorized(userID)) {
        await ctx.reply(
          `Перед початком роботи чату введіть "/start" пройдіть авторизацію і користуйтесь голосовим помічником. Для виводу усіх доступних команд введіть "/help".`
        );
      } else if (this.guard.isAuthorized(userID)) {
        ctx.reply('GPT ready ))');
      }
    });
  }
}
