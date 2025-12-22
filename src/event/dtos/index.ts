import {
  buyTicketSchema,
  createEventSchema,
  createScheduleSchema,
  createTicketTypeSchema,
  getMyEventSchema,
  getMyPaymentOrganizerSchema,
  getMyPaymentTicketSchema,
  getMyTicketSchema,
  getOrganizerPaymentTicketSchema,
  getPublicEventSchema,
  redeemTicketSchema,
  requestSchedulePayoutSchema,
  transferTicketSchema,
  updateEventSchema,
  updateScheduleSchema,
  updateTicketTypeSchema,
  getCheckInStatisticsSchema,
  getRevenueStatisticsSchema,
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

export type GetMyTicketDto = z.infer<typeof getMyTicketSchema>;

export type RedeemTicketDto = z.infer<typeof redeemTicketSchema>;

export type GetMyPaymentTicketDto = z.infer<typeof getMyPaymentTicketSchema>;

export type TransferTicketDto = z.infer<typeof transferTicketSchema>;

export type RequestSchedulePayoutDto = z.infer<
  typeof requestSchedulePayoutSchema
>;

export type GetMyPaymentOrganizerDto = z.infer<
  typeof getMyPaymentOrganizerSchema
>;

export type GetOrganizerPaymentTicketDto = z.infer<
  typeof getOrganizerPaymentTicketSchema
>;

export type GetCheckInStatisticsDto = z.infer<
  typeof getCheckInStatisticsSchema
>;

export type GetRevenueStatisticsDto = z.infer<
  typeof getRevenueStatisticsSchema
>;
