import { BotContext } from '../models/config.model';
import { Telegraf } from 'telegraf';

export abstract class Command {
  constructor(public bot: Telegraf<BotContext>) {}
  abstract handle(): void;
}
