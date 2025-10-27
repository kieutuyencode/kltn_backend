import { z } from 'zod';
import { paginationSchema } from '~/pagination';

export const handleTransactionSchema = z.object({
  txhash: z.coerce.string().trim(),
  chainId: z.coerce.number().int(),
  pairId: z.coerce.number().int().optional(),
});

export const getHistorySchema = z
  .object({
    fromAddress: z.coerce.string().trim().optional(),
  })
  .extend(paginationSchema.shape);

export const completeTransactionSchema = z.object({
  txhash: z.coerce.string().trim(),
  pairId: z.coerce.number().int(),
});

export const getPairSchema = z.object({
  fromAssetId: z.coerce.number().int().optional(),
});
