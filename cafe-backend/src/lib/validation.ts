import { ZodError, type ZodType } from 'zod';
import { AppError } from './errors.js';

export function parseInput<T>(schema: ZodType<T>, input: unknown): T {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AppError(400, 'Validation failed', error.issues.map((issue) => ({
        field: issue.path.map(String).join('.') || 'request',
        message: issue.message,
      })));
    }
    throw error;
  }
}
