import { DateTime } from '~/date-time';

export interface ICreatedAt {
  createdAt: DateTime;
}

export interface IUpdatedAt {
  updatedAt: DateTime;
}

export interface ITimestamps extends ICreatedAt, IUpdatedAt {}
