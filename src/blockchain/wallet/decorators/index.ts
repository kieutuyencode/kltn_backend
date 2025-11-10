import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  UseGuards,
} from '@nestjs/common';
import { WalletAuthGuard } from '../guards';
import { AccessControlled } from '~/security';
import { WALLET_ADDRESS } from '../constants';

export const WalletAuth = () =>
  applyDecorators(UseGuards(WalletAuthGuard), AccessControlled());

export const WalletAddress = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request[WALLET_ADDRESS];
  },
);
