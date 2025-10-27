import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SwapStatus } from '../entities';
import { ISeeding } from '../interfaces';

@Injectable()
export class SwapStatusSeeding implements ISeeding {
  constructor(
    @InjectRepository(SwapStatus)
    private readonly repository: Repository<SwapStatus>,
  ) {}

  async seed() {
    const data = await this.repository.findOne({ where: {} });

    if (!data) {
      await this.repository.save([
        new SwapStatus({
          id: 1,
          name: 'Incomplete',
        }),
        new SwapStatus({
          id: 2,
          name: 'Pending confirmation',
        }),
        new SwapStatus({
          id: 3,
          name: 'Processing',
        }),
        new SwapStatus({
          id: 4,
          name: 'Processed',
        }),
        new SwapStatus({
          id: 5,
          name: 'Success',
        }),
        new SwapStatus({
          id: 6,
          name: 'Fail',
        }),
      ]);
    }
  }
}
