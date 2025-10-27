import Decimal from 'decimal.js';
import { Column, DeepPartial, Entity, Index, ManyToOne } from 'typeorm';
import { IdWithCreatedAt } from '../abstracts';
import { AddressColumn, DecimalColumn, TxhashColumn } from '../decorators';
import { Asset } from './asset.entity';
import { PoolTransactionType } from './pool-transaction-type.entity';
import { Pool } from './pool.entity';

@Entity()
@Index(['createdAt'])
export class PoolTransaction extends IdWithCreatedAt {
  constructor(entity: DeepPartial<PoolTransaction>) {
    super();
    Object.assign(this, entity);
  }

  @Index()
  @AddressColumn()
  fromAddress: string;

  @ManyToOne(() => PoolTransactionType)
  type: PoolTransactionType;

  @Column({ nullable: true })
  typeId: number;

  @TxhashColumn({ unique: true })
  txhash: string;

  @ManyToOne(() => Pool)
  pool: Pool;

  @Column({ nullable: true })
  poolId: number;

  @DecimalColumn()
  amount0: Decimal;

  @DecimalColumn()
  amount1: Decimal;

  @ManyToOne(() => Asset)
  token0: Asset;

  @ManyToOne(() => Asset)
  token1: Asset;
}
