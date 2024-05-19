import chalk from "chalk";
import { CommandInteraction, ApplicationCommandOptionData, REST, Routes, Client } from "discord.js";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { readFilesRecursively } from "#utils";

interface ISlashCommand<T extends CommandInteraction = CommandInteraction> {
    name: string;
    description: string;
    options?: ApplicationCommandOptionData[];
    dmPermission?: boolean;
    defaultMemberPermissions?: string | number;
    type: 1 | 2 | 3;
    run: (interaction: T) => Promise<void>;
}

export class SlashCommand {
    name: string;
    description: string;
    options?: ApplicationCommandOptionData[];
    dmPermission?: boolean;
    defaultMemberPermissions?: string | number;
    type?: 1 | 2 | 3;
    run: (interaction: CommandInteraction) => Promise<void>;

    constructor(params: ISlashCommand) {
        this.name = params.name;
        this.description = params.description;
        this.options = params.options;
        this.dmPermission = params.dmPermission;
        this.defaultMemberPermissions = params.defaultMemberPermissions;
        this.type = params.type;
        this.run = params.run;
    }
}

export async function registerCommands(client: Client, token: string, clientId: string, guildId?: string) {
    const commands: SlashCommand[] = [];

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const commandsPath = join(__dirname, "../../discord/commands/slash");
    const commandFiles = readFilesRecursively(commandsPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of commandFiles) {
        const filePath = pathToFileURL(join(commandsPath, file)).href;
        const command = (await import(filePath)).default;
        if (command instanceof SlashCommand) {
            commands.push(command);
        }
    }

    const rest = new REST({ version: "10" }).setToken(token);

    try {
        const numCommands = commands.length;

        console.log(chalk.green(`↪  Started refreshing application (/) commands. [${numCommands}]`));

        const commandData = commands.map(command => ({
            name: command.name,
            description: command.description,
            options: command.options,
            defaultPermission: command.dmPermission,
            defaultMemberPermissions: command.defaultMemberPermissions,
            type: command.type
        }));

        if (guildId) {
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commandData }
            );
        } else {
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: commandData }
            );
        }

        console.log(chalk.green("↪  Successfully reloaded application (/) commands."));
    } catch (error) {
        console.error(error);
    }

    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) return;

        if (!interaction.guild) {
            await interaction.reply({ content: "This command cannot be used in direct messages.", ephemeral: true });
            return;
        }

        const command = commands.find(cmd => cmd.name === interaction.commandName);
        if (!command) return;

        try {
            await command.run(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "An error occurred while executing this command!", ephemeral: true });
        }
    });
}
