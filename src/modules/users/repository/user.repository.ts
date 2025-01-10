import { NotFoundException } from '@nestjs/common';
import { Repository, Entity } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { UserRegisterDto } from '../dtos/user-register.dto';
import { User } from '../entities/user.entity';

@Entity()
export class UserRepository extends Repository<User> {
    async createUser(userRegisterDto: UserRegisterDto) {
        const id = uuidv4();
        const user = await this.save(
            super.create({ ...{ id }, ...userRegisterDto }),
        );
        user.create();
        return user;
    }

    async updateUser(id: string, data: Partial<User>): Promise<User> {
        const updatedUser = await this.findOne({ where: { id } });
        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }
        Object.assign(updatedUser, data);
        return this.save(updatedUser);
    }

    async deleteUser(userDto) {
        const user = await this.findOneBy({ id: userDto.id });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        await this.delete(userDto.id);
        user.delete();
        return user;
    }

    async welcomeUser(userDto) {
        const user = await this.findOneBy({ id: userDto.id });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        user.welcome();
        return user;
    }

    async getUser(id: string): Promise<User> {
        const user = await this.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }
}
