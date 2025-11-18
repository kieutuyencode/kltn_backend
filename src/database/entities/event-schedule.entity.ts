import { Column, DeepPartial, Entity, ManyToOne, OneToMany } from 'typeorm';
import { IdWithTimestamps } from '../abstracts';
import { DateTime } from '../../date-time';
import { AddressColumn, DateTimeColumn, TxhashColumn } from '../decorators';
import { EventTicketType } from './event-ticket-type.entity';
import { Event } from './event.entity';

@Entity()
export class EventSchedule extends IdWithTimestamps {
  constructor(entity: DeepPartial<EventSchedule>) {
    super();
    Object.assign(this, entity);
  }

  @DateTimeColumn()
  startDate: DateTime;

  @DateTimeColumn()
  endDate: DateTime;

  @AddressColumn()
  organizerAddress: string;

  @TxhashColumn({ nullable: true })
  assignTxhash?: string | null;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  event: Event;

  @Column({ nullable: true })
  eventId: number;

  @OneToMany(() => EventTicketType, (ticket) => ticket.schedule)
  ticketTypes: EventTicketType[];
}
