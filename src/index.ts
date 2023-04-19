import { Activity, Client, IntentsBitField, Message, TextChannel, Collection, EmbedBuilder } from 'discord.js';
import * as dotenv from 'dotenv'
dotenv.config()

const client = new Client({ intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent, IntentsBitField.Flags.GuildPresences] });

// User ID of the watcher
const watcher = process.env.WATCHER_ID

// Channel ID to send the message to
const channelID = process.env.CHANNEL_ID

// Cooldown for Presence Update
const cooldown = new Collection<string, number>();
const cooldownDuration = 15 * 60 * 1000; 

client.once('ready', () => {
  console.log(`Logged in as ${client.user!.tag}!`);
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
  if (!newPresence) return; // If the new presence is null, do nothing.

  if (newPresence.user!.id !== watcher) return; // If the user is not the watcher, do nothing.

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
    }

    cooldown.set('presenceUpdate', now);
    setTimeout(() => cooldown.delete('presenceUpdate'), cooldownDuration);

    const newsEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle(`${newStatus}`)
      .setTimestamp(Date.now())
      .setFooter({ text: 'TAKASUI NEWS NETWORK' });

    channel.send({content: `@everyone`, embeds: [newsEmbed] });
    
    console.log(
      `${newPresence.user!.tag} changed status from ${oldStatus} to ${newStatus}.`
    );
  }
});

client.login(process.env.TOKEN);
