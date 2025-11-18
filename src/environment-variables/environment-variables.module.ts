import { Global, Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvironmentVariables } from './abstracts';

const environmentVariablesProvider: Provider = {
  provide: EnvironmentVariables,
  useFactory: (): EnvironmentVariables => ({
    PORT: Number(process.env.PORT) || 3000,
    DB_USERNAME: process.env.DB_USERNAME!,
    DB_PASSWORD: process.env.DB_PASSWORD!,
    DB_NAME: process.env.DB_NAME!,
    DB_HOST: process.env.DB_HOST!,
    DB_PORT: Number(process.env.DB_PORT!),
    LOGGER_SERVER_URL: process.env.LOGGER_SERVER_URL!,
    LOGGER_API_KEY: process.env.LOGGER_API_KEY!,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN!,
    MAIL_HOST: process.env.MAIL_HOST!,
    MAIL_PORT: Number(process.env.MAIL_PORT!),
    MAIL_USER: process.env.MAIL_USER!,
    MAIL_PASSWORD: process.env.MAIL_PASSWORD!,
    MAIL_FROM_NAME: process.env.MAIL_FROM_NAME!,
    ETHERSCAN_V2_API_URL: process.env.ETHERSCAN_V2_API_URL!,
    ETHERSCAN_V2_API_KEY: process.env.ETHERSCAN_V2_API_KEY!,
    EVENT_ADMIN_PRIVATE_KEY: process.env.EVENT_ADMIN_PRIVATE_KEY!,
    TOBESCAN_API_URL: process.env.TOBESCAN_API_URL!,
  }),
};

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
  ],
  providers: [environmentVariablesProvider],
  exports: [environmentVariablesProvider],
})
export class EnvironmentVariablesModule {}
