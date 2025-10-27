import { SelectQueryBuilder, SwapPair } from '~/database';

export const andWhereEnabled = (queryBuilder: SelectQueryBuilder<SwapPair>) => {
  return queryBuilder.andWhere('swapPair.isEnabled = :isEnabled', {
    isEnabled: true,
  });
};
