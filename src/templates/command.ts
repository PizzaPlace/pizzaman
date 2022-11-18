import Cli from '../modules/Cli'

export default (cmdName: string) => {
    return `import { ChatInputCommandInteraction } from 'discord.js'
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/PizzaPlaceClient"

export default class ${Cli.formatComponentName(cmdName)} extends SlashCommand {
    constructor(client: BetterClient) {
        super("${cmdName}", client, {
            description: 'None',
        })
    }

    async run(int: ChatInputCommandInteraction) {
        console.warn('Not Implemented')
    }
}    
`
}
