import { Telegraf } from 'telegraf';
import { BotContext } from '../models/config.model';
import { Command } from './general.command';
import { message } from 'telegraf/filters';
import { runtimeError } from '../utils/error.handlers';

export class Voice extends Command {
  constructor(public bot: Telegraf<BotContext>) {
    super(bot);
  }
  public handle(): void {
    this.bot.on(message('voice'), async (ctx) => {
      try {
        const { href } = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
        const userId = String(ctx.message.from.id);
      } catch (err: unknown) {
        if (err instanceof Error) {
          runtimeError(`Error while voice query: ${err.message}`);
        } else {
          runtimeError('');
        }
      }
      await ctx.reply(JSON.stringify(ctx.message));
    });
  }
}
