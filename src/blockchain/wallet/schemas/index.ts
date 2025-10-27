import { z } from 'zod';

export const signInSchema = z.object({
  signature: z.coerce.string().trim(),
  message: z.coerce.string().trim(),
});
