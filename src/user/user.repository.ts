import { Repository } from 'typeorm';
import User from './user.entity';
import { CreateUserDto, UpdateUserDto, UserDto } from './dto/user.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserAlreadyExistsException } from '../exceptions/badRequest.exception';

import Mapper from '../utils/mapper';

import { ServerErrorException } from '../exceptions/server.exception';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  public async getUser(userId: number): Promise<User | null> {
    return (await this.getUserEntity(userId)) as User | null;
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.repo.findOne({
        where: { email: email.toLowerCase() },
        relations: { tasks: false },
      });

      return user;
    } catch (error) {
      throw new ServerErrorException();
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

  private async getUserEntity(userId: number): Promise<User | null> {
    try {
      const user = await this.repo.findOne({
        where: { id: userId },
        relations: { tasks: true },
      });

      return user;
    } catch (error) {
      throw new ServerErrorException();
    }
  }
}
