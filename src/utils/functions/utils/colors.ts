import { Colors, colors } from "#settings";

export function color(key: Colors) {
    const color = colors[key];

    return color;
}