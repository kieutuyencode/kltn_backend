import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset, SwapPair } from '../entities';
import { ISeeding } from '../interfaces';

@Injectable()
export class SwapPairSeeding implements ISeeding {
  constructor(
    @InjectRepository(SwapPair)
    private readonly repository: Repository<SwapPair>,
  ) {}

  async seed() {
    const data = await this.repository.findOne({ where: {} });

    if (!data) {
      await this.repository.save([
        new SwapPair({
          id: 1,
          fromAsset: new Asset({ id: 1 }),
          toAsset: new Asset({ id: 5 }),
          fromMinAmount: 0,
          fromMaxAmount: 1000000,
          toFeePercent: 0.1,
        }),
        new SwapPair({
          id: 2,
          fromAsset: new Asset({ id: 2 }),
          toAsset: new Asset({ id: 1 }),
          fromMinAmount: 0,
          fromMaxAmount: 1000000,
          toFeePercent: 0.1,
        }),
        new SwapPair({
          id: 3,
          fromAsset: new Asset({ id: 6 }),
          toAsset: new Asset({ id: 1 }),
          fromMinAmount: 0,
          fromMaxAmount: 1000000,
          toFeePercent: 0.1,
        }),
      ]);
    }
  }
}
