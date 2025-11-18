import { Column, DeepPartial, Entity, ManyToOne } from 'typeorm';
import { IdWithTimestamps } from '../abstracts';
import { EventSchedule } from './event-schedule.entity';
import { User } from './user.entity';
import { EventTicketType } from './event-ticket-type.entity';
import { Event } from './event.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class UserTicket extends IdWithTimestamps {
  constructor(entity: DeepPartial<UserTicket>) {
    super();
    Object.assign(this, entity);
  }

  @Exclude()
  @Column('varchar', { length: 100, unique: true })
  qrCode: string;

  @Column('boolean', { default: false })
  isRedeemed: boolean;

  @ManyToOne(() => EventTicketType, { onDelete: 'SET NULL' })
  ticketType: EventTicketType;

  @Column({ nullable: true })
  ticketTypeId: number;

  @ManyToOne(() => EventSchedule, { onDelete: 'SET NULL' })
  schedule: EventSchedule;

  @Column({ nullable: true })
  scheduleId: number;

  @ManyToOne(() => Event, { onDelete: 'SET NULL' })
  event: Event;

  @Column({ nullable: true })
  eventId: number;

  @ManyToOne(() => User)
  user: User;

  @Column({ nullable: true })
  userId: number;

  @Column('int')
  _ticketId: number;
}
