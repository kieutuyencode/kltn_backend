import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { CLIENT_ID, JwtService, SKIP_AUTH, decode } from '~/security';
import { Reflector } from '@nestjs/core';
import { TUserPayload } from '../types';
import { USER } from '../constants';

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isSkipAuth = this.isSkipAuthEndpoint(context);
    if (isSkipAuth) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers['userAccessToken'.toLowerCase()] as string;

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const data = this.jwtService.verifyToken(token) as TUserPayload;
      request[USER] = data;
      request[CLIENT_ID] = data.id;
    } catch (error) {
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn');
    }

    return true;
  }

  private isSkipAuthEndpoint(context: ExecutionContext): boolean {
    const isSkipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);
    return isSkipAuth;
  }
}
