import { Column, DeepPartial, Entity, Index, ManyToOne } from 'typeorm';
import { IdWithTimestamps } from '../abstracts';
import { Asset } from './asset.entity';
import { DecimalColumn } from '../decorators';
import Decimal from 'decimal.js';

@Entity()
@Index(['fromAssetId', 'toAssetId'], { unique: true })
export class SwapPair extends IdWithTimestamps {
  constructor(entity: DeepPartial<SwapPair>) {
    super();
    Object.assign(this, entity);
  }

  @ManyToOne(() => Asset)
  fromAsset: Asset;

  @Column({ nullable: true })
  fromAssetId: number;

  @ManyToOne(() => Asset)
  toAsset: Asset;

  @Column({ nullable: true })
  toAssetId: number;

  @DecimalColumn({ nullable: true })
  fromMinAmount: Decimal;

  @DecimalColumn({ nullable: true })
  fromMaxAmount: Decimal;

  @DecimalColumn()
  toFeePercent: Decimal;

  @Column('int', { default: 0 })
  order: number;

  @Column('boolean', { default: true })
  isEnabled: boolean;
}
