import { Global, Module, Provider } from '@nestjs/common';
import { Logger, createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import { SeqTransport } from '@datalust/winston-seq';
import { EnvironmentVariables } from '~/environment-variables';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './interceptors';

const loggerProvider: Provider = {
  provide: Logger,
  useFactory: (env: EnvironmentVariables) => {
    return createLogger({
      format: format.combine(format.errors({ stack: true }), format.json()),
      transports: [
        new transports.Console({
          format: format.simple(),
        }).on('error', (error) => {
          console.error(error);
        }),
        new transports.DailyRotateFile({
          filename: 'logs/%DATE%.log',
          utc: true,
          format: format.simple(),
        }).on('error', (error) => {
          console.error(error);
        }),
        new transports.DailyRotateFile({
          level: 'error',
          filename: 'logs/errors/%DATE%.log',
          utc: true,
          format: format.simple(),
        }).on('error', (error) => {
          console.error(error);
        }),
        // new SeqTransport({
        //   serverUrl: env.LOGGER_SERVER_URL,
        //   apiKey: env.LOGGER_API_KEY,
        //   onError: (error) => {
        //     console.error(error);
        //   },
        //   handleExceptions: true,
        //   handleRejections: true,
        // }),
      ],
    });
  },
  inject: [EnvironmentVariables],
};

@Global()
@Module({
  providers: [
    loggerProvider,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [loggerProvider],
})
export class LoggerModule {}
