import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

import { Gender } from '../user.entity';
import { PartialType } from '@nestjs/mapped-types';
import Task from 'src/task/task.entity';

class BaseUserDto {
  @IsNotEmpty()
  public firstName: string;

  @IsNotEmpty()
  public lastName: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  public gender: Gender;
}

/** Dto for user creation */
export class CreateUserDto extends BaseUserDto {
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @IsNotEmpty()
  public password: string;
}

/** Dto for user update. All properties are optional */
export class UpdateUserDto extends PartialType(BaseUserDto) {}

/** Dto for user login */
export class LoginUserDto {
  @IsEmail()
  public email: string;

  @IsNotEmpty()
  public password: string;
}

/** DTO for reading user's information */
export class UserDto {
  public id: number;

  public firstName: string;

  public lastName: string;

  public gender: string;

  public email: string;

  public password?: string;

  public tasks?: Task[];
}
