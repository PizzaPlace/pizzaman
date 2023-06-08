import { Argument, Command } from 'commander'
import fs from 'fs'
import Cli from '../modules/Cli'
import FileManager from '../modules/FileManager'

const command = new Command()
    .command('module')
    .description('Create a module method')
    .argument('<module>', 'The module name for which the method is created')
    .argument('<name>', 'The name of the method')
    .action((module: string) => {
        return Cli.load({
            callback: async () => {
                return await new FileManager()
            },
            component: 'module',
            beforeText: 'Creating module',
            afterText: 'Created',
        })
    })
