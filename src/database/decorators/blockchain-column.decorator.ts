import { Column, ColumnOptions } from 'typeorm';

export const AddressColumn = (options: ColumnOptions = {}) =>
  Column({
    ...options,
    type: 'char',
    length: 42,
    transformer: {
      to: (value: string) => value && value.toLowerCase().trim(),
      from: (value: string) => value && value.toLowerCase().trim(),
    },
  });

export const TxhashColumn = (options: ColumnOptions = {}) =>
  Column({
    ...options,
    type: 'char',
    length: 66,
    transformer: {
      to: (value: string) => value && value.toLowerCase().trim(),
      from: (value: string) => value && value.toLowerCase().trim(),
    },
  });
