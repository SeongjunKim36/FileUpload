import { AggregateRoot } from '@nestjs/cqrs';
import { plainToClass } from 'class-transformer';
import { IAggregateEvent } from 'nestjs-eventstore';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

import { UserDto } from '../dtos/user.dto';
import { UserCreatedEvent } from '../events/impl/user-created.event';
import { UserDeletedEvent } from '../events/impl/user-deleted.event';
import { UserUpdatedEvent } from '../events/impl/user-updated.event';
import { UserWelcomedEvent } from '../events/impl/user-welcomed.event';

@Entity({ name: 'users' })
export class User extends AggregateRoot<IAggregateEvent> {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column({ unique: true })
    email!: string;

    toDto() {
        return plainToClass(UserDto, this);
    }

    create() {
        this.apply(new UserCreatedEvent(this.toDto()));
    }

    update() {
        this.apply(new UserUpdatedEvent(this.toDto()));
    }

    welcome() {
        this.apply(new UserWelcomedEvent(this.toDto()));
    }

    delete() {
        this.apply(new UserDeletedEvent(this.toDto()));
    }
}
