import { Column, DeepPartial, Entity } from 'typeorm';
import { IdWithTimestamps } from '../abstracts';

@Entity()
export class PaymentTicketStatus extends IdWithTimestamps {
  constructor(entity: DeepPartial<PaymentTicketStatus>) {
    super();
    Object.assign(this, entity);
  }

  @Column('varchar', { length: 50 })
  name: string;

  @Column('varchar', { nullable: true })
  description?: string;
}
