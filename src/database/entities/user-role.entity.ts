import { Column, DeepPartial, Entity } from 'typeorm';
import { IdWithTimestamps } from '../abstracts';

@Entity()
export class UserRole extends IdWithTimestamps {
  constructor(entity: DeepPartial<UserRole>) {
    super();
    Object.assign(this, entity);
  }

  @Column('varchar', { length: 50 })
  name: string;

  @Column('varchar', { nullable: true })
  description?: string;
}
