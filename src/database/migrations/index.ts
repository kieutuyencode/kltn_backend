import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from '../strategies';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  entities: [`${__dirname}/../entities/**/*.entity{.ts,.js}`],
  synchronize: false,
  logging: true,
  migrations: [`${__dirname}/resources/*{.ts,.js}`],
  migrationsTableName: 'migrations',
  namingStrategy: new SnakeNamingStrategy(),
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });

export default AppDataSource;
