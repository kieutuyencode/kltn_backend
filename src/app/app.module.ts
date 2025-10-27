import { Module } from '@nestjs/common';
import { EnvironmentVariablesModule } from '~/environment-variables';
import { DatabaseModule } from '~/database';
import { SecurityModule } from '~/security';
import { BlockchainModule } from '~/blockchain';

@Module({
  imports: [
    EnvironmentVariablesModule,
    DatabaseModule,
    SecurityModule,
    BlockchainModule,
  ],
})
export class AppModule {}
