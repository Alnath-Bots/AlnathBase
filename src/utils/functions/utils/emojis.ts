import { Emojis, emojis } from "#settings";

export function icon(key: Emojis) {
    const emoji = emojis[key];
    return emoji;
}
