import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  hyperlink,
} from "discord.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const ITEMS_PER_PAGE = 5;

export default {
  name: "servers",
  description: "Shows the servers that the bot is in",
  global: true,
  /**
   *
   * @param {import("discord.js").CommandInteraction} interaction
   */
  async run(interaction) {
    const servers = await prisma.servidores.findMany({
      include: { server: true },
      orderBy: {
        personIn: "asc",
      },
    });

    if (servers.length === 0) {
      return interaction.reply("No servers found.");
    }

    let currentPage = 0;
    const totalPages = Math.ceil(servers.length / ITEMS_PER_PAGE);

    const generateEmbed = (page) => {
      const start = page * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const serverSlice = servers.slice(start, end);

      const embed = new EmbedBuilder()
        .setDescription(`## Servers List \n`)
        .setFooter({
          text: `Page ${page + 1}/${totalPages} || win 2 coins for join.`,
        })
        .setImage(
          "https://images-ext-1.discordapp.net/external/QAX--lYd9lWX5SPra6fQtgHATVZCW7VkbfFnTeWNKZ8/%3Fsize%3D2048/https/cdn.discordapp.com/banners/951839520247136296/a_0cefc3c218b5dea21f7eba120a11f786.gif?width=373&height=210"
        );

      serverSlice.forEach((srv) => {
        embed.addFields({
          name: srv.server.name,
          value: `[**JOIN**](https://discord.gg/${srv.server.link}) - Request Members: ${srv.personIn}`,
          inline: false,
        });
      });

      return embed;
    };

    const generateButtons = (page) => {
      const row = new ActionRowBuilder();

      if (page > 0) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId("prev_page")
            .setLabel("Previous")
            .setStyle(ButtonStyle.Primary)
        );
      }

      if (page < totalPages - 1) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId("next_page")
            .setLabel("Next")
            .setStyle(ButtonStyle.Primary)
        );
      }

      return row.components.length > 0 ? [row] : [];
    };

    await interaction.reply({
      embeds: [generateEmbed(currentPage)],
      components: generateButtons(currentPage),
    });

    const filter = (i) =>
      i.customId === "prev_page" || i.customId === "next_page";

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000, // 1 minute
    });

    collector.on("collect", async (i) => {
      if (i.customId === "prev_page") {
        currentPage--;
      } else if (i.customId === "next_page") {
        currentPage++;
      }

      await i.update({
        embeds: [generateEmbed(currentPage)],
        components: generateButtons(currentPage),
      });
    });
  },
};
