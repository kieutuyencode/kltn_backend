import Decimal from 'decimal.js';
import { Column, DeepPartial, Entity, ManyToOne } from 'typeorm';
import { IdWithTimestamps } from '../abstracts';
import { AddressColumn, DecimalColumn, TxhashColumn } from '../decorators';
import { Event } from './event.entity';
import { User } from './user.entity';
import { PaymentOrganizerStatus } from './payment-organizer-status.entity';
import { EventSchedule } from './event-schedule.entity';

@Entity()
export class PaymentOrganizer extends IdWithTimestamps {
  constructor(entity: DeepPartial<PaymentOrganizer>) {
    super();
    Object.assign(this, entity);
  }

  @AddressColumn()
  organizerAddress: string;

  @TxhashColumn({ nullable: true })
  txhash?: string | null;

  @DecimalColumn()
  receiveAmount: Decimal;

  @DecimalColumn()
  feeAmount: Decimal;

  @ManyToOne(() => EventSchedule, { onDelete: 'SET NULL' })
  schedule: EventSchedule;

  @Column({ unique: true, nullable: true })
  scheduleId: number;

  @ManyToOne(() => Event, { onDelete: 'SET NULL' })
  event: Event;

  @Column({ nullable: true })
  eventId: number;

  @ManyToOne(() => User)
  user: User;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => PaymentOrganizerStatus)
  status: PaymentOrganizerStatus;

  @Column({ nullable: true })
  statusId: number;
}
