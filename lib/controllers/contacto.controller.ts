import { RequestHandler } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { AppError } from '../middleware/errorHandler';
import { emailService } from '../services/email.service';

const phoneRegex = /^[+]?[\d\s\-().]{6,25}$/;

const mensajeSchema = z.object({
  nombre:   z.string().trim().min(1).max(150),
  email:    z.string().trim().toLowerCase().email().max(254),
  telefono: z.string().trim().regex(phoneRegex, 'Teléfono con formato inválido').optional(),
  mensaje:  z.string().trim().min(1).max(2000),
});

const idParamSchema = z.object({ id: z.string().uuid() });

export const contactoController = {
  create: (async (req, res, next) => {
    try {
      const data = mensajeSchema.parse(req.body);
      const msg = await prisma.mensaje.create({ data });

      emailService.sendAdminNewMensaje(msg).catch((err) => {
        console.error('[email] failed to send admin contact notification', err);
      });

      res.status(201).json({ success: true });
    } catch (e) { next(e); }
  }) as RequestHandler,

  list: (async (_req, res, next) => {
    try {
      const mensajes = await prisma.mensaje.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      res.json(mensajes);
    } catch (e) { next(e); }
  }) as RequestHandler,

  markRead: (async (req, res, next) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const exists = await prisma.mensaje.findUnique({ where: { id } });
      if (!exists) throw new AppError('Mensaje no encontrado', 404);
      await prisma.mensaje.update({ where: { id }, data: { leido: true } });
      res.json({ success: true });
    } catch (e) { next(e); }
  }) as RequestHandler,
};
