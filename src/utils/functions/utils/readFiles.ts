import { readdirSync, statSync } from "fs";
import { join, relative } from "path";

export function readFilesRecursively(directory: string, baseDir = directory): string[] {
    let fileList: string[] = [];
    const files = readdirSync(directory);

    for (const file of files) {
        const filePath = join(directory, file);
        const fileStat = statSync(filePath);

        if (fileStat.isDirectory()) {
            fileList = fileList.concat(readFilesRecursively(filePath, baseDir));
        } else if (fileStat.isFile()) {
            fileList.push(relative(baseDir, filePath));
        }
    }

    return fileList;
}