import { ICommand } from '@nestjs/cqrs';

export class UpdateUserCommand implements ICommand {
    constructor(
        public readonly userId: string,
        public readonly userDto: any,
    ) {}
}
