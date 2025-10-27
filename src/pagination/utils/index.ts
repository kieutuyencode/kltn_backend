import { ObjectLiteral, SelectQueryBuilder } from '~/database';
import { PaginationDto } from '../dtos';
import { instanceToPlain } from 'class-transformer';

export const paginate = async <T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  options: PaginationDto,
) => {
  const limit = options.limit;
  const page = options.page;
  const offset = (page - 1) * limit;

  const [items, totalItems] = await queryBuilder
    .skip(offset)
    .take(limit)
    .getManyAndCount();

  return {
    count: totalItems,
    rows: instanceToPlain(items),
    limit,
    page,
  };
};
