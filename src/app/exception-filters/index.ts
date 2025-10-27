import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Result } from '~/shared';
import { IException } from '../interfaces';
import { dayUTC, DateTime } from '~/date-time';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const isInternalServerError =
      httpStatus === HttpStatus.INTERNAL_SERVER_ERROR;

    if (isInternalServerError) {
      console.error(exception);
    }

    httpAdapter.reply(
      ctx.getResponse(),
      Result.fail({
        message: isInternalServerError
          ? 'Internal Server Error'
          : (exception as IException)?.message,
        detail: isInternalServerError
          ? undefined
          : (exception as IException)?.response?.detail,
      }),
      httpStatus,
    );
  }
}
