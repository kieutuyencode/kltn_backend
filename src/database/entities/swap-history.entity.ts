import {
  Column,
  DeepPartial,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { IdWithTimestamps } from '../abstracts';
import { Asset } from './asset.entity';
import { AddressColumn, DecimalColumn, TxhashColumn } from '../decorators';
import Decimal from 'decimal.js';
import { SwapStatus } from './swap-status.entity';
import { Network } from './network.entity';

@Entity()
@Index(['createdAt'])
export class SwapHistory extends IdWithTimestamps {
  constructor(entity: DeepPartial<SwapHistory>) {
    super();
    Object.assign(this, entity);
  }

  @Index()
  @AddressColumn()
  fromAddress: string;

  @Index()
  @AddressColumn()
  toAddress: string;

  @ManyToOne(() => Asset)
  fromAsset?: Asset;

  @Column({ nullable: true })
  fromAssetId?: number;

  @ManyToOne(() => Asset)
  toAsset?: Asset;

  @Column({ nullable: true })
  toAssetId?: number;

  @ManyToOne(() => Network)
  fromNetwork: Network;

  @DecimalColumn()
  fromAmount: Decimal;

  @DecimalColumn()
  toAmount: Decimal;

  @DecimalColumn()
  toFee: Decimal;

  @TxhashColumn({ unique: true })
  fromTxhash: string;

  @TxhashColumn({ unique: true, nullable: true })
  toTxhash?: string;

  @ManyToOne(() => SwapStatus)
  status: SwapStatus;

  @Column({ nullable: true })
  statusId: number;
}
