import { Injectable } from '@nestjs/common';
import { ISeeding } from '../interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Asset, Contract, Network } from '../entities';
import { Repository } from 'typeorm';

@Injectable()
export class AssetSeeding implements ISeeding {
  constructor(
    @InjectRepository(Asset)
    private readonly repository: Repository<Asset>,
  ) {}

  async seed() {
    const data = await this.repository.findOne({ where: {} });

    if (!data) {
      await this.repository.save([
        new Asset({
          id: 1,
          name: 'Tobe Chain',
          symbol: 'TOBE',
          decimals: 18,
          priceUSD: 0.1,
          network: new Network({ id: 1 }),
        }),
        new Asset({
          id: 2,
          name: 'Binance Testnet',
          symbol: 'BNB',
          decimals: 18,
          priceUSD: 646.84,
          network: new Network({ id: 2 }),
        }),
        new Asset({
          id: 3,
          name: 'Ethereum Testnet',
          symbol: 'ETH',
          decimals: 18,
          priceUSD: 2524.28,
          network: new Network({ id: 3 }),
        }),
        new Asset({
          id: 4,
          name: 'HyperNet',
          symbol: 'HNET',
          decimals: 18,
          priceUSD: 0.124,
          contract: new Contract({ id: 6 }),
          network: new Network({ id: 1 }),
        }),
        new Asset({
          id: 5,
          name: 'FluxWave',
          symbol: 'FLW',
          decimals: 18,
          priceUSD: 0.124,
          contract: new Contract({ id: 7 }),
          network: new Network({ id: 2 }),
        }),
        new Asset({
          id: 6,
          name: 'StellarByte',
          symbol: 'STB',
          decimals: 18,
          priceUSD: 0.0826,
          contract: new Contract({ id: 8 }),
          network: new Network({ id: 3 }),
        }),
      ]);
    }
  }
}
