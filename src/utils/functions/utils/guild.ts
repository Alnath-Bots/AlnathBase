import { Config, configs } from "#settings";

export function guild(key: Config) {
    const config = configs[key];
    return config;
}
