import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Command } from "./command";

const command: Command = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with pong!"),
    async execute(interaction: CommandInteraction) {
        await interaction.reply("Pong!");
    }
};

export default command;