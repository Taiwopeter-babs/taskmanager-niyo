import { HttpException, HttpStatus } from '@nestjs/common';

export class ServerErrorException extends HttpException {
  constructor() {
    super(
      'An error has occured with the server',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
