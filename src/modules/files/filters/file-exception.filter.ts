import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import { Response } from 'express';

interface TypedError {
  message: string;
  path: string;
}

@Catch()
export class FileExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (this.isTypedError(exception)) {
      status = 400;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    });
  }

  private isTypedError(error: unknown): error is TypedError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      'path' in error
    );
  }
}

export const UseFileExceptionFilter = () => UseFilters(FileExceptionFilter);
