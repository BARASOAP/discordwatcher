import { Client, Collection, ClientOptions, IntentsBitField } from 'discord.js';
import { Command } from './commands/command';

class BotClient extends Client {
  commands: Collection<string, Command>;

  constructor(options?: ClientOptions) {
    super(options || { intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages] });
    this.commands = new Collection();
  }
}

export { BotClient };