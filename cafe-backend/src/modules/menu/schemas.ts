import { z } from 'zod';

const name = z.string().trim().min(1).max(120);
const description = z.string().trim().min(1).max(5_000);
const price = z.number().finite().positive().max(99_999_999.99).refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-8, 'Price may have at most 2 decimal places');
const image = z.string().trim().min(1).max(2_000);
const categoryId = z.uuid();
const availability = z.enum(['AVAILABLE', 'UNAVAILABLE']);

export const menuItemCreateSchema = z.object({ name, description, price, image, categoryId, availability: availability.default('AVAILABLE') }).strict();
export const menuItemUpdateSchema = z.object({ name, description, price, image, categoryId, availability }).strict().partial().refine((value) => Object.keys(value).length > 0, 'At least one field is required');
export const menuItemParamsSchema = z.object({ id: z.uuid() });
export const publicMenuQuerySchema = z.object({ categoryId: z.uuid().optional() }).strict();
