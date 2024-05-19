import { Colors, colors } from "#settings";
import { ColorResolvable, EmbedBuilder } from "discord.js";

export function embed(key: Colors, message: string) {
    const hexColor = colors[key] as ColorResolvable;
    const embed = new EmbedBuilder()
        .setColor(hexColor)
        .setDescription(message);

    return embed;
}