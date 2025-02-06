import { createWriteStream } from 'fs';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { stat } from 'fs/promises';
import { createReadStream } from 'fs';

import { Injectable } from '@nestjs/common';

import { FileMetadata } from '../interfaces/file-metadata.interface';
import { IFileStorage } from '../interfaces/file-storage.interface';
import { extractMetadata } from '../utils/metadata-extractor';

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
    const id = uuidv4();
    const filepath = path.join('uploads', `${id}-${filename}`);

    const writeStream = createWriteStream(filepath);
    await new Promise((resolve, reject) => {
      file.pipe(writeStream).on('finish', resolve).on('error', reject);
    });

    const stats = await stat(filepath);

    const baseMetadata = {
      id,
      path: filepath,
      size: stats.size,
      storageLocation: 'local',
      uploadDate: new Date(),
      ...metadata,
    } as FileMetadata;

    const fileStream = createReadStream(filepath);
    return extractMetadata(fileStream, baseMetadata);
  }
}
