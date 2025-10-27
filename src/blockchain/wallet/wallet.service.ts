import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository, Repository, Wallet } from '~/database';
import { verifySignature } from '../utils';
import { SignInDto } from './dtos';
import Decimal from 'decimal.js';
import { encode } from '~/security';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  async signIn({ message, signature }: SignInDto) {
    const { address, nonce } = await verifySignature({ message, signature });

    let walletData = await this.walletRepository.findOne({
      where: { address },
    });

    if (!walletData) {
      walletData = new Wallet({ address });
    } else if (walletData.nonce.greaterThanOrEqualTo(nonce)) {
      throw new BadRequestException('Invalid nonce');
    }

    walletData.nonce = new Decimal(nonce);
    await this.walletRepository.save(walletData);

    return {
      accessToken: encode({ message, signature }),
    };
  }

  async verifyNonce({ address, nonce }: { address: string; nonce: string }) {
    const walletData = await this.walletRepository.findOne({
      where: { address },
    });

    if (!walletData || !walletData.nonce.equals(nonce)) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
