import { FindOneOptions } from 'typeorm';

interface IThrowOption {
  throwIfNotFound?: boolean;
}

export interface IFindOneOptions<T> extends FindOneOptions<T>, IThrowOption {}
