import { Column, DeepPartial, Entity, ManyToOne } from 'typeorm';
import { IdWithTimestamps } from '../abstracts';
import { DateTime } from '../../date-time';
import { DateTimeColumn, DecimalColumn } from '../decorators';
import Decimal from 'decimal.js';
import { EventSchedule } from './event-schedule.entity';
import { Event } from './event.entity';

@Entity()
export class EventTicketType extends IdWithTimestamps {
  constructor(entity: DeepPartial<EventTicketType>) {
    super();
    Object.assign(this, entity);
  }

  @Column('varchar', { length: 100 })
  name: string;

  @Column('text')
  description: string;

  @DecimalColumn()
  price: Decimal;

  @Column('int')
  originalQuantity: number;

  @Column('int')
  remainingQuantity: number;

  @DateTimeColumn()
  saleStartDate: DateTime;

  @DateTimeColumn()
  saleEndDate: DateTime;

  @ManyToOne(() => EventSchedule, { onDelete: 'CASCADE' })
  schedule: EventSchedule;

  @Column({ nullable: true })
  scheduleId: number;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  event: Event;

  @Column({ nullable: true })
  eventId: number;
}
