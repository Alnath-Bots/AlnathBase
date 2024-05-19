import { Client, Interaction, ComponentType, ButtonInteraction, StringSelectMenuInteraction, RoleSelectMenuInteraction, UserSelectMenuInteraction } from "discord.js";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { readFilesRecursively } from "#utils";

type ComponentInteraction = ButtonInteraction | StringSelectMenuInteraction | RoleSelectMenuInteraction | UserSelectMenuInteraction;

interface IComponent<T extends ComponentInteraction> {
    customId: string;
    type: T["componentType"];
    run: (interaction: T) => Promise<void>;
}

export class Component<T extends ComponentInteraction> {
    customId: string;
    type: T["componentType"];
    run: (interaction: T) => Promise<void>;

    constructor(params: IComponent<T>) {
        this.customId = params.customId;
        this.type = params.type;
        this.run = params.run;
    }
}

export async function registerComponents(client: Client) {
    const components: Component<ComponentInteraction>[] = [];
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const componentsPath = join(__dirname, "../../discord/components");
    const componentFiles = readFilesRecursively(componentsPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of componentFiles) {
        const filePath = pathToFileURL(join(componentsPath, file)).href;
        const component = (await import(filePath)).default;
        if (component instanceof Component) {
            components.push(component);
        }
    }

    client.on("interactionCreate", async (interaction: Interaction) => {
        if (!interaction.isMessageComponent()) return;

        const component = components.find(comp => comp.customId === interaction.customId && comp.type === interaction.componentType);
        if (!component) return;

        try {
            switch (interaction.componentType) {
                case ComponentType.Button:
                    await component.run(interaction as ButtonInteraction);
                    break;
                case ComponentType.StringSelect:
                    await component.run(interaction as StringSelectMenuInteraction);
                    break;
                case ComponentType.RoleSelect:
                    await component.run(interaction as RoleSelectMenuInteraction);
                    break;
                case ComponentType.UserSelect:
                    await component.run(interaction as UserSelectMenuInteraction);
                    break;
                default:
                    throw new Error("Unsupported interaction type");
            }
        } catch (error) {
            console.error(error);
            if (interaction.isRepliable()) {
                await interaction.reply({ content: "An error occurred while executing this component!", ephemeral: true });
            }
        }
    });
}
