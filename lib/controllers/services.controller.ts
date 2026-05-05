import { RequestHandler } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { AppError } from '../middleware/errorHandler';

const listQuerySchema = z.object({
  all: z.coerce.boolean().optional(),
});

const servicioSchema = z.object({
  titulo: z.string().trim().min(1).max(150),
  descripcion: z.string().trim().max(5000).optional().default(''),
  imagen: z.string().max(500).optional().nullable(),
  imagenes: z.array(z.string().max(500)).optional(),
  orden: z.number().int().min(0).max(10_000).optional(),
  activo: z.boolean().optional(),
});

const idParamSchema = z.object({ id: z.string().uuid() });

export const servicesController = {
  list: (async (req, res, next) => {
    try {
      const { all } = listQuerySchema.parse(req.query);
      // Skip the activo filter only when the caller is authenticated AND
      // explicitly requests all records. Public callers always see active only.
      const isAdmin = Boolean(req.admin);
      const showAll = all === true && isAdmin;

      const servicios = await prisma.servicio.findMany({
        where: showAll ? undefined : { activo: true },
        include: {
          bloques: {
            where: showAll ? undefined : { activo: true },
            orderBy: { orden: 'asc' },
          },
        },
        orderBy: { orden: 'asc' },
      });
      res.json(servicios);
    } catch (e) { next(e); }
  }) as RequestHandler,

  get: (async (req, res, next) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const servicio = await prisma.servicio.findUnique({
        where: { id },
        include: { bloques: { orderBy: { orden: 'asc' } } },
      });
      if (!servicio) throw new AppError('Servicio no encontrado', 404);
      res.json(servicio);
    } catch (e) { next(e); }
  }) as RequestHandler,

  create: (async (req, res, next) => {
    try {
      const data = servicioSchema.parse(req.body);
      const servicio = await prisma.servicio.create({ data, include: { bloques: true } });
      res.status(201).json(servicio);
    } catch (e) { next(e); }
  }) as RequestHandler,

  update: (async (req, res, next) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data = servicioSchema.partial().parse(req.body);
      const servicio = await prisma.servicio.update({
        where: { id },
        data,
        include: { bloques: { orderBy: { orden: 'asc' } } },
      });
      res.json(servicio);
    } catch (e) { next(e); }
  }) as RequestHandler,

  remove: (async (req, res, next) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      await prisma.servicio.delete({ where: { id } });
      res.status(204).send();
    } catch (e) { next(e); }
  }) as RequestHandler,
};
