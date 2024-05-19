import { Client, ClientEvents } from "discord.js";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { readFilesRecursively } from "#utils";

interface IEvent<Key extends keyof ClientEvents> {
    name: Key;
    run: (...args: ClientEvents[Key]) => void;
}

export class Event<Key extends keyof ClientEvents> {
    name: Key;
    run: (...args: ClientEvents[Key]) => void;

    constructor(params: IEvent<Key>) {
        this.name = params.name;
        this.run = params.run;
    }
}

export async function registerEvents(client: Client) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const eventsPath = join(__dirname, "../../discord/events");
    const eventFiles = readFilesRecursively(eventsPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of eventFiles) {
        const filePath = pathToFileURL(join(eventsPath, file)).href;
        const event = (await import(filePath)).default;
        if (event instanceof Event) {
            client.on(event.name, event.run);
        }
    }
}