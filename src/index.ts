import { ChannelType, Partials, Client, IntentsBitField, Message, TextChannel, Collection, EmbedBuilder, DMChannel } from 'discord.js';
import config from './config.json';
import * as dotenv from 'dotenv';
dotenv.config()

const TOKEN = process.env.TOKEN;

if (!config.WATCHER_ID || !config.CHANNEL_ID || !TOKEN) {
  console.error("Error: Required environment variables WATCHER_ID, CHANNEL_ID, and TOKEN are not set.");
  process.exit(1);
}

const client = new Client({ 
  partials: [
    Partials.Message, 
    Partials.Channel
  ], 
  intents: [
    IntentsBitField.Flags.Guilds, 
    IntentsBitField.Flags.GuildMessages, 
    IntentsBitField.Flags.MessageContent, 
    IntentsBitField.Flags.GuildPresences, 
    IntentsBitField.Flags.DirectMessages
  ] 
});

const START_TIME = Math.floor(Date.now() / 1000);
const EMBED_COLOR = parseInt(config.EMBED_COLOR, 16);

// Cooldown for Presence Update
const cooldown = new Collection<string, number>();
const cooldownDuration = 15 * 60 * 1000; 

let debugMode = false;

async function getAdminDMChannel(): Promise<DMChannel | undefined> {
  try {
    const adminDM = await client.users.cache.get(config.ADMIN_ID)?.createDM();
    return adminDM;
  } catch (error) {
    console.error("Error getting DM channel for admin:", error);
  }
}

// function set debug
async function setDebug(debug: boolean) {
  debugMode = debug;
  const adminDMChannel = await getAdminDMChannel();
  if (adminDMChannel) {
    adminDMChannel.send(`Debug mode is now ${debugMode}`);
  }
}

// send to admin
async function sendToAdmin(message: string) {
  const adminDMChannel = await getAdminDMChannel();
  if (adminDMChannel) {
    adminDMChannel.send(message);
  }
}

const newsEmbed = new EmbedBuilder()
  .setColor(EMBED_COLOR)
  .setFooter({ text: config.EMBED_FOOTER_TEXT });

client.once('ready', () => {
  console.log(`Logged in as ${client.user!.tag}!`);
});

client.on('messageCreate', async (message: Message) => {
  if (message.channel.type !== ChannelType.DM) return;
  else if (message.author.id !== config.ADMIN_ID) return;

  // Check if message content is 'debug true' and read value after
  if (message.content.startsWith('debug')) { 
    const debug = message.content.split(' ')[1];
    if (debug === 'true') {
      setDebug(true);
    } else if (debug === 'false') {
      setDebug(false);
    } else if (debug === 'status') {
      message.channel.send(`Online since <t:${START_TIME}:F> | Debug mode is ${debugMode}`);
    } else if (debug === 'cleartimeout') {
      if (cooldown.has('presenceUpdate')) {
        cooldown.delete('presenceUpdate');
        message.channel.send('Cleared timeout');
      } else {
        message.channel.send('No timeout to clear');
      }
    } else if (debug === 'gettimeout') {
      if (cooldown.has('presenceUpdate')) {
        const lastUpdate = cooldown.get('presenceUpdate')!;
        const timeLeft = ((cooldownDuration - (Date.now() - lastUpdate)) / 1000).toFixed(1);
        message.channel.send(`Timeout in ${timeLeft} seconds`);
      } else {
        message.channel.send('No timeout');
      }
    } else {
      message.channel.send(`Invalid debug command ${debug}`);
    }
  }
});

client.on('presenceUpdate', async (oldPresence, newPresence) => {
  if (debugMode) {
    sendToAdmin(`State: ${oldPresence?.status}, ${newPresence?.status}\nStatus: ${oldPresence?.activities[0]?.state}, ${newPresence?.activities[0]?.state}`);
  }
  if (!newPresence) return; // If the new presence is null, do nothing.
  else if (newPresence.user!.id !== config.WATCHER_ID) return; // If the user is not the watcher, do nothing.
  else if (oldPresence?.status !== newPresence.status) return;

  const oldStatus = oldPresence?.activities[0]?.state ?? null; // Get the old status, or use 'offline' if it's not available.
  const newStatus = newPresence.activities[0]?.state; // Get the new status.

  if (!newStatus || !oldStatus) return; // If the new status is null, do nothing.

  if (oldStatus !== newStatus) {
    const channel = client.channels.cache.get(config.CHANNEL_ID) as TextChannel;

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
    newsEmbed.setTimestamp(Date.now())
    channel.send({content: `@everyone`, embeds: [newsEmbed] });

    console.log(
      `${newPresence.user!.tag} changed status from ${oldStatus} to ${newStatus}.`
    );
  }
});

client.login(TOKEN);
