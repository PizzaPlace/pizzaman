import chalk from 'chalk'
import { Argument, Command } from 'commander'
import Cli from '../modules/Cli'
import FileManager from '../modules/FileManager'
import { ComponentType } from '../typings/ComponentType'

const command = new Command()
    .command('create')
    .description('create something idfk')
    .addArgument(
        new Argument(
            '<type>',
            'The type of component that you want to create'
        ).choices(['command', 'module', 'event'])
    )
    .argument('<name>', 'Name of the component')
    .action(async (type: ComponentType, name: string, opts: object) => {
        Cli.load({
            callback: async () => {
                return await new FileManager({
                    command: '__tests__/commands',
                    event: '__tests__/events',
                    module: '__tests/modules',
                }).create(type, name)
            },
            beforeText: `Creating ${type}`,
            component: type,
            afterText: `${type} '${name}' has been created`,
        })
    })

export default command
