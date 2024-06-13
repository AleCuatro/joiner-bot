import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} from "discord.js";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const memberForMoney = 3;

export default {
  name: "member",
  description: "member",
  global: true,
  options: [
    {
      name: "buy",
      description: "buy members for your server.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "pay",
          description: "enter the number of members you want to buy.",
          type: ApplicationCommandOptionType.Number,
          required: true,
        },
      ],
    },
  ],
  /**
   *
   * @param {import("discord.js").CommandInteraction} interaction
   */
  run: async (interaction) => {
    const Subcommand = interaction.options.getSubcommand();
    if (Subcommand) {
      if (Subcommand === "buy") {
        const existGuild = await prisma.servidores.findFirst({
          where: { srvId: interaction.guild.id },
        });
        if (existGuild) {
          return interaction.reply({
            content: "You have already purchased members.",
            ephemeral: true,
          });
        }
        const pay = interaction.options.getNumber("pay");

        const cost = pay * memberForMoney;

        const embed = new EmbedBuilder()
          .setTitle("Confirm Purchase")
          .setDescription(`Surely you want to buy ${pay} members for $${cost}?`)
          .setColor("DarkAqua");

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("confirm")
            .setLabel("Yes")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("No")
            .setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({
          embeds: [embed],
          components: [row],
          ephemeral: true,
        });

        const filter = (i) => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({
          filter,
          time: 60000,
        });

        collector.on("collect", async (i) => {
          if (i.customId === "confirm") {
            const purchase = await prisma.user.findFirst({
              where: { id: interaction.user.id },
            });
            if (purchase.money >= cost) {
              await prisma.user.update({
                where: { id: interaction.user.id },
                data: { money: purchase.money - cost },
              });
              const inviteCreate = interaction.guild.invites.create(
                interaction.channel.id,
                {
                  maxAge: 0,
                }
              );
              const guild = await prisma.guild.create({
                data: {
                  name: interaction.guild.name,
                  id: interaction.guild.id,
                  link: (await inviteCreate).code,
                },
              });
              if (guild) {
                await prisma.servidores.create({
                  data: {
                    srvId: guild.id,
                    personIn: pay,
                  },
                });
                const purchaseSuccess = new EmbedBuilder()
                  .setDescription(`¡Purchase Complete!`)
                  .setColor("Green");
                await i.update({
                  embeds: [purchaseSuccess],
                  components: [],
                  ephemeral: true,
                });
              }
            } else {
              const purchaseCancel = new EmbedBuilder()
                .setDescription(`You don't have enough money to buy this.`)
                .setColor("Red");
              await i.update({
                embeds: [purchaseCancel],
                components: [],
                ephemeral: true,
              });
              return;
            }
            // Aquí puedes agregar el código para manejar la compra
          } else if (i.customId === "cancel") {
            await i.update({
              content: "Purchase canceled.",
              embeds: [],
              components: [],
              ephemeral: true,
            });
          }
        });

        collector.on("end", (collected) => {
          if (collected.size === 0) {
            interaction.editReply({
              content: "No response, purchase canceled.",
              embeds: [],
              components: [],
              ephemeral: true,
            });
          }
        });
      }
    }
  },
};
