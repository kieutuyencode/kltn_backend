import { Column, DeepPartial, Entity, ManyToOne } from 'typeorm';
import { IdWithTimestamps } from '../abstracts';
import { Network } from './network.entity';
import { AddressColumn } from '../decorators';

@Entity()
export class Contract extends IdWithTimestamps {
  constructor(entity: DeepPartial<Contract>) {
    super();
    Object.assign(this, entity);
  }

  @Column('varchar', { length: 100 })
  name: string;

  @Column('varchar', { length: 50, nullable: true })
  symbol?: string;

  @AddressColumn({ unique: true })
  address: string;

  @Column('int', { nullable: true })
  decimals?: number;

  @ManyToOne(() => Network)
  network: Network;

  @Column({ nullable: true })
  networkId: number;

  @Column('varchar', { nullable: true })
  description?: string;
}
