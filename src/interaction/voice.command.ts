import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { BotContext } from '../models/config.model.js';
import { Guard } from '../services/guard.js';
import { ogg } from '../services/ogg.converter.js';
import { runtimeError } from '../utils/error.handlers.js';
import { Command } from './general.command.js';
import { OpenAIService } from '../services/openAI-service.js';

export class Voice extends Command {
  constructor(public bot: Telegraf<BotContext>, private guard: Guard, private readonly openAIService: OpenAIService) {
    super(bot);
  }
  public handle(): void {
    this.bot.on(message('voice'), async (ctx) => {
      try {
        const fileId = ctx.message.voice.file_id;
        const { href } = await ctx.telegram.getFileLink(fileId);
        const userId = String(ctx.message.from.id);
        const currentOggPath = await ogg.save(href, userId, fileId);

        const convertedMP3 = await ogg.toMp3(currentOggPath);
        const messageText = await this.openAIService.transcription(convertedMP3);
        const response = await this.openAIService.chat(messageText);
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
