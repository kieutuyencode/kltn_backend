import Decimal from 'decimal.js';
import { DeepPartial, Entity } from 'typeorm';
import { IdWithTimestamps } from '../abstracts';
import { AddressColumn, BigIntColumn } from '../decorators';

@Entity()
export class Wallet extends IdWithTimestamps {
  constructor(entity: DeepPartial<Wallet>) {
    super();
    Object.assign(this, entity);
  }

  @AddressColumn({ unique: true })
  address: string;

  @BigIntColumn({
    unsigned: true,
  })
  nonce: Decimal;
}
