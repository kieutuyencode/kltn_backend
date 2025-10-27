import { z } from 'zod';
import {
  getAssetSchema,
  getContractSchema,
  getNetworkSchema,
  getTokenSchema,
  importTokenSchema,
} from '../schemas';

export type GetNetworkDto = z.infer<typeof getNetworkSchema>;

export type GetContractDto = z.infer<typeof getContractSchema>;

export type GetAssetDto = z.infer<typeof getAssetSchema>;

export type GetTokenDto = z.infer<typeof getTokenSchema>;

export type ImportTokenDto = z.infer<typeof importTokenSchema>;
