import { Client, Interaction, ModalSubmitInteraction } from "discord.js";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { readFilesRecursively } from "#utils";

interface IModal {
    customId: string;
    run: (interaction: ModalSubmitInteraction) => void;
}

export class Modal {
    customId: string;
    run: (interaction: ModalSubmitInteraction) => void;

    constructor(params: IModal) {
        this.customId = params.customId;
        this.run = params.run;
    }
}

export async function registerModals(client: Client) {
    const modals: Modal[] = [];

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const modalsPath = join(__dirname, "../../discord/components");
    const modalFiles = readFilesRecursively(modalsPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of modalFiles) {
        const filePath = pathToFileURL(join(modalsPath, file)).href;
        const modal = (await import(filePath)).default;
        if (modal instanceof Modal) {
            modals.push(modal);
        }
    }

    client.on("interactionCreate", async (interaction: Interaction) => {
        if (!interaction.isModalSubmit()) return;

        const modal = modals.find(md => md.customId === interaction.customId);
        if (!modal) return;

        try {
            modal.run(interaction as ModalSubmitInteraction);
        } catch (error) {
            console.error(error);
        }
    });
}
