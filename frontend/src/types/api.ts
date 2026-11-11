/**
 * Domain entity and API contract types.
 * Derived directly from backend schema (Fastify + Prisma + Zod).
 */

export type Role = 'CUSTOMER' | 'ADMIN';

export type MenuAvailability = 'AVAILABLE' | 'UNAVAILABLE';

export type OrderStatus = 'CONFIRMED' | 'CANCELLED';

export type ReservationStatus = 'CONFIRMED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  /** Serialized from Prisma Decimal as string in JSON responses */
  price: string;
  /** Image URL or asset path */
  image: string;
  availability: MenuAvailability;
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  itemName: string;
  /** Serialized Decimal */
  price: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  /** Serialized Decimal */
  totalAmount: string;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  userId: string;
  /** ISO string instant in UTC representing scheduled Asia/Kolkata date/time */
  reservationDateTime: string;
  guestCount: number;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
}

/* Envelopes */
export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorItem {
  field?: string;
  message: string;
}

export interface ApiErrorPayload {
  success: false;
  message: string;
  errors?: ApiErrorItem[];
}

export class ApiError extends Error {
  public statusCode: number;
  public fieldErrors: Record<string, string>;
  public rawErrors: ApiErrorItem[];

  constructor(statusCode: number, message: string, rawErrors: ApiErrorItem[] = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.rawErrors = rawErrors;
    this.fieldErrors = {};

    for (const err of rawErrors) {
      if (err.field && !this.fieldErrors[err.field]) {
        this.fieldErrors[err.field] = err.message;
      }
    }
  }
}
