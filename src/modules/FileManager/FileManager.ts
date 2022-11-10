import { promises as fs } from "fs"
import path from "path"
import { CreateType } from "../../typings/CreateType"

export default class FileManager {
    // Takes in { key: path } (Path is based on process.cwd())
    // Eg: { command: './bot/slashCommands'}
    constructor(private _fmOpts: { [key in CreateType]: string }, private _defaultCommandCat: string = "misc") {}

    private async _pathExists(path: string) {
        try {
            await fs.access(path)
            return true
        } catch (e) {
            return false
        }
    }

    private async _createFile(fileName: string, fileContent: string | string[] = "") {
        if (!fileName.endsWith(".ts")) fileName = fileName + ".ts"
        const filePath = path.join(process.cwd(), fileName)

        if (await this._pathExists(filePath)) throw new Error("File already exists")

        await fs.writeFile(filePath, fileContent)
        return filePath
    }

    private async _createDir(dirName: string) {
        const dirPath = path.join(process.cwd(), dirName)

        if (await this._pathExists(dirPath)) throw new Error("Dir already exists")

        await fs.mkdir(dirPath).catch((e) => {
            throw e
        })
        return dirPath
    }

    public async create(createType: CreateType, name: string) {
        const createPath = this._fmOpts[createType]

        if (!createPath) throw new Error("Specify a valid createType")

        switch (createType) {
            case "module":
                return await this._createDir(path.join(createPath, name))

            case "command":
                // trys fetching `category/command`
                // where opt1 = category;
                //       opt2 = command
                let [opt1, opt2] = name.replace("\\", "/").split("/")

                // user specified both options (category & command)
                if (opt1 && opt2) {
                    const cmdPath = path.join(createPath, opt1, opt2)
                    await this._createDir(path.join(createPath, opt1)).catch(console.error)
                    return await this._createFile(cmdPath, "SKIBADAPAB")
                }

                // user specified one opt. We will assume this to be the command
                else if (opt1) {
                    await this._createDir(path.join(createPath, this._defaultCommandCat)).catch(() => {})
                    return await this._createFile(path.join(createPath, this._defaultCommandCat, opt1), "SKIBADAPAB")
                }

            case "event":
                return await this._createFile(path.join(createPath, name), "EVENTS YAY")
        }
    }
}
