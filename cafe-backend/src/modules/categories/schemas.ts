import { z } from 'zod';

export const categoryCreateSchema = z.object({ name: z.string().trim().min(1).max(80) }).strict();
export const categoryUpdateSchema = z.object({ name: z.string().trim().min(1).max(80) }).strict().partial().refine((value) => Object.keys(value).length > 0, 'At least one field is required');
export const categoryIdSchema = z.object({ id: z.uuid() });
