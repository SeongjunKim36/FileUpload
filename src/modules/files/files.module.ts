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
import { UsersService } from '../users/services/user.service';
import { UserEntity } from '../users/entities/user.entity';
import { UserRepository } from '../users/repositories/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity, UserEntity]),
    ConfigModule
  ],
  controllers: [FilesController],
  providers: [
    UsersService,
    FilesService,
    StorageStrategyService,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
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
