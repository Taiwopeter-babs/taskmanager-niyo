import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import constants from '../constants';

/** This guard uses the UserAuthStrategy to validate a user */
@Injectable()
export class UserAuthGuard extends AuthGuard(constants.userAuth) {}

/** validates and authorizes all requests it decorates */
@Injectable()
export class JwtAuthGuard extends AuthGuard(constants.jwt) {}
