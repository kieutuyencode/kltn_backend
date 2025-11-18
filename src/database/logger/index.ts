import { Injectable } from '@nestjs/common';
import { Logger as ITypeOrmLogger, QueryRunner, LogLevel } from 'typeorm';
import { Logger, createLogMessage, LogTag } from '~/logger';

@Injectable()
export class TypeOrmLogger implements ITypeOrmLogger {
  constructor(private readonly logger: Logger) {}

  private getQueryRunnerInfo(queryRunner?: QueryRunner) {
    if (!queryRunner) return {};

    return {
      connectionType: queryRunner.connection.options.type,
      isTransactionActive: queryRunner.isTransactionActive,
    };
  }

  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): void {
    this.logger.info(createLogMessage('Executing query', LogTag.DATABASE), {
      query,
      parameters,
      ...this.getQueryRunnerInfo(queryRunner),
    });
  }

  logQueryError(
    error: string | Error,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ): void {
    this.logger.error(createLogMessage('Query error', LogTag.DATABASE), {
      error,
      query,
      parameters,
      ...this.getQueryRunnerInfo(queryRunner),
    });
  }

  logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ): void {
    this.logger.warn(createLogMessage('Slow query detected', LogTag.DATABASE), {
      executionTime: time,
      query,
      parameters,
      ...this.getQueryRunnerInfo(queryRunner),
    });
  }

  logSchemaBuild(message: string, queryRunner?: QueryRunner): void {
    this.logger.info(createLogMessage('Schema build', LogTag.DATABASE), {
      message,
      ...this.getQueryRunnerInfo(queryRunner),
    });
  }

  logMigration(message: string, queryRunner?: QueryRunner): void {
    this.logger.info(createLogMessage('Migration', LogTag.DATABASE), {
      message,
      ...this.getQueryRunnerInfo(queryRunner),
    });
  }

  log(level: LogLevel, message: any, queryRunner?: QueryRunner): void {
    const logData = {
      message,
      ...this.getQueryRunnerInfo(queryRunner),
    };

    switch (level) {
      case 'log':
        this.logger.info(logData);
        break;
      case 'info':
        this.logger.info(logData);
        break;
      case 'warn':
        this.logger.warn(logData);
        break;
    }
  }
}
