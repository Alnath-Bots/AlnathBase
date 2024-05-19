import { Event } from "#core";
import { ActivityType } from "discord.js";

export default new Event({
    name: "ready",
    async run(client) {
        const allMembers = await Promise.all(
            client.guilds.cache.map(async guild => {
                await guild.members.fetch();
                const nonBotMembers = guild.members.cache.filter(member => !member.user.bot);
                return nonBotMembers.size; 
            })
        );

        const totalMembers = allMembers.reduce((acc, memberCount) => acc + memberCount, 0);

        client.user.setPresence({
            activities: [
                {
                    name: `Serving ${totalMembers} members!`,
                    type: ActivityType.Playing
                }
            ],
            status: "idle",
        });
    },
});
