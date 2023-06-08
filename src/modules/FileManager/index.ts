import { promises as fs } from 'fs'
import path from 'path'
import { ComponentType } from '../../typings/ComponentType'

export type FMOpts = { [key in ComponentType]: string }

export default class FileManager {
    // Takes in { key: path } (Path is based on process.cwd())
    // Eg: { command: './bot/slashCommands'}

    private static _fmOpts: FMOpts

    constructor(private _defaultCommandCat: string = 'misc') {}

    public static async setOpts() {
        FileManager._fmOpts = (
            await import(path.join(process.cwd(), './pizzaman.json')).catch(
                () => {
                    throw new Error(
                        'Please create a `pizzaman.json` file to use pizzaman'
                    )
                }
            )
        ).default

        console.log(FileManager._fmOpts)
    }

    private async _pathExists(path: string) {
        try {
            await fs.access(path)
            return true
        } catch (e) {
            return false
        }
    }

    private async _createFile(
        fileName: string,
        compName: string,
        template: ComponentType
    ) {
        const templateFile = (await import(`../../templates/${template}`))
            .default as (str: string) => string

        if (!fileName.endsWith('.ts')) fileName = fileName + '.ts'
        const filePath = path.join(process.cwd(), fileName)

        if (await this._pathExists(filePath))
            throw new Error('File already exists')

        await fs.writeFile(filePath, templateFile(compName))
        return filePath
    }

    private async _createDir(dirName: string) {
        const dirPath = path.join(process.cwd(), dirName)

        if (await this._pathExists(dirPath))
            throw new Error('Dir already exists')

        await fs.mkdir(dirPath).catch((e) => {
            throw e
        })
        return dirPath
    }

    public async create(compType: ComponentType, name: string) {
        const handleErr = (err: Error) => {
            throw err
        }

        const createPath = FileManager._fmOpts[compType]

        if (!createPath) throw new Error('Specify a valid createType')

        switch (compType) {
            case 'module':
                return await this._createDir(path.join(createPath, name)).catch(
                    (e) => {
                        throw e
                    }
                )

            case 'command':
                // trys fetching `category/command`
                // where opt1 = category;
                //       opt2 = command
                let [opt1, opt2] = name.replace('\\\\', '/').split('/')

                // user specified both options (category & command)
                if (opt1 && opt2) {
                    const cmdPath = path.join(createPath, opt1, opt2)
                    await this._createDir(path.join(createPath, opt1)).catch(
                        () => {}
                    )
                    return await this._createFile(
                        cmdPath,
                        opt2,
                        'command'
                    ).catch(handleErr)
                }

                // user specified one opt. We will assume this to be the command
                else if (opt1) {
                    await this._createDir(
                        path.join(createPath, this._defaultCommandCat)
                    ).catch(() => {})
                    return await this._createFile(
                        path.join(createPath, this._defaultCommandCat, opt1),
                        opt1,
                        'command'
                    ).catch(handleErr)
                }

            case 'event':
                return await this._createFile(
                    path.join(createPath, name),
                    name,
                    'event'
                ).catch(handleErr)
        }
    }
}
