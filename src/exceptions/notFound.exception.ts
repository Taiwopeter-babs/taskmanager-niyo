import { HttpException, HttpStatus } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

export class NotFoundException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class UserNotFoundException extends NotFoundException {
  constructor(userId: number | string) {
    super(`User with the id: ${userId}, was not found`);
  }
}

export class TaskNotFoundException extends WsException {
  constructor(taskId: number) {
    super(`Task with the id: ${taskId}, was not found`);
  }
}
