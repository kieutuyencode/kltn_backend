import { Column, DeepPartial, Entity } from 'typeorm';
import { IdWithTimestamps } from '../abstracts';

@Entity()
export class Config extends IdWithTimestamps {
  constructor(entity: DeepPartial<Config>) {
    super();
    Object.assign(this, entity);
  }

  @Column('varchar', { unique: true })
  key: string;

  @Column('text')
  value: string;

  @Column('text', { nullable: true })
  description?: string;
}
