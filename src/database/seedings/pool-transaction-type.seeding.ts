import { Injectable } from '@nestjs/common';
import { ISeeding } from '../interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { PoolTransactionType } from '../entities';
import { Repository } from 'typeorm';

@Injectable()
export class PoolTransactionTypeSeeding implements ISeeding {
  constructor(
    @InjectRepository(PoolTransactionType)
    private readonly repository: Repository<PoolTransactionType>,
  ) {}

  async seed() {
    const data = await this.repository.findOne({ where: {} });

    if (!data) {
      await this.repository.save([
        new PoolTransactionType({
          id: 1,
          name: 'Swap',
        }),
        new PoolTransactionType({
          id: 2,
          name: 'Add',
        }),
        new PoolTransactionType({
          id: 3,
          name: 'Remove',
        }),
      ]);
    }
  }
}
