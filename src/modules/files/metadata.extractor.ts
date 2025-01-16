import { Readable } from 'stream';

import { Logger } from '@nestjs/common';
import sharp from 'sharp';

import { FileMetadata } from './interfaces/file-metadata.interface';
import { getMediaInfo } from './media-info';

const logger = new Logger('metadata.extractor');

export const getMetadata = async (
  file: Readable,
  metadata: FileMetadata,
): Promise<FileMetadata> => {
  try {
    if (metadata.mimeType.startsWith('image/')) {
      const imageBuffer = await streamToBuffer(file);
      const { width, height } = await sharp(imageBuffer).metadata();
      return { ...metadata, width, height };
    } else if (metadata.mimeType.startsWith('video/')) {
      const videoBuffer = await streamToBuffer(file);
      const duration = await getMediaInfo(videoBuffer);
      return { ...metadata, duration };
    }
    return metadata;
  } catch (err) {
    logger.error('Error while extracting metadata', err);
    return metadata;
  }
};

const streamToBuffer = (stream: Readable): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
};
