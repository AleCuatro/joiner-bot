import { Events } from "discord.js";
import { custom } from "../../func/customLog.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  name: Events.TypingStart,
  async execute(typing) {
    const user = await prisma.user.findFirst({
      where: {
        id: typing.user.id,
      },
    });
    if (!user) {
      await prisma.user.create({
        data: {
          id: typing.user.id,
          name: typing.user.username,
          money: 0,
        },
      });
    }
  },
};
