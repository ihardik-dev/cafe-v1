export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: Array<{ field: string; message: string }>;

  constructor(statusCode: number, message: string, details?: Array<{ field: string; message: string }>) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    if (details) this.details = details;
  }
}
