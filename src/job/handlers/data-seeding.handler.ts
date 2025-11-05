import { Injectable } from '@nestjs/common';
import { ContractSeeding, NetworkSeeding } from '~/database';
import { Timeout } from '~/job/libs/nestjs/schedule';

@Injectable()
export class DataSeedingHandler {
  constructor(
    private readonly contractSeeding: ContractSeeding,
    private readonly networkSeeding: NetworkSeeding,
  ) {}

  @Timeout(DataSeedingHandler.name, 0)
  async handle() {
    const seedings = [this.networkSeeding, this.contractSeeding];

    for (const seeding of seedings) {
      await seeding.seed();
    }
  }
}
