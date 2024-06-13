import { Events } from "discord.js";
import { custom } from "../../func/customLog.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  name: Events.ClientReady,
  /**
   * @param {import("discord.js").Client} client
   */
  async execute(client) {
    custom.discord(`${client.user.username}, is logged!`);

    // Cargar las invitaciones de cada servidor
    client.guilds.cache.forEach(async (guild) => {
      try {
        const guildInvites = await guild.invites.fetch();
        guildInvites.forEach((invite) =>
          client.invites.set(invite.code, invite.uses)
        );
      } catch (error) {
        //console.error(`Error fetching invites for guild ${guild.id}:`, error);
      }
    });
  },
};
