import { ApplicationCommandType } from "discord.js";
import { SlashCommand } from "#core";
import { icon } from "#utils";

export default new SlashCommand({
    name: "ping",
    description: "Replies with Pong!",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    async run(interaction) {
        const { client } = interaction;

        const ws = client.ws.ping;

        let latency: string;

        if (ws > 100) {
            latency = icon("noping");
        } else {
            latency = icon("stableping");
        }

        await interaction.reply({ content: `${latency} Pong: \`${ws}\`ms` });
    },
});
