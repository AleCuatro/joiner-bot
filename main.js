import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import "dotenv/config";
import EventLoad from "./src/core/handler/events.js";
import buildCollection from "./src/core/handler/collection.js";
import reloadCommandsUpdateToSlash from "./src/core/api/commandUpload.js";

const c = new Client({
  intents: [
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildScheduledEvents,
  ],
});

EventLoad(c, "events");
c.commands = await buildCollection("commands");
c.invites = new Collection();

c.on(Events.InviteCreate, async (invite) => {
  c.invites.set(invite.code, invite);
});

c.on(Events.InviteDelete, (invite) => {
  c.invites.delete(invite.code);
});

reloadCommandsUpdateToSlash();
c.login(process.env.Access);
