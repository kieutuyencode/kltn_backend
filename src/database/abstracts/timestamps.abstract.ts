import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ICreatedAt, IUpdatedAt, ITimestamps } from '../interfaces';
import { DateTime } from '../../date-time';

export abstract class CreatedAt implements ICreatedAt {
  @CreateDateColumn()
  createdAt: DateTime;
}

export abstract class UpdatedAt implements IUpdatedAt {
  @UpdateDateColumn()
  updatedAt: DateTime;
}

export abstract class Timestamps implements ITimestamps {
  @CreateDateColumn()
  createdAt: DateTime;

  @UpdateDateColumn()
  updatedAt: DateTime;
}
