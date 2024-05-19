import { log } from "console";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { registerCommands, registerEvents, registerComponents, registerPrefixCommands, registerModals } from "#core";
import chalk from "chalk";

export class DiscordClient extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildScheduledEvents
            ],
            partials: [
                Partials.User,
                Partials.Message,
                Partials.GuildMember,
                Partials.Channel,
                Partials.GuildScheduledEvent,
                Partials.Reaction,
                Partials.ThreadMember
            ],
            failIfNotExists: false
        });

        this.initialize();
    }

    private async initialize() {
        await registerEvents(this);
        await registerComponents(this);
        await registerPrefixCommands(this);
        await registerModals(this);
    }

    async start(token: string, guildId?: string) {
        await this.login(token);

        this.on("ready", async client => {
            const { user } = client;

            await registerCommands(this, token, user.id, guildId);
            log(chalk.cyan(`➤  Client entered as: ${user.displayName}`));
        });
    }
}
