import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ICreatedAt, ITimestamps, IUpdatedAt } from '../interfaces';
import { Id } from './id.abstract';
import { DateTimeColumn } from '../decorators';
import { DateTime } from '../../date-time';

export abstract class IdWithCreatedAt extends Id implements ICreatedAt {
  @CreateDateColumn()
  @DateTimeColumn()
  createdAt: DateTime;
}

export abstract class IdWithUpdatedAt extends Id implements IUpdatedAt {
  @UpdateDateColumn()
  @DateTimeColumn()
  updatedAt: DateTime;
}

export abstract class IdWithTimestamps extends Id implements ITimestamps {
  @CreateDateColumn()
  @DateTimeColumn()
  createdAt: DateTime;

  @UpdateDateColumn()
  @DateTimeColumn()
  updatedAt: DateTime;
}
