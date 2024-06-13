import fs from "fs";
import "dotenv/config";
import path from "path";
import { REST, Routes } from "discord.js";
import chalk from "chalk";

const rest = new REST().setToken(process.env.Access);

export default async function reloadCommandsUpdateToSlash() {
  async function commandUpdate() {
    let commands = {
      global: [],
      private: [],
    };

    const foldersPath = path.join(process.cwd(), "src", "commands");
    let commandFolders;
    try {
      commandFolders = fs.readdirSync(foldersPath);
    } catch (error) {
      console.error(`Error reading command folders: ${error}`);
      return commands;
    }

    for (const folder of commandFolders) {
      const commandsPath = path.join(foldersPath, folder);
      let commandFiles;
      try {
        commandFiles = fs
          .readdirSync(commandsPath)
          .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
      } catch (error) {
        console.error(
          `Error reading command files in folder ${folder}: ${error}`
        );
        continue;
      }

      for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const fileUrl = new URL(`file://${filePath}`);
        try {
          const { default: command } = await import(fileUrl);

          if (command.private) {
            commands.private.push(command);
          } else {
            commands.global.push(command);
          }
        } catch (error) {
          console.error(`Error importing command file ${file}: ${error}`);
        }
      }
    }
    console.log(commands);
    return commands;
  }

  const { global: globalCommands } = await commandUpdate();
  updateGlobal(globalCommands);

  async function updateGlobal(commands) {
    try {
      console.log(
        chalk.white("[ ") +
          chalk.hex("#ff5733")("GLOBAL") +
          chalk.white(" ]") +
          chalk.greenBright(
            `· Started | in | ${chalk.white("0")} | application ${chalk.white(
              "(/)"
            )} commands.`
          )
      );
      const data =
        (await rest.put(Routes.applicationCommands(process.env.id), {
          body: commands,
        })) || [];

      console.log(
        chalk.white("[ ") +
          chalk.green("GLOBAL") +
          chalk.white(" ]") +
          chalk.greenBright(
            `· Done | in | ${chalk.white(
              data.length
            )} | application ${chalk.white("(/)")} commands.`
          )
      );
    } catch (error) {
      console.error(error);
    }
  }
}
