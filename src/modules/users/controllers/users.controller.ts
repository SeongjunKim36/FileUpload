import { TypedRoute, TypedParam, TypedBody } from '@nestia/core';
import { Controller, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';

import { UserRegisterDto } from '../dtos/user-register.dto';
import { UserDto } from '../dtos/user.dto';
import { UsersService } from '../services/users.service';

@Controller('users')
@ApiTags('Users')
export class UsersController {
    constructor(private readonly _usersService: UsersService) {}

    @TypedRoute.Post()
    @ApiOperation({ summary: 'Create User' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'User Created.' })
    async createUser(@TypedBody() userRegisterDto: UserRegisterDto) {
        return this._usersService.createUser(userRegisterDto);
    }

    /* Update User */
    @ApiOperation({ summary: 'Update User' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Update User.' })
    @TypedRoute.Put(':id')
    async updateUser(
        @TypedParam('id') id: string,
        @TypedBody() userDto: UserDto,
    ) {
        return this._usersService.updateUser(userDto);
    }

    /* Delete User */
    @ApiOperation({ summary: 'Delete User' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Delete User.' })
    @TypedRoute.Delete(':id')
    async deleteUser(@TypedParam('id') id: string) {
        return this._usersService.deleteUser({ id });
    }

    /* Get users */
    @ApiOperation({ summary: 'List Users' })
    @ApiResponse({ status: HttpStatus.OK, description: 'List Users.' })
    @TypedRoute.Get()
    async findUsers(): Promise<UserDto[]> {
        return this._usersService.findUsers();
    }

    /* Get user*/
    @ApiOperation({ summary: 'Get User' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Get User.' })
    @TypedRoute.Get(':id')
    async findOneUser(@TypedParam('id') id: string): Promise<UserDto> {
        return this._usersService.findOneById({ id });
    }
}
