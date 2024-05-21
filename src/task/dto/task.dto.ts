import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { PartialType } from '@nestjs/mapped-types';
import User from '../../user/user.entity';
import { TaskStatus } from '../task.entity';

class BaseTaskDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(60)
  public title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(256)
  public description: string;
}

/** Dto for task creation */
export class CreateTaskDto extends BaseTaskDto {
  @IsNotEmpty()
  @IsInt()
  public userId: number;
}

/** Dto for task update. All properties are optional */
export class UpdateTaskDto extends PartialType(BaseTaskDto) {
  @IsOptional()
  @IsEnum(TaskStatus)
  public isCompleted?: TaskStatus;

  @IsNotEmpty()
  @IsInt()
  public taskId: number;
}

/** Dto for task query parameters. All properties are optional */
export class TaskQueryDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  public taskStatus?: TaskStatus;

  @IsOptional()
  @IsInt()
  pageNumber: number;

  @IsOptional()
  @IsInt()
  pageSize: number;
}

/** DTO for reading a task information */
export class TaskDto {
  public id: number;

  public title: string;

  public description: string;

  public userId: number;

  public isCompleted?: TaskStatus;

  public author: User;
}
