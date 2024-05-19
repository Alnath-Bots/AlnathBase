import { PrefixCommand } from "#core";

export default new PrefixCommand({
    trigger: "ping",
    aliases: ["ws"],
    async run(message) {
        const { client } = message;

        const ws = client.ws.ping;

        await message.reply({ content: `🏓 Pong: \`${ws}\`ms`, });
    },
});