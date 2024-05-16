// This file serves only as the path for typeorm migrations generation as it is the duplicate
// of the configuration found in database.module.ts file in this same folder path.
// TypeOrm requires an exported Datasource file. This is it

import { DataSource } from 'typeorm';

import configuration from '../utils/config';
import User from '../user/user.entity';
import Task from '../task/task.entity';

/**
 * This is for typeorm migrations generation.
 */
const dataSource: DataSource = new DataSource({
  // TypeORM PostgreSQL DB Drivers configuration
  ...configuration().POSTGRES,
  entities: [User, Task],
  // Synchronize database schema with entities
  synchronize: configuration().NODE_ENV === 'development',
  migrations: ['./migrations/*.ts'],
  migrationsTableName: 'niyo_migrations',
});

console.log(configuration().NODE_ENV);
console.log(configuration().POSTGRES);

export default dataSource;
