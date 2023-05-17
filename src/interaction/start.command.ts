import { Markup, Telegraf } from 'telegraf';
import { BotContext } from '../models/config.model';
import { Guard } from '../services/guard';
import { Command } from './general.command';
import { ScenesID } from '../constants/constants';

export class Start extends Command {
  constructor(public bot: Telegraf<BotContext>, private guard: Guard) {
    super(bot);
  }
  public handle(): void {
    this.bot.start(async (ctx) => {
      try {
        const user = (await ctx.from.first_name) ? ctx.from.first_name : 'Stranger';
        if (this.guard.isAuthorized()) {
          await ctx.reply(`Hi dear ${user}. Bot has already prepared for conversation`);
        } else {
          await ctx.scene.enter(ScenesID.PASSWORD);
        }
      } catch (err) {
        console.error(err);
      }
    });
  }
}
