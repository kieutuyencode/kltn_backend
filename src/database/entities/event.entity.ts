import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IdWithTimestamps } from '../abstracts';
import { User } from '~/database';

@Entity('events')
export class Event extends IdWithTimestamps {
  @Column({ length: 255 })
  name: string;

  @Column({ type: 'longtext', nullable: true })
  image: string;

  @Column({ length: 255 })
  location: string;

  @Column({
    type: 'enum',
    enum: ['music', 'art', 'sport', 'theater', 'other'],
    default: 'other',
  })
  category: 'music' | 'art' | 'sport' | 'theater' | 'other';

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 255 })
  organizer: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column({ nullable: false })
  creator_id: number;
}
