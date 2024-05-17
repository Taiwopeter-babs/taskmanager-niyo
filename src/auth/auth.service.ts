import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CookieOptions } from 'express';
import { ConfigService } from '@nestjs/config';

import { UserService } from '../user/user.service';
import User from 'src/user/user.entity';
import { WrongCredentialsException } from '../exceptions/badRequest.exception';

import { JwtService, JwtSignOptions } from '@nestjs/jwt';

import { ITokenPayload } from '../utils/types';

import { ServerErrorException } from '../exceptions/server.exception';
import { UserDto } from '../user/dto/user.dto';
import { UserNotFoundException } from '../exceptions/notFound.exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /** salt rounds to hash password with */
  private saltRounds = 10;

  private readonly jwtSecret = this.configService.get<string>(
    'JWT_SECRET',
  ) as string;

  private readonly jwtValidTime = this.configService.get(
    'JWT_VALID_TIME',
  ) as string;

  public async validateUser(email: string, password: string) {
    try {
      const user = (await this.userService.getUserByEmail(email)) as User;

      console.log(user);

      const isPasswordMatching = await this.verifyPassword(
        password,
        user.password,
      );

      if (!isPasswordMatching) {
        throw new WrongCredentialsException();
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  public async getJwtData(email: string): Promise<UserDto | undefined> {
    try {
      const user = await this.userService.getUserByEmail(email);

      if (!user) {
        throw new UserNotFoundException(email);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  /** Verifies a JWT and returns the user.
   * Throws a web socket error if token is invalid or user is not found
   */
  public async verifyTokenForSocket(token: string): Promise<UserDto | null> {
    try {
      const jwtValidTimeNumber = parseInt(this.jwtValidTime, 10) * 1000; // milliseconds

      const payload: ITokenPayload = await this.jwtService.verifyAsync(token, {
        secret: this.jwtSecret,
        ignoreExpiration: false,
        maxAge: jwtValidTimeNumber,
      });

      const { email } = payload;

      return await this.userService.getUserByEmail(email);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Signs and returns an access token and cookie options for session
   */
  public async getUserloginToken(user: User) {
    const payload: ITokenPayload = {
      email: user.email,
      sub: user.id,
    };

    const jwtValidTimeNumber = parseInt(this.jwtValidTime, 10);

    const jwtSignOptions: JwtSignOptions = {
      expiresIn: jwtValidTimeNumber,
      secret: this.jwtSecret,
    };

    const accessToken = await this.jwtService.signAsync(
      payload,
      jwtSignOptions,
    );

    const cookieOptions: CookieOptions = {
      maxAge: jwtValidTimeNumber * 1000, // milliseconds
      httpOnly: true,
    };

    return [cookieOptions, accessToken];
  }

  /**
   * ### verifies a password
   */
  private async verifyPassword(password: string, hash: string) {
    try {
      const isVerified = await bcrypt.compare(password, hash);
      return isVerified;
    } catch (error) {
      throw new ServerErrorException();
    }
  }

  /**
   * ### hashes a user password
   */
  public async hashPassword(password: string) {
    try {
      const salt = await bcrypt.genSalt(this.saltRounds);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      throw new ServerErrorException();
    }
  }
}
