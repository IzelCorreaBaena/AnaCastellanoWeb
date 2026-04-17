import { RequestHandler } from 'express';
import { z } from 'zod';
import { EstadoReserva } from '@prisma/client';
import { prisma } from '../db';
import { AppError } from '../middleware/errorHandler';

const availabilityQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const calendarController = {
  availability: (async (req, res, next) => {
    try {
      const query = availabilityQuerySchema.parse(req.query);
      const from = query.from ? new Date(query.from) : new Date();
      const to = query.to
        ? new Date(query.to)
        : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

      if (from > to) throw new AppError('El parámetro "from" debe ser anterior a "to"', 400, 'INVALID_RANGE');

      const reservas = await prisma.reserva.findMany({
        where: {
          fechaEvento: { gte: from, lte: to },
          estado: { in: [EstadoReserva.PENDIENTE, EstadoReserva.ACEPTADA] },
        },
        select: { id: true, fechaEvento: true, estado: true, servicioNombre: true },
      });

      res.json({ reservas });
    } catch (e) { next(e); }
  }) as RequestHandler,
};
