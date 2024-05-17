import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

import Task from '../task/task.entity';
import User from '../user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get<DataSourceOptions>('POSTGRES'),

        // configured for development environments only
        synchronize: configService.get<string>('NODE_ENV') === 'development',
        // synchronize: false,

        // entities configured with TypeOrmModule.forFeature() are loaded
        autoLoadEntities: true,
        // NestJs autoLoadEntities didn't work. entities had to be specified
        entities: [User, Task],
        migrations: ['./migrations/*.ts'],
        migrationsTableName: 'niyo_migrations',
      }),
    }),
  ],
})
export class DatabaseModule {}
