import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Logger, createLogMessage, LogTag } from '~/logger';
import { Result } from '~/shared';
import { IException } from '../interfaces';
import { dayUTC, DateTime } from '~/date-time';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: Logger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const { method, originalUrl, createdAt } = request;
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const isInternalServerError =
      httpStatus === HttpStatus.INTERNAL_SERVER_ERROR;

    if (isInternalServerError) {
      this.logger.error(
        createLogMessage(`${method} ${originalUrl}`, LogTag.REQUEST_ERROR),
        {
          id: request.id,
          durationSeconds: dayUTC().diff(
            createdAt as DateTime,
            'seconds',
            true,
          ),
          stack: (exception as Error).stack,
        },
      );
    } else {
      this.logger.warn(
        createLogMessage(`${method} ${originalUrl}`, LogTag.REQUEST_END),
        {
          id: request.id,
          durationSeconds: dayUTC().diff(
            createdAt as DateTime,
            'seconds',
            true,
          ),
        },
      );
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
