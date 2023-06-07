import { BotContext } from '../models/config.model.js';
import { Telegraf } from 'telegraf';

export abstract class Command {
  constructor(public bot: Telegraf<BotContext>) {}
  abstract handle(): void;
}
