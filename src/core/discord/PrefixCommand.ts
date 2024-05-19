import { readFilesRecursively } from "#utils";
import { Client, Message } from "discord.js";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

interface IPrefixCommand {
    trigger: string;
    aliases: string[];
    run: (message: Message) => void;
}

export class PrefixCommand {
    trigger: string;
    aliases: string[];
    run: (message: Message) => void;

    constructor(params: IPrefixCommand) {
        this.trigger = params.trigger;
        this.aliases = params.aliases;
        this.run = params.run;
    }
}

export async function registerPrefixCommands(client: Client) {
    const commands: PrefixCommand[] = [];

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const commandsPath = join(__dirname, "../../discord/commands/prefix");
    const commandFiles = readFilesRecursively(commandsPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of commandFiles) {
        const filePath = pathToFileURL(join(commandsPath, file)).href;
        const command = (await import(filePath)).default;
        if (command instanceof PrefixCommand) {
            commands.push(command);
        }
    }

    client.on("messageCreate", async (message) => {
        const prefix = process.env.PREFIX;
        if (!prefix) throw new Error("Prefix not defined in environment variables");
        if (!message.content.startsWith(prefix) || message.author.bot) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();
        if (!commandName) return;

        const command = commands.find(cmd => cmd.trigger === commandName || cmd.aliases.includes(commandName));
        if (!command) return;

        try {
            command.run(message);
        } catch (error) {
            console.error(error);
            await message.reply("There was an error executing this command!");
        }
    });
}
