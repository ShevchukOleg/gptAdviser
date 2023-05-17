import { Telegraf } from 'telegraf';
import { BotContext } from '../models/config.model';
import { Command } from './general.command';
import { message } from 'telegraf/filters';

export class Сorrespondence extends Command {
  constructor(public bot: Telegraf<BotContext>) {
    super(bot);
  }
  public handle(): void {
    this.bot.on(message('text'), async (ctx) => {
      await ctx.reply(JSON.stringify(ctx.message));
    });
  }
}
