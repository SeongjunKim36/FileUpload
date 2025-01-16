import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilesController } from './controllers/files.controller';
import { FileEntity } from './entities/file.entity';
import { FileMetadataRepository } from './repositories/file-metadata.repository';
import { FilesService } from './services/files.service';
import { StorageStrategyService } from './services/storage-strategy.service';
import { CloudStorage } from './storage/cloud-storage.service';
import { LocalStorageService } from './storage/local-storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity]), ConfigModule],
  controllers: [FilesController],
  providers: [
    FilesService,
    StorageStrategyService,
    {
      provide: 'IFileMetadataRepository',
      useClass: FileMetadataRepository,
    },
    {
      provide: 'LOCAL_STORAGE',
      useClass: LocalStorageService,
    },
    {
      provide: 'CLOUD_STORAGE',
      useClass: CloudStorage,
    },
  ],
  exports: [FilesService],
})
export class FileModule {}
