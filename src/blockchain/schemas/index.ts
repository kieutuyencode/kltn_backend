import { z } from 'zod';

export const getNetworkSchema = z.object({
  chainId: z.coerce.number().int().optional(),
});

export const getContractSchema = z.object({
  address: z.coerce.string().trim().optional(),
});

export const getAssetSchema = z
  .object({})
  .extend(getNetworkSchema.shape)
  .extend(getContractSchema.shape);

export const getTokenSchema = z.object({}).extend(getAssetSchema.shape);

export const importTokenSchema = z.object({
  address: z.coerce.string().trim(),
  chainId: z.coerce.number().int(),
});
