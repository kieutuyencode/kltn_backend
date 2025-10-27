import { z } from 'zod';
import { paginationSchema } from '~/pagination/schemas';

export type PaginationDto = z.infer<typeof paginationSchema>;
