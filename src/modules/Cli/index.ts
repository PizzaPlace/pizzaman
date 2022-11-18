import { Command } from 'commander'
import path from 'path'
import fs from 'fs/promises'
import chalk from 'chalk'
import figlet from 'figlet'
import { createSpinner } from 'nanospinner'
import { ComponentType } from '../../typings/ComponentType'

export default class Cli {
    constructor(private _program: Command) {}

    private async _getCommands() {
        const cmdFiles = await fs.readdir(
            path.join(__dirname, '../../commands')
        )

        for (const file of cmdFiles) {
            const cmd = (await import(`../../commands/${file}`))
                .default as Command
            this._program.addCommand(cmd)
        }
    }

    public static formatComponentName(str: string) {
        const capitalize = (word: string) =>
            word.charAt(0).toUpperCase() + word.slice(1)

        // splitting words by '-'
        const words = str.split('-')

        // use capitalize function to capitalize every word
        const capitalized = words.map((word) => capitalize(word))

        return capitalized.join('')
    }

    public static async load(params: {
        callback: Function
        component: ComponentType
        beforeText: string
        afterText: string
    }) {
        const { callback, component, beforeText, afterText } = params

        const color = { event: 'green', command: 'yellow', module: 'blue' }[
            component
        ]

        const spinner = createSpinner(chalk.whiteBright(beforeText)).start({
            color,
        })

        callback()
            .then((res: unknown) => {
                spinner.success({
                    text: chalk.green(afterText),
                })
                if (res instanceof Error) throw new Error(res.message)
            })
            .catch((err: Error) =>
                spinner.error({
                    text: 'OOPS: ' + chalk.red(err),
                })
            )
    }

    public async start() {
        this._program
            .name('pizzaman')
            .description("The Dev CLI Tool for PizzaPlace's Bot!")
            .addHelpText('before', chalk.red(figlet.textSync('Pizzaman')))

        await this._getCommands()
        await this._program.parseAsync()
    }
}
