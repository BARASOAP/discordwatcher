import { SlashCommandBuilder, CommandInteraction } from "discord.js";

interface Command {
    data: SlashCommandBuilder;
    execute(interaction: CommandInteraction): Promise<void>;
}

export { Command };