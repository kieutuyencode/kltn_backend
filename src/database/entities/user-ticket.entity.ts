import { Exclude } from 'class-transformer';
import { Column, DeepPartial, Entity, ManyToOne } from 'typeorm';
import { IdWithTimestamps } from '../abstracts';
import { AddressColumn, TxhashColumn } from '../decorators';
import { EventSchedule } from './event-schedule.entity';
import { EventTicketType } from './event-ticket-type.entity';
import { Event } from './event.entity';
import { User } from './user.entity';

@Entity()
export class UserTicket extends IdWithTimestamps {
  constructor(entity: DeepPartial<UserTicket>) {
    super();
    Object.assign(this, entity);
  }

  @AddressColumn()
  walletAddress: string;

  @Exclude()
  @Column('varchar', { length: 100, nullable: true })
  qrCode?: string;

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

  @Column('int', { unique: true })
  _ticketId: number;

  @Column('boolean', { default: false })
  _isRedeemed: boolean;

  @TxhashColumn({ nullable: true })
  redeemTxhash?: string | null;
}
