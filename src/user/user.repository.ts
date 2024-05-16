import { FindManyOptions, Repository } from 'typeorm';
import User from './user.entity';
import { CreateUserDto, UpdateUserDto, UserDto } from './dto/user.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserAlreadyExistsException } from '../exceptions/badRequest.exception';
import { UserNotFoundException } from '../exceptions/notFound.exception';

import Mapper from '../utils/mapper';
import { IPagination, PagedUserDto } from '../utils/types';
import getPaginationOffset from '../utils/pagination';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  public async getUser(userId: number): Promise<User> {
    return (await this.getUserEntity(userId)) as User;
  }

  public async getPagedUsers(
    pageParams: IPagination,
  ): Promise<PagedUserDto | void> {
    try {
      const pageOffset = getPaginationOffset(pageParams);

      const paginationOptions: FindManyOptions<User> = {
        skip: pageOffset,
        take: pageParams.pageSize,
        order: { firstName: 'ASC' },
      };

      const [itemsCount, interns] = await Promise.all([
        // items count
        this.repo.count(),
        // data
        this.repo.find({ ...paginationOptions }),
      ]);

      const totalPages = Math.ceil(itemsCount / pageParams.pageSize);

      const data: PagedUserDto = {
        users: interns.map((user) => Mapper.toUserDto(user, false)),
        currentPage: pageParams.pageNumber,
        pageSize: pageParams.pageSize,
        totalPages: totalPages,
        totalItems: itemsCount,
        hasNext: pageParams.pageNumber < totalPages,
        hasPrevious: pageParams.pageNumber > 1,
      };

      return data;
    } catch (error) {
      throw error;
    }
  }

  public async getUserByEmail(email: string): Promise<User | void> {
    try {
      const user = await this.repo.findOne({
        where: { email: email.toLowerCase() },
        relations: { tasks: false },
      });

      if (!user) {
        throw new UserNotFoundException(email);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  public async createUser(user: CreateUserDto) {
    try {
      await this.checkUserExistsForCreation(user.email);

      const newUser = this.repo.create(user);

      await this.repo.save(newUser);

      return Mapper.toUserDto(newUser) as UserDto;
    } catch (error) {
      //   console.error(error);
      throw error;
    }
  }

  public async updateUser(userId: number, data: UpdateUserDto) {
    try {
      await this.getUserEntity(userId);

      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
      };

      await this.repo.update(userId, { ...updateData } as User);

      return true;
    } catch (error) {
      throw error;
    }
  }

  public async deleteUser(userId: number) {
    (await this.getUserEntity(userId)) as User;

    try {
      await this.repo
        .createQueryBuilder()
        .delete()
        .from(User)
        .where('id = :id', { id: userId })
        .execute();

      return true;
    } catch (error) {
      throw error;
    }
  }

  private async checkUserExistsForCreation(email: string): Promise<void> {
    try {
      const user = await this.repo.findOne({
        select: { id: true, email: true },
        where: { email: email.toLowerCase() },
        relations: { tasks: false },
      });

      if (user) {
        throw new UserAlreadyExistsException(email);
      }
    } catch (error) {
      throw error;
    }
  }

  private async getUserEntity(userId: number): Promise<User | void> {
    try {
      const user = await this.repo.findOne({
        where: { id: userId },
        relations: { tasks: true },
      });

      if (!user) {
        throw new UserNotFoundException(userId);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
}
