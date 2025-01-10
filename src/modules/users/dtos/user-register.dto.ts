'use strict';

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class UserRegisterDto {
    @IsString()
    @ApiProperty()
    firstName!: string;

    @IsString()
    @ApiProperty()
    lastName!: string;

    @IsEmail()
    @ApiProperty()
    email!: string;
}
