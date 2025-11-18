import Decimal from 'decimal.js';
import { Column, DeepPartial, Entity, ManyToOne } from 'typeorm';
import { IdWithTimestamps } from '../abstracts';
import { AddressColumn, DecimalColumn, TxhashColumn } from '../decorators';
import { EventTicketType } from './event-ticket-type.entity';
import { PaymentTicketStatus } from './payment-ticket-status.entity';
import { User } from './user.entity';
import { EventSchedule } from './event-schedule.entity';
import { Event } from './event.entity';

@Entity()
export class PaymentTicket extends IdWithTimestamps {
  constructor(entity: DeepPartial<PaymentTicket>) {
    super();
    Object.assign(this, entity);
  }

  @AddressColumn()
  walletAddress: string;

  @TxhashColumn({ unique: true })
  paymentTxhash: string;

  @TxhashColumn({ nullable: true })
  mintTxhash?: string | null;

  @DecimalColumn()
  tokenAmount: Decimal;

  @Column('int')
  ticketQuantity: number;

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

  @ManyToOne(() => PaymentTicketStatus)
  status: PaymentTicketStatus;

  @Column({ nullable: true })
  statusId: number;

  @ManyToOne(() => User)
  user: User;

  @Column({ nullable: true })
  userId: number;
}
