import { Injectable } from '@nestjs/common';

import { AuthService } from '../auth/auth.service';
import { TaskRepository } from './task.repository';
import Task from './task.entity';
import { CreateTaskDto, TaskQueryDto, UpdateTaskDto } from './dto/task.dto';

import { Socket } from 'socket.io';
import { parse } from 'cookie';
import { WsException } from '@nestjs/websockets';
import { UpdateResult } from 'typeorm';
import { PagedTaskDto } from '../utils/types';

@Injectable()
export class TaskService {
  constructor(
    private readonly taskRepo: TaskRepository,
    private readonly authService: AuthService,
  ) {}

  public async getTask(taskId: number, userId: number): Promise<Task> {
    const task = await this.taskRepo.getTask(taskId, userId);

    return task;
  }

  public async getPagedUserTasks(
    userId: number,
    taskPageParams: TaskQueryDto,
  ): Promise<PagedTaskDto> {
    const tasks = await this.taskRepo.getUserPagedTasks(userId, taskPageParams);

    return tasks as PagedTaskDto;
  }

  public async createTask(task: CreateTaskDto): Promise<Task> {
    const newTask = await this.taskRepo.createTask(task);

    return newTask;
  }

  public async updateTask(
    taskId: number,
    userId: number,
    data: UpdateTaskDto,
  ): Promise<UpdateResult> {
    const updatedTask = await this.updateTask(taskId, userId, data);

    return updatedTask;
  }

  public async deleteTask(taskId: number, userId: number): Promise<boolean> {
    const taskDeleted: boolean = await this.deleteTask(taskId, userId);

    return taskDeleted;
  }

  public async getUserFromSocket(socket: Socket) {
    const cookie = socket.request.headers.cookie;

    if (!cookie) {
      throw new WsException('Unauthorized access');
    }

    // 'authenticationNiyo' is the name of the cookie.
    /** @see {@link AuthService.getUserloginToken}  */
    const { authenticationNiyo: authenticationToken } = parse(cookie);

    const user =
      await this.authService.verifyTokenForSocket(authenticationToken);

    if (!user) {
      throw new WsException('Invalid credentials.');
    }
    return user;
  }
}
