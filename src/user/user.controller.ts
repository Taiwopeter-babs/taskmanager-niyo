import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { UserService } from './user.service';

import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { CreateUserDto, UpdateUserDto, UserDto } from './dto/user.dto';

import { UserNotFoundException } from '../exceptions/notFound.exception';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  public async AddUser(@Body() createUserDto: CreateUserDto) {
    const user = (await this.userService.createUser(createUserDto)) as UserDto;

    return {
      statusCode: HttpStatus.OK,
      message: 'Registration successful',
      ...user,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  public async getUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.getUser(id);

    if (!user) {
      throw new UserNotFoundException(id);
    }

    return { statusCode: 200, ...user };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  public async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.userService.updateUser(id, updateUserDto);

    return {};
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  public async deleteUser(@Param('id', ParseIntPipe) id: number) {
    await this.userService.deleteUser(id);
    return {};
  }
}
