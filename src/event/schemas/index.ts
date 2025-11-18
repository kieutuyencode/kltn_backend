import z from 'zod';
import { paginationSchema } from '~/pagination';

export const createEventSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(100),
  address: z.string().trim().min(1).max(100),
  description: z.string().trim(),
  image: z.string().trim(),
  categoryId: z.number(),
  statusId: z.number(),
});

export const updateEventSchema = createEventSchema.partial();

export const createScheduleSchema = z.object({
  eventId: z.number(),
  startDate: z.string().trim(),
  endDate: z.string().trim(),
  organizerAddress: z.string().trim(),
});

export const updateScheduleSchema = z.object({
  startDate: z.string().trim(),
  endDate: z.string().trim(),
  organizerAddress: z.string().trim(),
});

export const createTicketTypeSchema = z.object({
  scheduleId: z.number(),
  name: z.string().trim().min(1).max(100),
  description: z.string().trim(),
  price: z.string().trim(),
  originalQuantity: z.number().int().min(1),
  saleStartDate: z.string().trim(),
  saleEndDate: z.string().trim(),
});

export const updateTicketTypeSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim(),
  price: z.string().trim(),
  originalQuantity: z.number().int().min(0),
  saleStartDate: z.string().trim(),
  saleEndDate: z.string().trim(),
});

export const getMyEventSchema = z
  .object({
    search: z.coerce.string().trim().optional(),
    statusId: z.coerce.number().optional(),
  })
  .extend(paginationSchema.shape);

export const getPublicEventSchema = z
  .object({
    search: z.coerce.string().trim().optional(),
    categoryId: z.coerce.number().optional(),
  })
  .extend(paginationSchema.shape);

export const buyTicketSchema = z.object({
  paymentTxhash: z.string().trim(),
});
