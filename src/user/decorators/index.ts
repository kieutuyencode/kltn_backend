import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  UseGuards,
} from '@nestjs/common';
import { UserAuthGuard } from '../guards';
import { AccessControlled } from '~/security';
import { USER } from '../constants';

export const UserAuth = () =>
  applyDecorators(UseGuards(UserAuthGuard), AccessControlled());

export const UserPayload = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request[USER];
  },
);
