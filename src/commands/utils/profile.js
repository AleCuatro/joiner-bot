import { PrismaClient } from "@prisma/client";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";

const prisma = new PrismaClient();

export default {
  name: "profile",
  description: "Shows the profile of a user",
  global: true,
  options: [
    {
      name: "user",
      description: "The user to show the profile of",
      type: ApplicationCommandOptionType.User,
    },
  ],
  /**
   *
   * @param {import("discord.js").CommandInteraction} interaction
   */
  async run(interaction) {
    const user = await prisma.user.findUnique({
      where: {
        id: interaction.user.id || interaction.options.getUser("user").id,
      },
    });
    const avatar = interaction.client.user.fetch(user.id);
    const embed = new EmbedBuilder()
      .setAuthor({
        name: `@${user.name}`,
      })
      .setThumbnail((await avatar).displayAvatarURL({ dynamic: true }))
      .addFields({
        name: "Stats",
        value: `Money: ${user.money}`,
      });
    interaction.reply({ embeds: [embed] });
  },
};
