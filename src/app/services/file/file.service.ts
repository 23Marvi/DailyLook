import { Injectable } from '@angular/core';
import { Directory, FileInfo, Filesystem } from '@capacitor/filesystem';

@Injectable({
    providedIn: 'root'
})
export class FileService {

    private readonly DIR = 'DAILYLOOK';

    async saveFile(data: string, date: Date): Promise<void> {
        await Filesystem.writeFile({
            directory: Directory.Data,
            path: `${this.DIR}/${date.getTime()}.png`,
            data
        });
    }

    async getFiles(): Promise<FileInfo[]> {
        const files = await Filesystem.readdir({
            directory: Directory.Data,
            path: this.DIR
        });
        return files.files;
    }

    async deleteDir(): Promise<void> {
        await Filesystem.rmdir({
            directory: Directory.Data,
            path: this.DIR,
            recursive: true
        });
    }
}
