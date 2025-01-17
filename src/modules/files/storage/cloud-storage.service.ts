import { randomUUID } from 'crypto';
import { Readable } from 'stream';

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { FileMetadata } from '../interfaces/file-metadata.interface';
import { IFileStorage } from '../interfaces/file-storage.interface';

@Injectable()
export class CloudStorage implements IFileStorage {
  private readonly logger = new Logger(CloudStorage.name);

  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    // AWS SDK 설정
    this.s3Client = new S3Client({
      region: this.configService.getOrThrow<string>('AWS_REGION'), // 필수 값 체크
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
    this.bucketName = this.configService.getOrThrow<string>('AWS_S3_BUCKET');
  }

  async save(
    file: Readable,
    filename: string,
    metadata: Partial<FileMetadata>,
  ): Promise<FileMetadata> {
    const fileId = randomUUID();
    const params = {
      Bucket: this.bucketName,
      Key: fileId,
      Body: file,
    };

    try {
      await this.s3Client.send(new PutObjectCommand(params));
      const newMetadata: FileMetadata = {
        ...metadata,
        id: fileId,
        storageLocation: 'cloud',
        uploadDate: new Date(),
      } as FileMetadata;
      return newMetadata;
    } catch (err) {
      this.logger.error(`Error uploading to S3: ${err}`);
      throw err;
    }
  }

  async getFile(metadata: FileMetadata): Promise<Readable> {
    if (metadata.storageLocation !== 'cloud') {
      throw new Error('File not found in cloud storage');
    }

    const params = {
      Bucket: this.bucketName,
      Key: metadata.id,
    };

    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600,
    });

    return await fetch(url).then((res) => res.body as unknown as Readable);
  }

  async upload(file: File): Promise<string> {
    const fileId = randomUUID();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileId,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    return fileId;
  }

  async deleteFile(path: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: path,
      }),
    );
  }
}
