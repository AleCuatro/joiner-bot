import { Events } from "discord.js";
import { PrismaClient } from "@prisma/client";
import signale from "signale";

const prisma = new PrismaClient();

export default {
  name: Events.GuildMemberAdd,
  /**
   * @param {import("discord.js").GuildMember} member
   */
  async execute(member) {
    const client = member.client;
    const serverid = member.guild.id;
    const idServer = await prisma.guild.findFirst({
      where: { id: serverid },
      include: { Servidores: true },
    });

    signale.info(`New member joined: ${member.user.tag}`);

    try {
      // Obtener las invitaciones actuales del servidor
      const newInvites = await member.guild.invites.fetch();
      signale.info("Fetched new invites.");

      // Encontrar la invitación usada
      const usedInvite = newInvites.find(
        (inv) => (client.invites.get(inv.code) || 0) < inv.uses
      );

      if (!usedInvite) {
        signale.error("No se pudo encontrar la invitación utilizada.");
        return;
      }

      signale.info(`Used invite found: ${usedInvite.code}`);

      // Encontrar el servidor en la base de datos
      const inviter = await prisma.servidores.findFirst({
        where: { id: idServer.Servidores[0].id },
        include: { server: true },
      });

      if (!inviter) {
        signale.error("No se encontró el servidor en la base de datos.");
        return;
      }

      signale.info(`Server found in database: ${inviter.server.name}`);

      // Comparar el código de la invitación utilizada con el enlace almacenado
      if (inviter.server.link === usedInvite.code) {
        const server = await prisma.servidores.update({
          where: { id: idServer.Servidores[0].id },
          data: { personIn: { decrement: 1 } },
        });

        signale.info(
          `Updated server personIn: ${server.personIn} for serverId: ${server.srvId}`
        );

        await prisma.user.upsert({
          where: {
            id: member.id,
          },
          update: {
            money: { increment: 2 },
          },
          create: { id: member.id, name: member.user.username, money: 2 },
        });

        signale.info(`Updated user's money: ${member.user.tag}`);

        // Si el contador de personas es menor que 0, eliminar el servidor
        if (server.personIn < 0) {
          await member.guild.invites
            .fetch({ code: inviter.server.link })
            .then((invite) => invite.delete())
            .catch((err) => signale.error(`Error deleting invite: ${err}`));

          await prisma.servidores.delete({
            where: { id: idServer.Servidores[0].id },
          });
          await prisma.guild.delete({ where: { id: serverid } });
          signale.fatal("Server deleted");
        }
      }

      // Actualizar el mapa de invitaciones con los nuevos datos
      newInvites.each((inv) => client.invites.set(inv.code, inv.uses));
      signale.info("Updated invites map.");
    } catch (error) {
      signale.error(error);
    }
  },
};
