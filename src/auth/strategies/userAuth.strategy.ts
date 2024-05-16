import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-local';

import { AuthService } from '../auth.service';
import constants from '../constants';

import User from 'src/user/user.entity';

/** This guard validates the user email and password before login */
@Injectable()
export class UserAuthStrategy extends PassportStrategy(
  Strategy,
  constants.userAuth,
) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // The email is read from the request body
    });
  }

  /** Populates the Request object with the company object */
  async validate(email: string, password: string): Promise<User> {
    return (await this.authService.validateUser(email, password)) as User;
  }
}
