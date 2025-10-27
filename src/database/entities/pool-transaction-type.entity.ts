import { Column, DeepPartial, Entity } from 'typeorm';
import { IdWithTimestamps } from '../abstracts';

@Entity()
export class PoolTransactionType extends IdWithTimestamps {
  constructor(entity: DeepPartial<PoolTransactionType>) {
    super();
    Object.assign(this, entity);
  }

  @Column('varchar', { length: 100 })
  name: string;

  @Column('varchar', { nullable: true })
  description?: string;
}
