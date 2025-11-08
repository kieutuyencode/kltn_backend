import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvironmentVariables } from '~/environment-variables';
import { timezoneUTC } from '~/date-time';
import * as entities from './entities';
import * as seedings from './seedings';
import { SnakeNamingStrategy } from './strategies';

const entitiesArray = Object.values(entities);
const seedingsArray = Object.values(seedings);

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (env: EnvironmentVariables) => ({
        type: 'mysql',
        host: env.DB_HOST,
        port: env.DB_PORT,
        username: env.DB_USERNAME,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
        timezone: timezoneUTC,
        entities: [...entitiesArray],
        synchronize: true,
        logging: false,
        // logger,
        namingStrategy: new SnakeNamingStrategy(),
      }),
      inject: [EnvironmentVariables],
    }),
    TypeOrmModule.forFeature([...entitiesArray]),
  ],
  providers: [...seedingsArray],
  exports: [TypeOrmModule, ...seedingsArray],
})
export class DatabaseModule {}
