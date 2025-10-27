import { DateTimeValue, dayUTC } from '../../date-time';
import { Column, ColumnOptions } from 'typeorm';
import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';

export const DateTimeColumn = (options: ColumnOptions = {}) =>
  applyDecorators(
    Column({
      ...options,
      type: 'datetime',
      precision: 6,
      default: () => 'CURRENT_TIMESTAMP(6)',
      transformer: {
        to: (value: DateTimeValue) => value && dayUTC(value).toISOString(),
        from: (value: string) => value && dayUTC(value),
      },
    }),
    Transform(({ value }) => value && value.toISOString(), {
      toPlainOnly: true,
    }),
  );
