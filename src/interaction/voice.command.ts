import { ChatCompletionRequestMessage } from 'openai';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { code } from 'telegraf/format';
import { InteractionRole } from '../constants/constants.js';
import { BotContext, ContextItem } from '../models/config.model.js';
import { Guard } from '../services/guard.js';
import { ogg } from '../services/ogg.converter.js';
import { OpenAIService } from '../services/openAI-service.js';
import { runtimeError } from '../utils/error.handlers.js';
import { Command } from './general.command.js';

export class Voice extends Command {
  public context: Map<number, ContextItem[]> = new Map();
  constructor(public bot: Telegraf<BotContext>, private guard: Guard, private readonly openAIService: OpenAIService) {
    super(bot);
  }
  public handle(): void {
    this.bot.on(message('voice'), async (ctx) => {
      try {
        const userID = ctx.from!.id;
        if (this.guard.isAuthorized(userID)) {
          const fileId = ctx.message.voice.file_id;
          const { href } = await ctx.telegram.getFileLink(fileId);
          const userId = String(ctx.message.from.id);
          await ctx.reply(code(`Request obtained: ${href}. Waiting for transpilation into text.`));
          const currentOggPath = await ogg.save(href, userId, fileId);

          const convertedMP3 = await ogg.toMp3(currentOggPath);
          const messageText = await this.openAIService.transcription(convertedMP3);
          console.log('OpenAI voice transcription:', messageText);
          await ctx.reply(code(`My request is: ${messageText}`));
          const requestMessage: ChatCompletionRequestMessage = {
            role: InteractionRole.USER,
            content: messageText,
          };
          const userChatContext = this.context.get(userID);
          if (!userChatContext || !userChatContext.length) {
            this.context.set(userID, [requestMessage]);
          } else {
            const updatedUserChatContext = [...userChatContext];
            updatedUserChatContext.push(requestMessage);
            this.context.set(userID, updatedUserChatContext);
          }
          const dialog = this.context.get(userID)!;
          const response = await this.openAIService.chat(dialog);
          console.log('GPT response:', response);

          const context = this.context.get(userID);
          const updatedContext = context?.length ? [...context] : [];
          !!response ? updatedContext.push(response) : null;
          this.context.set(userID, updatedContext);
          await ctx.reply(response?.content ?? 'Something went wrong');
        } else {
          await ctx.reply(code('Sorry you are not authorized for usage voice interaction.'));
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          runtimeError(`Error while voice query: ${err.message}`);
        } else {
          runtimeError('');
        }
      }
    });

    this.bot.command('new', async (ctx) => {
      const userID = ctx.from!.id;
      if (this.guard.isAuthorized(userID)) {
        this.context.set(ctx.from!.id, []);
        await ctx.reply('Context erased, please start new dialog.');
      } else {
        ctx.reply('Command not available for not authorized users😏');
      }
    });
  }
}
