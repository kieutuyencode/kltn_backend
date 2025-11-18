import { Exclude } from 'class-transformer';
import { Column, DeepPartial, Entity, ManyToOne } from 'typeorm';
import { IdWithTimestamps } from '../abstracts';
import { UserRole } from './user-role.entity';
import { UserStatus } from './user-status.entity';

@Entity()
export class User extends IdWithTimestamps {
  constructor(entity: DeepPartial<User>) {
    super();
    Object.assign(this, entity);
  }

  @Column('varchar', { length: 50 })
  fullName: string;

  @Column('varchar', { length: 100 })
  email: string;

  @Exclude()
  @Column('varchar', { length: 100 })
  password: string;

  @Column('varchar', { length: 15, nullable: true })
  phone?: string;

  @Column('varchar', { length: 50, nullable: true })
  avatar?: string;

  @Column('text', { nullable: true })
  description?: string;

  @ManyToOne(() => UserRole)
  role: UserRole;

  @Column({ nullable: true })
  roleId: number;

  @ManyToOne(() => UserStatus)
  status: UserStatus;

  @Column({ nullable: true })
  statusId: number;
}
