import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Logger } from 'winston';
import { createLogMessage } from '../utils';
import { LogTag } from '../constants';
import { dayUTC } from '~/date-time';
import { Reflector } from '@nestjs/core';
import { CLIENT_ID } from '~/security';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: Logger,
    private reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl } = request;
    const now = dayUTC();
    const id = crypto.randomUUID();

    request.id = id;
    request.createdAt = now;

    this.logger.info(
      createLogMessage(`${method} ${originalUrl}`, LogTag.REQUEST_START),
      {
        id,
        createdAt: now,
        ip: request?.ip,
        [CLIENT_ID]: request[CLIENT_ID],
      },
    );

    return next.handle().pipe(
      tap(() => {
        const durationSeconds = dayUTC().diff(now, 'seconds', true);

        this.logger.info(
          createLogMessage(`${method} ${originalUrl}`, LogTag.REQUEST_END),
          {
            id,
            durationSeconds,
          },
        );
      }),
    );
  }
}
