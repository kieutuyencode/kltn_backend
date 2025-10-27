import Decimal from 'decimal.js';
import { Column, DeepPartial, Entity, Index, ManyToOne } from 'typeorm';
import { IdWithTimestamps } from '../abstracts';
import { AddressColumn, DecimalColumn } from '../decorators';
import { Asset } from './asset.entity';
import { Network } from './network.entity';

@Entity()
@Index(['token0Id', 'token1Id'], { unique: true })
export class Pool extends IdWithTimestamps {
  constructor(entity: DeepPartial<Pool>) {
    super();
    Object.assign(this, entity);
  }

  @AddressColumn({ unique: true })
  address: string;

  @ManyToOne(() => Network)
  network: Network;

  @ManyToOne(() => Asset)
  token0: Asset;

  @Column({ nullable: true })
  token0Id: number;

  @ManyToOne(() => Asset)
  token1: Asset;

  @Column({ nullable: true })
  token1Id: number;

  @DecimalColumn()
  balance: Decimal;

  @DecimalColumn()
  token0Balance: Decimal;

  @DecimalColumn()
  token1Balance: Decimal;

  @DecimalColumn()
  token0Volume: Decimal;

  @DecimalColumn()
  token1Volume: Decimal;

  @DecimalColumn()
  token0Volume24h: Decimal;

  @DecimalColumn()
  token1Volume24h: Decimal;
}
