import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { ITokenPayload } from '../../utils/types';

import constants from '../constants';
import { Request } from 'express';
import { AuthService } from '../auth.service';

/**
 * Extracts the cookie value from the request object
 */
export const cookieExtractor = (request: Request): string => {
  let accessToken: string;

  if (request.cookies) {
    accessToken = request.cookies[constants.cookieName];

    return accessToken;
  }

  return '';
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, constants.jwt) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: ITokenPayload) {
    // entityType determines where data is pulled from
    const { email } = payload;

    return await this.authService.getJwtData(email);
  }
}
