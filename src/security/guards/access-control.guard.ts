import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACCESS_CONTROLLED } from '../constants';

@Injectable()
export class AccessControlGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (!this.isAccessControlledEndpoint(context)) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }

  private isAccessControlledEndpoint(context: ExecutionContext): boolean {
    const isAccessControlled = this.reflector.getAllAndOverride<boolean>(
      ACCESS_CONTROLLED,
      [context.getHandler(), context.getClass()],
    );
    return isAccessControlled;
  }
}
