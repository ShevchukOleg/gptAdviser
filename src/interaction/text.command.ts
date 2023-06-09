import { ChatCompletionRequestMessage } from 'openai';
import { Markup, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { code } from 'telegraf/format';
import { Actions, InteractionRole } from '../constants/constants.js';
import { BotContext, ContextItem } from '../models/config.model.js';
import { Guard } from '../services/guard.js';
import { OpenAIService } from '../services/openAI-service.js';
import { Command } from './general.command.js';

export class Сorrespondence extends Command {
  public context: Map<number, ContextItem[]> = new Map();
  constructor(public bot: Telegraf<BotContext>, private guard: Guard, private readonly openAIService: OpenAIService) {
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
        const request = ctx.message.text;
        await ctx.reply(
          code(`Request obtained as text message: ${request}.
        Waiting for GPT response.`)
        );
        const requestMessage: ChatCompletionRequestMessage = {
          role: InteractionRole.USER,
          content: request,
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
      }
    });
  }
}
