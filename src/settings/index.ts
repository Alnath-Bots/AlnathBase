import emojis from "./json/emojis.json" assert { type: "json" };
import colors from "./json/colors.json" assert { type: "json" };
import configs from "./json/guild.json" assert { type: "json" };

export { emojis, colors, configs };

export type Emojis = keyof typeof emojis;
export type Colors = keyof typeof colors;
export type Config = keyof typeof configs;