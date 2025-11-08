import { Module } from '@nestjs/common';
import { EnvironmentVariablesModule } from '~/environment-variables';
import { DatabaseModule } from '~/database';
import { SecurityModule } from '~/security';
import { BlockchainModule } from '~/blockchain';
import { UserModule } from './user/user.module';
import { JobModule } from '~/job';
import { LoggerModule } from '~/logger';
import { AuthModule } from '~/auth/auth.module';
import { EventModule } from './event/event.module';
@Module({
  imports: [
    EnvironmentVariablesModule,
    DatabaseModule,
    SecurityModule,
    BlockchainModule,
    JobModule,
    LoggerModule,
    UserModule,
    AuthModule,
    EventModule,
  ],
})
export class AppModule {}
