import * as fs from 'fs/promises';
import * as path from 'path';

import { Injectable } from '@nestjs/common';

import { IFileStorage } from '../interfaces/file-storage.interface';

@Injectable()
export class LocalStorageService implements IFileStorage {
    async upload(file: File): Promise<string> {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const filename = `${uniqueSuffix}${path.extname(file.name)}`;
        const filepath = path.join('uploads', filename);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile(filepath, buffer);

        return filepath;
    }

    async getFile(path: string): Promise<Buffer> {
        return fs.readFile(path);
    }

    async deleteFile(path: string): Promise<void> {
        await fs.unlink(path);
    }
}
