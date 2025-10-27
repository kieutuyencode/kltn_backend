import { Column, DeepPartial, Entity } from 'typeorm';
import { IdWithTimestamps } from '../abstracts';

@Entity()
export class Network extends IdWithTimestamps {
  constructor(entity: DeepPartial<Network>) {
    super();
    Object.assign(this, entity);
  }

  @Column('varchar', { length: 100 })
  name: string;

  @Column('varchar', { length: 50 })
  symbol: string;

  @Column('varchar', { unique: true })
  rpcUrl: string;

  @Column('varchar')
  explorerUrl: string;

  @Column('int', { unique: true })
  chainId: number;

  @Column('int')
  decimals: number;

  @Column('varchar', { nullable: true })
  description?: string;
}
