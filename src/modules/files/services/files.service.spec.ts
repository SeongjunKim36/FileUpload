import { Test, TestingModule } from '@nestjs/testing';
import { Readable } from 'stream';
import { FilesService } from './files.service';
import { StorageStrategyService } from './storage-strategy.service';
import { IFileMetadataRepository } from '../interfaces/file-metadata.repository.interface';
import { FileMetadata } from '../interfaces/file-metadata.interface';
import { StorageType } from '../enums/storage-type.enum';
import { IFileStorage } from '../interfaces/file-storage.interface';

describe('FilesService', () => {
    let service: FilesService;
    let metadataRepositoryMock: jest.Mocked<IFileMetadataRepository>;
    let storageStrategyMock: jest.Mocked<StorageStrategyService>;
    let storageMock: jest.Mocked<IFileStorage>;

    const mockFileMetadata: FileMetadata = {
        id: 'test-id',
        originalName: 'test.txt',
        mimeType: 'text/plain',
        size: 1024,
        path: '/path/to/file',
        storageLocation: 'local',
        uploadDate: new Date()
    };

    beforeEach(async () => {
        storageMock = {
            save: jest.fn(),
            getFile: jest.fn(),
            deleteFile: jest.fn()
        };

        storageStrategyMock = {
            getStorage: jest.fn().mockReturnValue(storageMock)
        } as any;

        metadataRepositoryMock = {
            save: jest.fn(),
            findById: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FilesService,
                {
                    provide: 'IFileMetadataRepository',
                    useValue: metadataRepositoryMock
                },
                {
                    provide: StorageStrategyService,
                    useValue: storageStrategyMock
                }
            ],
        }).compile();

        service = module.get<FilesService>(FilesService);
    });

    describe('uploadFile', () => {
        it('should upload file successfully', async () => {
            // Arrange
            const file = new File(['test content'], 'test.txt', {
                type: 'text/plain'
            });
            storageMock.save.mockResolvedValue(mockFileMetadata);
            metadataRepositoryMock.save.mockResolvedValue();

            // Act
            const result = await service.uploadFile(file, StorageType.LOCAL);

            // Assert
            expect(storageStrategyMock.getStorage).toHaveBeenCalledWith(StorageType.LOCAL);
            expect(storageMock.save).toHaveBeenCalledWith(
                expect.any(Readable),
                file.name,
                expect.objectContaining({
                    originalName: file.name,
                    mimeType: file.type
                })
            );
            expect(result).toEqual(mockFileMetadata);
        });

        it('should handle upload failure', async () => {
            // Arrange
            const file = new File(['test content'], 'test.txt', {
                type: 'text/plain'
            });
            storageMock.save.mockRejectedValue(new Error('Upload failed'));

            // Act & Assert
            await expect(service.uploadFile(file, StorageType.LOCAL))
                .rejects.toThrow('Upload failed');
        });
    });

    describe('getFileMetadata', () => {
        it('should return file metadata when found', async () => {
            // Arrange
            metadataRepositoryMock.findById.mockResolvedValue(mockFileMetadata);

            // Act
            const result = await service.getFileMetadata('test-id');

            // Assert
            expect(metadataRepositoryMock.findById).toHaveBeenCalledWith('test-id');
            expect(result).toEqual(mockFileMetadata);
        });

        it('should return undefined when file not found', async () => {
            // Arrange
            metadataRepositoryMock.findById.mockResolvedValue(undefined);

            // Act
            const result = await service.getFileMetadata('non-existent');

            // Assert
            expect(result).toBeUndefined();
        });
    });

    describe('getFileStream', () => {
        it('should return file stream when file exists', async () => {
            // Arrange
            const mockStream = Readable.from('test content');
            metadataRepositoryMock.findById.mockResolvedValue(mockFileMetadata);
            storageMock.getFile.mockResolvedValue(mockStream);

            // Act
            const result = await service.getFileStream('test-id');

            // Assert
            expect(metadataRepositoryMock.findById).toHaveBeenCalledWith('test-id');
            expect(storageStrategyMock.getStorage).toHaveBeenCalledWith(StorageType.LOCAL);
            expect(storageMock.getFile).toHaveBeenCalledWith(mockFileMetadata);
            expect(result).toBe(mockStream);
        });

        it('should throw error when file not found', async () => {
            // Arrange
            metadataRepositoryMock.findById.mockResolvedValue(undefined);

            // Act & Assert
            await expect(service.getFileStream('non-existent'))
                .rejects.toThrow('File not found');
        });

        it('should use correct storage type based on location', async () => {
            // Arrange
            const cloudMetadata = { ...mockFileMetadata, storageLocation: 'cloud' };
            metadataRepositoryMock.findById.mockResolvedValue(cloudMetadata);
            storageMock.getFile.mockResolvedValue(Readable.from('test'));

            // Act
            await service.getFileStream('test-id');

            // Assert
            expect(storageStrategyMock.getStorage).toHaveBeenCalledWith(StorageType.S3);
        });
    });
}); 