import { Column, DeepPartial, Entity, ManyToOne, OneToMany } from 'typeorm';
import { IdWithTimestamps } from '../abstracts';
import { EventCategory } from './event-category.entity';
import { EventStatus } from './event-status.entity';
import { EventSchedule } from './event-schedule.entity';
import { User } from './user.entity';

@Entity()
export class Event extends IdWithTimestamps {
  constructor(entity: DeepPartial<Event>) {
    super();
    Object.assign(this, entity);
  }

  @Column('varchar', { length: 100 })
  name: string;

  @Column('varchar', { length: 100, unique: true })
  slug: string;

  @Column('varchar', { length: 100 })
  address: string;

  @Column('text')
  description: string;

  @Column('varchar', { length: 50 })
  image: string;

  @ManyToOne(() => EventCategory)
  category: EventCategory;

  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => EventStatus)
  status: EventStatus;

  @Column({ nullable: true })
  statusId: number;

  @ManyToOne(() => User)
  user: User;

  @Column({ nullable: true })
  userId: number;

  @OneToMany(() => EventSchedule, (schedule) => schedule.event)
  schedules: EventSchedule[];
}
