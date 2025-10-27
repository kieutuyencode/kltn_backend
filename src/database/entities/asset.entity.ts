import {
  Column,
  DeepPartial,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { IdWithTimestamps } from '../abstracts';
import { DecimalColumn } from '../decorators';
import Decimal from 'decimal.js';
import { Expose } from 'class-transformer';
import { Network } from './network.entity';
import { Contract } from './contract.entity';

@Entity()
export class Asset extends IdWithTimestamps {
  constructor(entity: DeepPartial<Asset>) {
    super();
    Object.assign(this, entity);
  }

  @Column('varchar', { length: 100 })
  name: string;

  @Column('varchar', { length: 50 })
  symbol: string;

  @Column('int')
  decimals: number;

  @DecimalColumn()
  priceUSD: Decimal;

  @Column('varchar', { length: 50, nullable: true })
  image: string;

  @ManyToOne(() => Network)
  network: Network;

  @Column({ nullable: true })
  networkId?: number;

  @OneToOne(() => Contract)
  @JoinColumn()
  contract?: Contract;

  @Column({ nullable: true })
  contractId?: number;
}
