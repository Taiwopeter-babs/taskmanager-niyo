import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Task from './task.entity';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { TaskGateway } from './task.gateway';
import { TaskRepository } from './task.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    ConfigModule,
    UserModule,
    AuthModule,
  ],
  providers: [TaskRepository, TaskService, TaskGateway],
})
export class TaskModule {}
