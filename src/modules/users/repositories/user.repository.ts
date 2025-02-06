import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { IUserRepository } from '../interfaces/user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(
        @InjectRepository(UserEntity)
        private readonly repository: Repository<UserEntity>,
    ) {}

    async findById(id: string): Promise<UserEntity | undefined> {
        const user = await this.repository.findOne({ where: { id } });
        return user ?? undefined;
    }

    async updateStorageUsage(id: string, additionalSize: number): Promise<void> {
        await this.repository
            .createQueryBuilder()
            .update()
            .set({
                usedStorage: () => `"usedStorage" + ${additionalSize}`
            })
            .where('id = :id', { id })
            .execute();
    }
} 