import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseInput } from '../../lib/validation.js';
import { createReservationSchema, reservationFilterSchema, reservationIdSchema } from './schemas.js';
import { cancelCustomerReservation, createReservation, listCustomerReservations } from './service.js';

export async function createReservationController(request: FastifyRequest, reply: FastifyReply) {
  const input = parseInput(createReservationSchema, request.body);
  const reservation = await createReservation(request.server.db, request.user.sub, input);
  request.log.info({ reservationId: reservation.id, userId: request.user.sub }, 'Reservation created');
  return reply.code(201).send({ success: true, message: 'Reservation confirmed successfully', data: { reservation } });
}

export async function listCustomerReservationsController(request: FastifyRequest) {
  const { filter } = parseInput(reservationFilterSchema, request.query);
  const reservations = await listCustomerReservations(request.server.db, request.user.sub, filter);
  return { success: true, message: 'Reservation history retrieved successfully', data: { reservations } };
}

export async function cancelCustomerReservationController(request: FastifyRequest) {
  const { id } = parseInput(reservationIdSchema, request.params);
  const reservation = await cancelCustomerReservation(request.server.db, request.user.sub, id);
  request.log.info({ reservationId: id, userId: request.user.sub }, 'Customer cancelled reservation');
  return { success: true, message: 'Reservation cancelled successfully', data: { reservation } };
}
