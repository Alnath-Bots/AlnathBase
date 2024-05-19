import { DiscordClient } from "#core";
import "dotenv/config";

const client = new DiscordClient();

client.start(process.env.TOKEN);