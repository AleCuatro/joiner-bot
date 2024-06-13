import { Events } from "discord.js";
import { custom } from "../../func/customLog.js";

export default {
  name: Events.InteractionCreate,
  /**
   * @param {import("discord.js").CommandInteraction} interaction
   */
  async execute(interaction) {
    const command = await interaction.client.commands.get(
      interaction.commandName
    );

    try {
      if (command) {
        if (command.InPermissions) {
          const authPerms = interaction.member.permissions.has(
            command.permissions
          );
          if (!authPerms)
            return interaction.user.send({
              content:
                "You do not have permission to use this command." +
                command.name +
                " " +
                command.InPermissions,
            });
        }

        command.run(interaction);
      }
    } catch (error) {
      custom.error(error);
      interaction.user.send({
        content: error,
      });
    }
  },
};
