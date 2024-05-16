import { FindManyOptions, Repository } from 'typeorm';
import Task from './task.entity';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './dto/task.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TaskNotFoundException } from '../exceptions/notFound.exception';

import { PagedTaskDto } from '../utils/types';
import getPaginationOffset from '../utils/pagination';

import { UserRepository } from '../user/user.repository';

@Injectable()
export class TaskRepository {
  constructor(
    @InjectRepository(Task)
    private repo: Repository<Task>,
    private userRepo: UserRepository,
  ) {}

  public async getTask(userId: number, taskId: number): Promise<Task> {
    return (await this.getTaskEntity(taskId, userId)) as Task;
  }

  public async getUserPagedTasks(
    userId: number,
    taskQueryParams: TaskQueryDto,
  ): Promise<PagedTaskDto | void> {
    try {
      const pageOffset = getPaginationOffset(taskQueryParams);

      const paginationOptions = this.getPaginationOptions(
        userId,
        taskQueryParams,
        pageOffset,
      );

      const [itemsCount, tasks] = await Promise.all([
        // items count
        this.repo.count(),
        // data
        this.repo.find({ ...paginationOptions }),
      ]);

      const totalPages = Math.ceil(itemsCount / taskQueryParams.pageSize);

      const data: PagedTaskDto = {
        tasks: tasks,
        currentPage: taskQueryParams.pageNumber,
        pageSize: taskQueryParams.pageSize,
        totalPages: totalPages,
        totalItems: itemsCount,
        hasNext: taskQueryParams.pageNumber < totalPages,
        hasPrevious: taskQueryParams.pageNumber > 1,
      };

      return data;
    } catch (error) {
      throw error;
    }
  }

  public async createTask(task: CreateTaskDto, userId: number) {
    try {
      const user = await this.userRepo.getUser(userId);

      const newTask = this.repo.create({ ...task, user });

      await this.repo.save(newTask);

      return newTask;
    } catch (error) {
      //   console.error(error);
      throw error;
    }
  }

  public async updateTask(taskId: number, userId: number, data: UpdateTaskDto) {
    try {
      await this.getTaskEntity(taskId, userId);

      const updateData = {
        title: data.title,
        description: data.description,
        isCompleted: data.isCompleted,
      } as unknown as Task;

      await this.repo.update(taskId, { ...updateData });

      return true;
    } catch (error) {
      throw error;
    }
  }

  public async deleteTask(taskId: number, userId: number) {
    (await this.getTaskEntity(taskId, userId)) as Task;

    try {
      await this.repo
        .createQueryBuilder()
        .delete()
        .from(Task)
        .where('id = :id', { id: taskId })
        .execute();

      return true;
    } catch (error) {
      throw error;
    }
  }

  private async getTaskEntity(
    taskId: number,
    userId: number,
  ): Promise<Task | void> {
    try {
      const task = await this.repo.findOne({
        where: { id: taskId, userId: userId },
        relations: { user: true },
      });

      if (!task) {
        throw new TaskNotFoundException(taskId);
      }

      return task;
    } catch (error) {
      throw error;
    }
  }

  private getPaginationOptions(
    userId: number,
    taskQueryParams: TaskQueryDto,
    pageOffset: number,
  ) {
    let paginationOptions: FindManyOptions<Task>;

    const baseOptions: FindManyOptions<Task> = {
      skip: pageOffset,
      take: taskQueryParams.pageSize,
      order: { title: 'ASC' }, // order by title
    };

    // If the taskStatus parameter is defined, then the tasks will be
    // filtered by it, otherwise all tasks will be returned
    if (!taskQueryParams.taskStatus) {
      paginationOptions = {
        where: { userId: userId },
        ...baseOptions,
      };
    } else {
      paginationOptions = {
        ...baseOptions,
        where: { isCompleted: taskQueryParams.taskStatus, userId: userId },
      };
    }

    return paginationOptions;
  }
}
