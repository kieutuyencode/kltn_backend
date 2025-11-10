import { Column, DeepPartial, Entity, ManyToOne } from 'typeorm';
import { IdWithTimestamps } from '../abstracts';
import { DateTime } from '../../date-time';
import { VerificationCodeType } from './verification-code-type.entity';
import { User } from './user.entity';
import { DateTimeColumn } from '../decorators';

@Entity()
export class VerificationCode extends IdWithTimestamps {
  constructor(entity: DeepPartial<VerificationCode>) {
    super();
    Object.assign(this, entity);
  }

  @Column('varchar', { length: 50 })
  code: string;

  @DateTimeColumn()
  expiresAt: DateTime;

  @ManyToOne(() => VerificationCodeType)
  type: VerificationCodeType;

  @Column({ nullable: true })
  typeId: number;

  @ManyToOne(() => User)
  user: User;

  @Column({ nullable: true })
  userId: number;
}
