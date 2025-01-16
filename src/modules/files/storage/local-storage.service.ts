import { createWriteStream } from 'fs';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Readable } from 'stream';

import { Injectable } from '@nestjs/common';

import { FileMetadata } from '../interfaces/file-metadata.interface';
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

  async getFile(metadata: FileMetadata): Promise<Readable> {
    const buffer = await fs.readFile(metadata.path as string);
    return Readable.from(buffer);
  }

  async deleteFile(path: string): Promise<void> {
    await fs.unlink(path);
  }

  async save(
    file: Readable,
    filename: string,
    metadata: Partial<FileMetadata>,
  ): Promise<FileMetadata> {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filepath = path.join('uploads', `${uniqueSuffix}-${filename}`);

    const writeStream = createWriteStream(filepath);
    await new Promise((resolve, reject) => {
      file.pipe(writeStream).on('finish', resolve).on('error', reject);
    });

    return {
      ...metadata,
      id: uniqueSuffix,
      path: filepath,
      storageLocation: 'local',
      uploadDate: new Date(),
    } as FileMetadata;
  }
}
