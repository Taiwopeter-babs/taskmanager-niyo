import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CookieOptions, Request, Response } from 'express';

import { AuthService } from './auth.service';
import { JwtAuthGuard, UserAuthGuard } from './guards/auth.guard';
import User from 'src/user/user.entity';
import constants from './constants';

import Mapper from '../utils/mapper';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @UseGuards(UserAuthGuard)
  @Post('users/login')
  public async loginUser(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    // object comes from authentication strategy: UserAuthStrategy
    const user = request.user as User;

    const [cookieOptions, accessToken] =
      (await this.authService.getUserloginToken(user)) as [
        CookieOptions,
        string,
      ];

    // set payload for cookie
    response.cookie(constants.cookieName, accessToken, cookieOptions);

    return {
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      ...Mapper.toUserDto(user),
    };
  }

  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @Post('users/logout')
  async logoutUser(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(constants.cookieName);
    return response.sendStatus(200);
  }
}
