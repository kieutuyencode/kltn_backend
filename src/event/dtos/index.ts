import {
  buyTicketSchema,
  createEventSchema,
  createScheduleSchema,
  createTicketTypeSchema,
  getMyEventSchema,
  getPublicEventSchema,
  updateEventSchema,
  updateScheduleSchema,
  updateTicketTypeSchema,
} from '../schemas';
import z from 'zod';

export type CreateEventDto = z.infer<typeof createEventSchema>;

export type UpdateEventDto = z.infer<typeof updateEventSchema>;

export type CreateScheduleDto = z.infer<typeof createScheduleSchema>;

export type UpdateScheduleDto = z.infer<typeof updateScheduleSchema>;

export type CreateTicketTypeDto = z.infer<typeof createTicketTypeSchema>;

export type UpdateTicketTypeDto = z.infer<typeof updateTicketTypeSchema>;

export type GetMyEventDto = z.infer<typeof getMyEventSchema>;

export type GetPublicEventDto = z.infer<typeof getPublicEventSchema>;

export type BuyTicketDto = z.infer<typeof buyTicketSchema>;
