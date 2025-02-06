import { Test, TestingModule } from '@nestjs/testing';
import { Readable } from 'stream';
import { StorageType } from '../enums/storage-type.enum';
import { FilesService } from './files.service';
import { StorageStrategyService } from './storage-strategy.service';
import { FileMetadata } from '../interfaces/file-metadata.interface';
import { UsersService } from '../../users/services/user.service';
import * as fs from 'fs';

jest.mock('fs', () => ({
    createReadStream: jest.fn(),
}));

jest.mock('sharp', () => ({
    __esModule: true,
    default: jest.fn((buffer) => ({
        metadata: jest.fn().mockResolvedValue({
            width: 100,
            height: 200
        })
    }))
}));

jest.mock('fluent-ffmpeg', () => ({
    ffprobe: jest.fn((_, callback) => callback(null, { format: { duration: 100 } }))
}));

describe('FilesService', () => {
    let service: FilesService;
    let metadataRepositoryMock: any;
    let storageStrategyMock: any;
    let storageMock: any;
    let usersServiceMock: any;

    const mockUserId = 'test-user-id';
    const mockFileMetadata: FileMetadata = {
        id: 'test-id',
        originalName: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        path: '/path/to/file',
        storageLocation: 'local',
        uploadDate: new Date(),
        width: 100,
        height: 200
    };

    beforeEach(async () => {
        storageMock = {
            save: jest.fn(),
            getFile: jest.fn(),
        };

        storageStrategyMock = {
            getStorage: jest.fn().mockReturnValue(storageMock),
        };

        metadataRepositoryMock = {
            save: jest.fn(),
            findById: jest.fn(),
        };

        usersServiceMock = {
            checkStorageLimit: jest.fn().mockResolvedValue(true),
            updateStorageUsage: jest.fn().mockResolvedValue(undefined),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FilesService,
                {
                    provide: StorageStrategyService,
                    useValue: storageStrategyMock,
                },
                {
                    provide: 'IFileMetadataRepository',
                    useValue: metadataRepositoryMock,
                },
                {
                    provide: UsersService,
                    useValue: usersServiceMock,
                },
            ],
        }).compile();

        service = module.get<FilesService>(FilesService);
    });

    describe('uploadFile', () => {
        it('should upload file successfully when user has storage space', async () => {
            const file = new File(['test content'], 'test.txt', {
                type: 'text/plain'
            });
            storageMock.save.mockResolvedValue(mockFileMetadata);
            metadataRepositoryMock.save.mockResolvedValue();

            const result = await service.uploadFile(file, StorageType.LOCAL, mockUserId);

            expect(usersServiceMock.checkStorageLimit).toHaveBeenCalledWith(mockUserId, file.size);
            expect(storageStrategyMock.getStorage).toHaveBeenCalledWith(StorageType.LOCAL);
            expect(storageMock.save).toHaveBeenCalledWith(
                expect.any(Readable),
                file.name,
                expect.objectContaining({
                    originalName: file.name,
                    mimeType: file.type
                })
            );
            expect(usersServiceMock.updateStorageUsage).toHaveBeenCalledWith(mockUserId, file.size);
            expect(result).toEqual(mockFileMetadata);
        });

        it('should throw error when user exceeds storage limit', async () => {
            const file = new File(['test content'], 'test.txt', {
                type: 'text/plain'
            });
            usersServiceMock.checkStorageLimit.mockResolvedValue(false);

            await expect(service.uploadFile(file, StorageType.LOCAL, mockUserId))
                .rejects.toThrow('Storage limit exceeded');

            expect(usersServiceMock.checkStorageLimit).toHaveBeenCalledWith(mockUserId, file.size);
            expect(storageMock.save).not.toHaveBeenCalled();
            expect(usersServiceMock.updateStorageUsage).not.toHaveBeenCalled();
        });
    });

    describe('getFileMetadata', () => {
        it('should return file metadata with additional info', async () => {
            const mockReadStream = new Readable({
                read() {
                    this.push(Buffer.from('test'));
                    this.push(null);
                }
            });
            
            (fs.createReadStream as jest.Mock).mockReturnValue(mockReadStream);
            metadataRepositoryMock.findById.mockResolvedValue(mockFileMetadata);

            const result = await service.getFileMetadata('test-id');

            expect(metadataRepositoryMock.findById).toHaveBeenCalledWith('test-id');
            expect(fs.createReadStream).toHaveBeenCalledWith(mockFileMetadata.path);
            expect(result).toEqual(mockFileMetadata);
        });

        it('should return undefined when file not found', async () => {
            metadataRepositoryMock.findById.mockResolvedValue(undefined);

            const result = await service.getFileMetadata('non-existent-id');

            expect(result).toBeUndefined();
            expect(fs.createReadStream).not.toHaveBeenCalled();
        });
    });

    describe('getFileStream', () => {
        it('should return file stream', async () => {
            const mockStream = new Readable();
            metadataRepositoryMock.findById.mockResolvedValue(mockFileMetadata);
            storageMock.getFile.mockResolvedValue(mockStream);

            const result = await service.getFileStream('test-id');

            expect(metadataRepositoryMock.findById).toHaveBeenCalledWith('test-id');
            expect(storageStrategyMock.getStorage).toHaveBeenCalledWith(StorageType.LOCAL);
            expect(result).toBe(mockStream);
        });

        it('should throw error when file not found', async () => {
            metadataRepositoryMock.findById.mockResolvedValue(undefined);

            await expect(service.getFileStream('non-existent-id')).rejects.toThrow('File not found');
        });
    });
}); 