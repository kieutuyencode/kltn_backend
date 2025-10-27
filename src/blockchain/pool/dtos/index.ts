import { z } from 'zod';
import {
  getHistorySchema,
  getPoolSchema,
  handleTransactionSchema,
  importSchema,
} from '../schemas';

export type HandleTransactionDto = z.infer<typeof handleTransactionSchema>;

export type ImportDto = z.infer<typeof importSchema>;

export type GetPoolDto = z.infer<typeof getPoolSchema>;

export type GetHistoryDto = z.infer<typeof getHistorySchema>;
