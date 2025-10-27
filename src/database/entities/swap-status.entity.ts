import { Column, DeepPartial, Entity } from 'typeorm';
import { IdWithTimestamps } from '../abstracts';

@Entity()
export class SwapStatus extends IdWithTimestamps {
  constructor(entity: DeepPartial<SwapStatus>) {
    super();
    Object.assign(this, entity);
  }

  @Column('varchar', { length: 100 })
  name: string;

  @Column('varchar', { nullable: true })
  description?: string;
}
