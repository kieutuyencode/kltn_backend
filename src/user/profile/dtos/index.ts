import { updateProfileSchema } from '../schemas';
import z from 'zod';

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
