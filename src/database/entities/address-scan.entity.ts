import { Column, DeepPartial, Entity, Index } from 'typeorm';
import { IdWithTimestamps } from '../abstracts';
import { AddressColumn, BigIntColumn } from '../decorators';
import Decimal from 'decimal.js';

@Entity()
@Index(['address', 'chainId'], { unique: true })
export class AddressScan extends IdWithTimestamps {
  constructor(entity: DeepPartial<AddressScan>) {
    super();
    Object.assign(this, entity);
  }

  @AddressColumn()
  address: string;

  @Column('int')
  chainId: number;

  @BigIntColumn()
  blockNumber: Decimal;
}
