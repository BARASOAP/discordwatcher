import { Activity, Client, IntentsBitField, Message, TextChannel, Collection, EmbedBuilder } from 'discord.js';
import * as dotenv from 'dotenv'
dotenv.config()

const { WATCHER_ID, CHANNEL_ID, TOKEN } = process.env;

if (!WATCHER_ID || !CHANNEL_ID || !TOKEN) {
  console.error("Error: Required environment variables WATCHER_ID, CHANNEL_ID, and TOKEN are not set.");
  process.exit(1);
}

const watcher = WATCHER_ID;
const channelID = CHANNEL_ID;
const EMBED_COLOR = 0x0099FF;
const EMBED_FOOTER_TEXT = 'TAKASUI NEWS NETWORK';

const client = new Client({ intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent, IntentsBitField.Flags.GuildPresences] });

// Cooldown for Presence Update
const cooldown = new Collection<string, number>();
const cooldownDuration = 1 * 1 * 1000; 

const newsEmbed = new EmbedBuilder()
  .setColor(EMBED_COLOR)
  .setTimestamp(Date.now())
  .setFooter({ text: EMBED_FOOTER_TEXT });

client.once('ready', () => {
  console.log(`Logged in as ${client.user!.tag}!`);
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
  if (!newPresence) return; // If the new presence is null, do nothing.
  else if (newPresence.user!.id !== watcher) return; // If the user is not the watcher, do nothing.
  else if (oldPresence?.status === 'offline' || newPresence.status === 'online') return;

  const oldStatus = oldPresence?.activities[0]?.state ?? null; // Get the old status, or use 'offline' if it's not available.
  const newStatus = newPresence.activities[0]?.state; // Get the new status.

  if (!newStatus) return; // If the new status is null, do nothing.

  if (oldStatus !== newStatus) {
    const channel = client.channels.cache.get(channelID) as TextChannel;

    if (!channel) return;

    const now = Date.now();
    const lastUpdate = cooldown.get('presenceUpdate');

    if (lastUpdate && now - lastUpdate < cooldownDuration) {
      const timeLeft = ((cooldownDuration - (now - lastUpdate)) / 1000).toFixed(1);
      console.log(`${timeLeft} until available`);
      return;
    } else {
      cooldown.set('presenceUpdate', now);
      setTimeout(() => cooldown.delete('presenceUpdate'), cooldownDuration);
    }

    newsEmbed.setTitle(`${newStatus}`)
    channel.send({content: `@everyone`, embeds: [newsEmbed] });
    
    console.log(
      `${newPresence.user!.tag} changed status from ${oldStatus} to ${newStatus}.`
    );
  }
});

client.login(TOKEN);
