import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from '../strategies';

const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  database: 'dex',
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
