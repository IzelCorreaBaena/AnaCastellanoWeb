import { RequestHandler } from 'express';
import { EstadoReserva } from '@prisma/client';
import { prisma } from '../db';

export const notificationsController = {
  summary: (async (_req, res, next) => {
    try {
      const [pendingReservations, unreadMessages] = await Promise.all([
        prisma.reserva.count({ where: { estado: EstadoReserva.PENDIENTE } }),
        prisma.mensaje.count({ where: { leido: false } }),
      ]);
      res.json({
        pendingReservations,
        unreadMessages,
        total: pendingReservations + unreadMessages,
      });
    } catch (e) { next(e); }
  }) as RequestHandler,
};
