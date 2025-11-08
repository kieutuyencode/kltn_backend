import { Entity, Column } from 'typeorm';
import { IdWithTimestamps } from '../abstracts';

@Entity('users')
export class User extends IdWithTimestamps {
  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ length: 15, nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'], default: 'other' })
  gender: 'male' | 'female' | 'other';

  @Column({ select: false })
  password: string;

  @Column({ type: 'longtext', nullable: true })
  avatar?: string | null;

  // reset token
  @Column({ type: 'varchar', select: false, nullable: true })
  resetToken: string | null;

  @Column({ type: 'bigint', nullable: true })
  resetTokenExpiresAt: number | null;
}
