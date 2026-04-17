import { RequestHandler } from 'express';
import { z } from 'zod';
import { EstadoReserva } from '@prisma/client';
import { prisma } from '../db';
import { AppError } from '../middleware/errorHandler';
import { emailService } from '../services/email.service';
import { calendarService } from '../services/calendar.service';

// Phone: digits, spaces, dashes, parentheses, leading +. Length 6–25.
const phoneRegex = /^[+]?[\d\s\-().]{6,25}$/;

const reservaSchema = z.object({
  nombre: z.string().trim().min(1).max(150),
  telefono: z
    .string()
    .trim()
    .min(6)
    .max(25)
    .regex(phoneRegex, 'Teléfono con formato inválido'),
  email: z.string().trim().toLowerCase().email().max(254),
  mensaje: z.string().trim().min(1).max(2000),
  fechaEvento: z
    .string()
    .datetime()
    .refine((v) => new Date(v).getTime() > Date.now(), {
      message: 'La fecha del evento debe estar en el futuro',
    })
    .optional(),
  servicioId: z.string().uuid().optional(),
});

const updateSchema = z.object({
  estado: z.nativeEnum(EstadoReserva).optional(),
  notas: z.string().max(2000).optional(),
  fechaEvento: z
    .string()
    .datetime()
    .refine((v) => new Date(v).getTime() > Date.now(), {
      message: 'La fecha del evento debe estar en el futuro',
    })
    .optional(),
});

const idParamSchema = z.object({ id: z.string().uuid() });
const listQuerySchema = z.object({
  estado: z.nativeEnum(EstadoReserva).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const reservationsController = {
  list: (async (req, res, next) => {
    try {
      const { estado, page, limit } = listQuerySchema.parse(req.query);
      const where = estado ? { estado } : undefined;
      const skip = (page - 1) * limit;

      const [reservas, total] = await Promise.all([
        prisma.reserva.findMany({
          where,
          include: { servicio: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.reserva.count({ where }),
      ]);

      res.json({ data: reservas, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (e) { next(e); }
  }) as RequestHandler,

  get: (async (req, res, next) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const reserva = await prisma.reserva.findUnique({
        where: { id },
        include: { servicio: true },
      });
      if (!reserva) throw new AppError('Reserva no encontrada', 404);
      res.json(reserva);
    } catch (e) { next(e); }
  }) as RequestHandler,

  create: (async (req, res, next) => {
    try {
      const data = reservaSchema.parse(req.body);

      // Snapshot del nombre del servicio para preservar historial
      let servicioNombre: string | undefined;
      if (data.servicioId) {
        const servicio = await prisma.servicio.findUnique({ where: { id: data.servicioId } });
        if (!servicio) throw new AppError('Servicio no encontrado', 404);
        servicioNombre = servicio.titulo;
      }

      const reserva = await prisma.reserva.create({
        data: {
          ...data,
          fechaEvento: data.fechaEvento ? new Date(data.fechaEvento) : null,
          servicioNombre,
          estado: EstadoReserva.PENDIENTE,
        },
      });

      emailService.sendReservationConfirmation(reserva).catch((err) => {
        console.error('[email] failed to send confirmation', err);
      });

      emailService.sendAdminNewReservation({ ...reserva, telefono: reserva.telefono, mensaje: reserva.mensaje }).catch((err) => {
        console.error('[email] failed to send admin notification', err);
      });

      res.status(201).json(reserva);
    } catch (e) { next(e); }
  }) as RequestHandler,

  update: (async (req, res, next) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data = updateSchema.parse(req.body);

      // Load current state to detect transitions (prevents duplicate side-effects)
      const current = await prisma.reserva.findUnique({ where: { id } });
      if (!current) throw new AppError('Reserva no encontrada', 404);

      const reserva = await prisma.reserva.update({
        where: { id },
        data: {
          ...data,
          fechaEvento: data.fechaEvento ? new Date(data.fechaEvento) : undefined,
        },
        include: { servicio: true },
      });

      // Fire-and-forget side effects only on actual state transitions
      const isTransitionTo = (estado: EstadoReserva) =>
        data.estado === estado && current.estado !== estado;

      if (isTransitionTo(EstadoReserva.ACEPTADA)) {
        emailService.sendAcceptedEmail(reserva).catch((err) => {
          console.error('[email] failed to send accepted notification', err);
        });

        // Only create calendar event if none exists yet
        if (!current.googleEventId) {
          calendarService.createEvent(reserva).then(async (eventId) => {
            if (eventId) {
              await prisma.reserva.update({
                where: { id: reserva.id },
                data: { googleEventId: eventId },
              }).catch((err) => {
                console.error('[calendar] failed to persist googleEventId', err);
              });
            }
          }).catch((err) => {
            console.error('[calendar] createEvent threw unexpectedly', err);
          });
        }
      } else if (isTransitionTo(EstadoReserva.RECHAZADA)) {
        emailService.sendRejectedEmail(reserva, data.notas).catch((err) => {
          console.error('[email] failed to send rejected notification', err);
        });
      }

      res.json(reserva);
    } catch (e) { next(e); }
  }) as RequestHandler,

  remove: (async (req, res, next) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const reserva = await prisma.reserva.findUnique({ where: { id } });
      if (!reserva) throw new AppError('Reserva no encontrada', 404);

      if (reserva.googleEventId) {
        calendarService.deleteEvent(reserva.googleEventId).catch((err) => {
          console.error('[calendar] failed to delete event on reservation remove', err);
        });
      }

      await prisma.reserva.delete({ where: { id } });
      res.status(204).send();
    } catch (e) { next(e); }
  }) as RequestHandler,
};
