import { Telegraf } from 'telegraf';
import { Actions, ScenesID } from '../constants/constants.js';
import { BotContext } from '../models/config.model.js';
import { Guard } from '../services/guard.js';
import { Command } from './general.command.js';

export class BotActions extends Command {
  constructor(public bot: Telegraf<BotContext>, private guard: Guard) {
    super(bot);
  }
  public handle(): void {
    this.bot.action(Actions.INCOMING_PASSWORD_GENERAL, async (ctx) => {
      console.log('BotActions: General chat');
      await ctx.scene.enter(ScenesID.PASSWORD);
    });
  }
}
