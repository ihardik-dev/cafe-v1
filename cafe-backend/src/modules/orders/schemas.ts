import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z.array(z.object({ menuItemId: z.uuid(), quantity: z.number().int().min(1).max(10) }).strict()).min(1)
    .refine((items) => new Set(items.map((item) => item.menuItemId)).size === items.length, 'Each menu item may appear only once'),
}).strict();
export const orderIdSchema = z.object({ id: z.uuid() });
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
