import { Telegraf } from 'telegraf';
import { BotContext } from '../models/config.model.js';
import { Guard } from '../services/guard.js';
import { Command } from './general.command.js';
import { ScenesID } from '../constants/constants.js';

export class Start extends Command {
  constructor(public bot: Telegraf<BotContext>, private guard: Guard) {
    super(bot);
  }
  public handle(): void {
    this.bot.start(async (ctx) => {
      try {
        const { first_name = 'Stranger', id: userID = 0 } = await ctx.from!;
        if (this.guard.isAuthorized(userID)) {
          await ctx.reply(`Hi dear ${first_name}. Bot has already prepared for conversation`);
        } else {
          await ctx.scene.enter(ScenesID.PASSWORD);
        }
      } catch (err) {
        console.error(err);
      }
    });
  }
}
