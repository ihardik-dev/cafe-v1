import { z } from 'zod';

export const createReservationSchema = z.object({
  reservationDateTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Use YYYY-MM-DDTHH:mm in Asia/Kolkata'),
  guestCount: z.number().int().min(1).max(6),
}).strict();
export const reservationIdSchema = z.object({ id: z.uuid() });
export const reservationFilterSchema = z.object({ filter: z.enum(['upcoming', 'previous', 'cancelled']).optional() }).strict();
export type CreateReservationInput = z.infer<typeof createReservationSchema>;
