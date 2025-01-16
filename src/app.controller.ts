import { Controller, Get, HttpStatus, HttpCode, Logger } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { AppService } from './app.service';

@Controller('/')
@ApiTags('helloworld')
export class AppController {
  constructor(private readonly _appService: AppService) {}

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, description: 'Hello world' })
  getHello(): string {
    Logger.log('Hello Friend, world!');
    return this._appService.getHello();
  }
}
