import { Injectable } from '@nestjs/common';
import { ISeeding } from '../interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Network } from '../entities';
import { Repository } from 'typeorm';

@Injectable()
export class NetworkSeeding implements ISeeding {
  constructor(
    @InjectRepository(Network)
    private readonly repository: Repository<Network>,
  ) {}

  async seed() {
    const data = await this.repository.findOne({ where: {} });

    if (!data) {
      await this.repository.save([
        new Network({
          id: 1,
          name: 'Tobe Chain',
          symbol: 'TOBE',
          rpcUrl: 'https://rpc.tobescan.com',
          explorerUrl: 'https://tobescan.com',
          chainId: 4080,
          decimals: 18,
        }),
        new Network({
          id: 2,
          name: 'BNB Smart Chain Testnet',
          symbol: 'BNB',
          rpcUrl: 'https://data-seed-prebsc-1-s1.bnbchain.org:8545',
          explorerUrl: 'https://testnet.bscscan.com',
          chainId: 97,
          decimals: 18,
        }),
        new Network({
          id: 3,
          name: 'Sepolia',
          symbol: 'ETH',
          rpcUrl: 'https://sepolia.drpc.org',
          explorerUrl: 'https://sepolia.etherscan.io',
          chainId: 11155111,
          decimals: 18,
        }),
      ]);
    }
  }
}
