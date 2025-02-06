import { Readable } from 'stream';
import * as sharp from 'sharp';
import * as ffmpeg from 'fluent-ffmpeg';
import { FileMetadata } from '../interfaces/file-metadata.interface';
import { writeFile } from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

export async function extractMetadata(
  file: Readable,
  metadata: FileMetadata
): Promise<FileMetadata> {
  // 스트림을 버퍼로 변환
  const buffer = await streamToBuffer(file);

  if (metadata.mimeType.startsWith('image/')) {
    // 이미지 메타데이터 추출
    const imageInfo = await sharp(buffer).metadata();
    return {
      ...metadata,
      width: imageInfo.width,
      height: imageInfo.height
    };
  }

  if (metadata.mimeType.startsWith('video/')) {
    // 비디오 메타데이터 추출
    const duration = await getVideoDuration(buffer);
    return {
      ...metadata,
      duration
    };
  }

  return metadata;
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function getVideoDuration(buffer: Buffer): Promise<number> {
  return new Promise(async (resolve, reject) => {
    const tempPath = path.join(os.tmpdir(), `temp-${Date.now()}.mp4`);
    await writeFile(tempPath, buffer);
    
    ffmpeg.ffprobe(tempPath, (err, metadata) => {
      if (err) reject(err);
      resolve(metadata.format.duration || 0);
    });
  });
} 