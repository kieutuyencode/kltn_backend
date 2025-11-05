import { Module } from '@nestjs/common';
import { EnvironmentVariablesModule } from '~/environment-variables';
import { DatabaseModule } from '~/database';
import { SecurityModule } from '~/security';
import { BlockchainModule } from '~/blockchain';
import { JobModule } from '~/job';
import { LoggerModule } from '~/logger';

@Module({
  imports: [
    EnvironmentVariablesModule,
    DatabaseModule,
    SecurityModule,
    BlockchainModule,
    JobModule,
    LoggerModule,
  ],
})
export class AppModule {}
