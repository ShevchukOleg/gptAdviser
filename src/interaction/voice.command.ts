import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { BotContext } from '../models/config.model.js';
import { Guard } from '../services/guard.js';
import { runtimeError } from '../utils/error.handlers.js';
import { Command } from './general.command.js';
import { ogg } from '../services/ogg.converter.js';

export class Voice extends Command {
  constructor(public bot: Telegraf<BotContext>, private guard: Guard) {
    super(bot);
  }
  public handle(): void {
    this.bot.on(message('voice'), async (ctx) => {
      try {
        const fileId = ctx.message.voice.file_id;
        const { href } = await ctx.telegram.getFileLink(fileId);
        const userId = String(ctx.message.from.id);
        const currentOggPath = ogg.save(href, userId, fileId);
        await ctx.reply(JSON.stringify(href));
      } catch (err: unknown) {
        if (err instanceof Error) {
          runtimeError(`Error while voice query: ${err.message}`);
        } else {
          runtimeError('');
        }
      }
    });
  }
}
