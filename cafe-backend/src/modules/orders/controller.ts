import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseInput } from '../../lib/validation.js';
import { createOrderSchema, orderIdSchema } from './schemas.js';
import { cancelCustomerOrder, createOrder, getCustomerOrder, listCustomerOrders } from './service.js';

export async function createOrderController(request: FastifyRequest, reply: FastifyReply) {
  const input = parseInput(createOrderSchema, request.body);
  const order = await createOrder(request.server.db, request.user.sub, input);
  request.log.info({ orderId: order.id, userId: request.user.sub }, 'Demonstration order created');
  const notice = 'This is a dummy order created for demonstration purposes. No real order has been placed and no real payment has been made.';
  return reply.code(201).send({
    success: true,
    message: 'Order Confirmed!',
    data: { order, confirmationTitle: 'Order Confirmed!', notice },
  });
}

export async function listCustomerOrdersController(request: FastifyRequest) {
  const orders = await listCustomerOrders(request.server.db, request.user.sub);
  return { success: true, message: 'Order history retrieved successfully', data: { orders } };
}

export async function getCustomerOrderController(request: FastifyRequest) {
  const { id } = parseInput(orderIdSchema, request.params);
  const order = await getCustomerOrder(request.server.db, request.user.sub, id);
  return { success: true, message: 'Order retrieved successfully', data: { order } };
}

export async function cancelCustomerOrderController(request: FastifyRequest) {
  const { id } = parseInput(orderIdSchema, request.params);
  const order = await cancelCustomerOrder(request.server.db, request.user.sub, id);
  request.log.info({ orderId: id, userId: request.user.sub }, 'Customer cancelled order');
  return { success: true, message: 'Order cancelled successfully', data: { order } };
}
