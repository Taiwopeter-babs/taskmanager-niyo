import { Injectable } from '@nestjs/common';

import { CreateUserDto, UpdateUserDto, UserDto } from './dto/user.dto';

import { IPagination, PagedUserDto } from '../utils/types';

import User from './user.entity';
import Mapper from '../utils/mapper';

import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private repo: UserRepository) {}

  public async getManyUsers(pageParams: IPagination): Promise<PagedUserDto> {
    return (await this.repo.getPagedUsers(pageParams)) as PagedUserDto;
  }

  public async getUser(userId: number): Promise<UserDto> {
    const user = (await this.repo.getUser(userId)) as User;
    console.log(user);
    return Mapper.toUserDto(user, true);
  }

  public async getUserByEmail(email: string): Promise<UserDto> {
    return (await this.repo.getUserByEmail(email)) as User;
  }

  public async createUser(user: CreateUserDto) {
    const newUser = (await this.repo.createUser(user)) as User;

    return Mapper.toUserDto(newUser) as UserDto;
  }

  public async updateUser(userId: number, data: UpdateUserDto) {
    const isUpdated = await this.repo.updateUser(userId, data);

    return isUpdated;
  }

  public async deleteUser(userId: number) {
    const isDeleted = await this.repo.deleteUser(userId);

    return isDeleted;
  }
}