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
    const isAccessControlled = this.isAccessControlledEndpoint(context);

    // Nếu route KHÔNG có decorator @AccessControlled() => bỏ qua guard, cho phép truy cập
    if (!isAccessControlled) {
      return true;
    }

    // Nếu có decorator => mới kiểm tra quyền
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
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

// @Injectable()
// export class AccessControlGuard implements CanActivate {
//   constructor(private readonly reflector: Reflector) {}

//   canActivate(context: ExecutionContext): boolean {
//     if (!this.isAccessControlledEndpoint(context)) {
//       throw new ForbiddenException('Access denied');
//     }

//     return true;
//   }

//   private isAccessControlledEndpoint(context: ExecutionContext): boolean {
//     const isAccessControlled = this.reflector.getAllAndOverride<boolean>(
//       ACCESS_CONTROLLED,
//       [context.getHandler(), context.getClass()],
//     );
//     return isAccessControlled;
//   }
// }
