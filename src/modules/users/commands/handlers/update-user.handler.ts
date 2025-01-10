import { Logger, NotFoundException } from '@nestjs/common';
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { EventPublisher } from 'nestjs-eventstore';

import { UserRepository } from '../../repository/user.repository';
import { UpdateUserCommand } from '../impl/update-user.command';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
    constructor(
        private readonly _repository: UserRepository,
        private readonly _publisher: EventPublisher,
    ) {}

    async execute(command: UpdateUserCommand) {
        Logger.log('Async UpdateUserHandler...', 'UpdateUserCommand');

        const user = await this._repository.findOne({
            where: { id: command.userDto.id },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const { userDto } = command;
        const updatedUser = await this._repository.updateUser(
            userDto.id,
            userDto,
        );
        this._publisher.mergeObjectContext(updatedUser);
        updatedUser.commit();
    }
}
