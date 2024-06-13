import path from "path"
import fs from "fs"
import { custom } from "../../../func/customLog.js"


export default async function EventLoad(client, folder) {
    let eventPath = path.resolve("src", folder)
    try {
        const eventsFiles = fs.readdirSync(eventPath).filter((file) => file.endsWith(".js"))
        for (const file of eventsFiles) {
            const filePath = path.join(eventPath, file)
            const { default: event } = await import(`file://${filePath}`)

            custom.event(`${event.name} loaded!`)

            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args))
            } else {
                client.on(event.name, (...args) => event.execute(...args))
            }
        }

    } catch (error) {
        custom.eventErr(`${error}`)
    }
}
