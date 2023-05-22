import { ChannelType, Partials, Client, IntentsBitField, Message, TextChannel, Collection, EmbedBuilder, DMChannel } from 'discord.js';
import { CircularBuffer, loadBufferFromFile, saveBufferToFile } from './circularBuffer';
import * as dotenv from 'dotenv';
dotenv.config()

const TOKEN = process.env.TOKEN;
const WATCHER_ID = process.env.WATCHER_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;
const ADMIN_ID = process.env.ADMIN_ID;
const EMBED_COLOR = parseInt(process.env.EMBED_COLOR as string, 16);
const EMBED_FOOTER_TEXT = process.env.EMBED_FOOTER_TEXT;

if (!WATCHER_ID || !CHANNEL_ID || !TOKEN || !ADMIN_ID || !EMBED_COLOR || !EMBED_FOOTER_TEXT) {
  console.error("Error: Required environment variables are not set.");
  process.exit(1);
}

// Create the following constants after the checks to satisfy TypeScript's type checks
const verifiedAdminId: string = ADMIN_ID;

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

const recentMessages = loadBufferFromFile('recentMessages.json', 15);
const START_TIME = Math.floor(Date.now() / 1000);

// Cooldown for Presence Update
const cooldown = new Collection<string, number>();
const cooldownDuration = 15 * 60 * 1000; 

let debugMode = false;

async function getAdminDMChannel(): Promise<DMChannel> {
  try {
    const adminDM = await client.users.cache.get(verifiedAdminId)?.createDM();
    if (!adminDM) {
      throw new Error('Could not create DM channel for admin.');
    }
    return adminDM;
  } catch (error) {
    console.error("Error getting DM channel for admin:", error);
    process.exit(1);
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
  .setFooter({ text: EMBED_FOOTER_TEXT });

client.once('ready', () => {
  console.log(`Logged in as ${client.user!.tag}!`);
});

client.on('messageCreate', async (message: Message) => {
  if (message.channel.type !== ChannelType.DM) return;
  else if (message.author.id !== ADMIN_ID) return;

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
  if (!newPresence) return; // If the new presence is null, do nothing.
  else if (newPresence.user!.id !== WATCHER_ID) return; // If the user is not the watcher, do nothing.
  
  if (debugMode) {
    sendToAdmin(`State: ${oldPresence?.status}, ${newPresence?.status}\nStatus: ${oldPresence?.activities[0]?.state}, ${newPresence?.activities[0]?.state}`);
  }
  
  if (oldPresence?.status !== newPresence.status) return;

  const oldStatus = oldPresence?.activities[0]?.state ?? null; // Get the old status, or use 'offline' if it's not available.
  const newStatus = newPresence.activities[0]?.state; // Get the new status.

  if (!newStatus && !oldStatus) return; // If the new status is null, do nothing.

  if (newStatus && !recentMessages.contains(newStatus)) {
    const channel = client.channels.cache.get(CHANNEL_ID) as TextChannel;

    if (!channel) return;

    const now = Date.now();
    const lastUpdate = cooldown.get('presenceUpdate');

    if (lastUpdate && now - lastUpdate < cooldownDuration) {
        const timeLeft = ((cooldownDuration - (now - lastUpdate)) / 1000).toFixed(1);
        if (debugMode) {
            sendToAdmin(`Timeout in ${timeLeft} seconds`);
        }
        return;
    }

    cooldown.set('presenceUpdate', now);
    setTimeout(() => cooldown.delete('presenceUpdate'), cooldownDuration);

    newsEmbed.setTitle(`${newStatus}`);
    newsEmbed.setTimestamp(Date.now());
    channel.send({content: `@everyone`, embeds: [newsEmbed]});

    recentMessages.push(newStatus);
    saveBufferToFile('recentMessages.json', recentMessages);

    console.log(`${newPresence.user!.tag} changed status from ${oldStatus} to ${newStatus}.`);
  } else if (debugMode && newStatus) {
      sendToAdmin(`Status already in buffer: ${newStatus}`);
  }

});

client.login(TOKEN);
