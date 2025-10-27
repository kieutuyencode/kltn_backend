import { z } from 'zod';
import { signInSchema } from '../schemas';

export type SignInDto = z.infer<typeof signInSchema>;
