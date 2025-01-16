import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

import { Logger } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';

const logger = new Logger('media-info');

export const getMediaInfo = async (
  buffer: Buffer,
): Promise<number | undefined> => {
  const tempPath = path.join('uploads', `temp-${randomUUID()}`);
  try {
    await fs.writeFile(tempPath, buffer);
    return new Promise((resolve) => {
      ffmpeg.ffprobe(tempPath, (err, metadata) => {
        if (err) {
          logger.error('Error extracting video metadata', err);
          resolve(undefined);
          return;
        }
        resolve(metadata.format.duration);
      });
    });
  } finally {
    await fs.unlink(tempPath).catch(() => {});
  }
};
