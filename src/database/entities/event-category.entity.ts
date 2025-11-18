import { Column, DeepPartial, Entity } from 'typeorm';
import { IdWithTimestamps } from '../abstracts';

@Entity()
export class EventCategory extends IdWithTimestamps {
  constructor(entity: DeepPartial<EventCategory>) {
    super();
    Object.assign(this, entity);
  }

  @Column('varchar', { length: 50 })
  name: string;

  @Column('varchar', { length: 50, unique: true })
  slug: string;
}
