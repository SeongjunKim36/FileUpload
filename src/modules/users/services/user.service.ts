import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../interfaces/user.repository.interface';

@Injectable()
export class UsersService {
    constructor(
        @Inject('IUserRepository')
        private readonly userRepository: IUserRepository,
    ) {}

    async checkStorageLimit(userId: string, fileSize: number): Promise<boolean> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            return false;
        }

        return (user.usedStorage + fileSize) <= user.storageLimit;
    }

    async updateStorageUsage(userId: string, fileSize: number): Promise<void> {
        await this.userRepository.updateStorageUsage(userId, fileSize);
    }
}