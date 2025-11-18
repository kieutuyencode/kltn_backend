import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SKIP_AUTH, decode } from '~/security';
import { Reflector } from '@nestjs/core';
import { WalletService } from '~/blockchain/wallet/wallet.service';
import { verifySignature } from '../../utils';
import { WALLET_ADDRESS } from '../constants';

@Injectable()
export class WalletAuthGuard implements CanActivate {
  constructor(
    private walletService: WalletService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isSkipAuth = this.isSkipAuthEndpoint(context);
    if (isSkipAuth) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers['walletAccessToken'.toLowerCase()] as string;

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const { message, signature } = JSON.parse(decode(token));

      const data = await verifySignature({ message, signature });
      const { address, nonce } = data;

      const isValidNonce = await this.walletService.verifyNonce({
        address,
        nonce,
      });
      if (!isValidNonce) {
        throw new UnauthorizedException('Phiên đăng nhập ví đã hết hạn');
      }

      request[WALLET_ADDRESS] = address;
    } catch (error) {
      throw new UnauthorizedException();
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
