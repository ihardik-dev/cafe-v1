import { z } from 'zod';

const passwordSchema = z.string().min(8).refine(
  (value) => Buffer.byteLength(value, 'utf8') <= 72,
  'Password must not exceed 72 UTF-8 bytes when bcrypt is used',
);
const emailSchema = z.string().trim().pipe(z.email()).transform((value) => value.toLowerCase());

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: emailSchema,
  password: passwordSchema,
}).strict();

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).refine(
    (value) => Buffer.byteLength(value, 'utf8') <= 72,
    'Password must not exceed 72 UTF-8 bytes when bcrypt is used',
  ),
}).strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
