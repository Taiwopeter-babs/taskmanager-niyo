// /* eslint-disable prettier/prettier */
import 'dotenv/config';
import { DataSourceOptions } from 'typeorm';

const CONFIG = {
  /** POSTGRESQL CONFIGURATION OPTIONS */
  POSTGRES: {
    type: 'postgres',
    host: process.env.POSTGRES_HOST as string,
    port: parseInt(process.env.POSTGRES_PORT as string, 10) || 5432,
    database: process.env.POSTGRES_DB as string,
    username: process.env.POSTGRES_USER as string,
    password: process.env.POSTGRES_PASSWORD as string,
  } as DataSourceOptions,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_VALID_TIME: process.env.JWT_VALID_TIME,
  NODE_ENV: process.env.NODE_ENV as 'development' | 'production',
  PORT: parseInt(process.env.PORT as string, 10) || 3001,
};

export default (): Record<string, any> => ({
  POSTGRES: CONFIG.POSTGRES,
  NODE_ENV: CONFIG.NODE_ENV,
  JWT_SECRET: CONFIG.JWT_SECRET,
  JWT_VALID_TIME: CONFIG.JWT_VALID_TIME,
  PORT: CONFIG.PORT,
  CORS_OPTIONS: {
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    origin: '*',
  },
});
