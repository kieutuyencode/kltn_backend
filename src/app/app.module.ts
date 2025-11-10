import { Module } from '@nestjs/common';
import { EnvironmentVariablesModule } from '~/environment-variables';
import { DatabaseModule } from '~/database';
import { SecurityModule } from '~/security';
import { BlockchainModule } from '~/blockchain';
import { JobModule } from '~/job';
import { LoggerModule } from '~/logger';
import { NotificationModule } from '~/notification';
import { ConfigModule } from '~/config';
import { FileModule } from '~/file';
import { UserModule } from '~/user';

@Module({
  imports: [
    EnvironmentVariablesModule,
    DatabaseModule,
    SecurityModule,
    BlockchainModule,
    JobModule,
    LoggerModule,
    NotificationModule,
    ConfigModule,
    FileModule,
    UserModule,
  ],
})
export class AppModule {}
