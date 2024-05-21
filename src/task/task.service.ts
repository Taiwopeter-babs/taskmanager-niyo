import { Injectable } from '@nestjs/common';

import { AuthService } from '../auth/auth.service';
import { TaskRepository } from './task.repository';
import Task from './task.entity';
import { CreateTaskDto, TaskQueryDto, UpdateTaskDto } from './dto/task.dto';

import { PagedTaskDto } from '../utils/types';
import { Socket } from 'socket.io';
import constants from '../auth/constants';

@Injectable()
export class TaskService {
  constructor(
    private readonly taskRepo: TaskRepository,
    private readonly authService: AuthService,
  ) {}

  public async getTask(taskId: number, userId: number): Promise<Task | null> {
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

  public async createTask(
    task: CreateTaskDto,
  ): Promise<Omit<Task, 'user'> | null> {
    const newTask = await this.taskRepo.createTask(task);

    if (!newTask) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user, ...rest } = newTask;

    return rest;
  }

  public async updateTask(
    taskId: number,
    userId: number,
    data: UpdateTaskDto,
  ): Promise<boolean> {
    return await this.taskRepo.updateTask(taskId, userId, data);
  }

  public async deleteTask(taskId: number, userId: number): Promise<boolean> {
    const taskDeleted: boolean = await this.taskRepo.deleteTask(taskId, userId);

    return taskDeleted;
  }

  public async getUserFromSocket(socket: Socket) {
    const cookieString = socket.handshake.headers.cookie;

    const accessToken = this.parseCookie(cookieString);

    if (!accessToken) {
      return null;
    }

    return await this.authService.verifyTokenForSocket(accessToken!);
  }

  private parseCookie(cookieString: string | undefined) {
    if (!cookieString) {
      return null;
    }

    // 'authenticationNiyo' is the name of the cookie.
    /** @see {@link AuthService.getUserloginToken}  */
    // only one cookie in the header
    if (!cookieString.includes(';')) {
      return cookieString.includes(constants.cookieName)
        ? cookieString.split('=')[1]
        : null;
    }

    // multiple cookies in header
    const accessToken = cookieString
      .split('; ')
      .find((cookie: string) => cookie.startsWith(constants.cookieName))
      ?.split('=')[1];

    return accessToken;
  }
}
