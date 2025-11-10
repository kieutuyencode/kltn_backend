import z from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(1).max(50).optional(),
  phone: z.string().trim().min(1).max(15).optional(),
  avatar: z.string().trim().optional(),
});
