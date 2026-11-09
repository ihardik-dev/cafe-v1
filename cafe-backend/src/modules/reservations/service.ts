import type { PrismaClient } from '../../generated/prisma/client.js';
import { AppError } from '../../lib/errors.js';
import { canCancelReservation, RESERVATION_CANCELLATION_WINDOW_MS, indiaLocalDateTimeToUtc } from '../../lib/time.js';
import type { CreateReservationInput } from './schemas.js';

export async function createReservation(db: PrismaClient, userId: string, input: CreateReservationInput, now = new Date()) {
  const reservationDateTime = indiaLocalDateTimeToUtc(input.reservationDateTime);
  if (reservationDateTime.getTime() <= now.getTime()) throw new AppError(400, 'Reservation date and time must be in the future');
  return db.reservation.create({
    data: { userId, reservationDateTime, guestCount: input.guestCount, status: 'CONFIRMED' },
  });
}

export async function listCustomerReservations(
  db: PrismaClient,
  userId: string,
  filter?: 'upcoming' | 'previous' | 'cancelled',
  now = new Date(),
) {
  let where: {
    userId: string;
    status?: 'CONFIRMED' | 'CANCELLED';
    reservationDateTime?: { gte?: Date; lt?: Date };
  } = { userId };
  if (filter === 'upcoming') where = { userId, status: 'CONFIRMED', reservationDateTime: { gte: now } };
  if (filter === 'previous') where = { userId, status: 'CONFIRMED', reservationDateTime: { lt: now } };
  if (filter === 'cancelled') where = { userId, status: 'CANCELLED' };

  return db.reservation.findMany({ where, orderBy: { reservationDateTime: 'asc' } });
}

export async function cancelCustomerReservation(db: PrismaClient, userId: string, id: string, now = new Date()) {
  const reservation = await db.reservation.findFirst({
    where: { id, userId },
    select: { id: true, status: true, reservationDateTime: true },
  });
  if (!reservation) throw new AppError(404, 'Reservation not found');
  if (reservation.status !== 'CONFIRMED') throw new AppError(409, 'Only confirmed reservations can be cancelled');
  if (!canCancelReservation(reservation.reservationDateTime, now)) {
    throw new AppError(409, 'Reservations can only be cancelled when at least 24 hours remain');
  }

  const cutoff = new Date(now.getTime() + RESERVATION_CANCELLATION_WINDOW_MS);
  const result = await db.reservation.updateMany({
    where: { id, userId, status: 'CONFIRMED', reservationDateTime: { gte: cutoff } },
    data: { status: 'CANCELLED' },
  });
  if (result.count !== 1) throw new AppError(409, 'The reservation can no longer be cancelled');
  return { ...reservation, status: 'CANCELLED' as const };
}
