import { z } from 'zod';
import {
  handleTransactionSchema,
  getHistorySchema,
  completeTransactionSchema,
  getPairSchema,
} from '../schemas';

export type HandleTransactionDto = z.infer<typeof handleTransactionSchema>;

export type GetHistoryDto = z.infer<typeof getHistorySchema>;

export type CompleteTransactionDto = z.infer<typeof completeTransactionSchema>;

export type GetPairDto = z.infer<typeof getPairSchema>;
