import { z } from 'zod';
import { paginationSchema } from '~/pagination';

export const handleTransactionSchema = z.object({
  txhash: z.coerce.string().trim(),
  chainId: z.coerce.number().int(),
});

export const importSchema = z.object({
  address: z.coerce.string().trim(),
  chainId: z.coerce.number().int(),
});

export const getPoolSchema = z.object({
  address: z.coerce.string().trim().optional(),
  chainId: z.coerce.number().int().optional(),
});

export const getHistorySchema = z.object({}).extend(paginationSchema.shape);
