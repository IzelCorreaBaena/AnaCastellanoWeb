import { RequestHandler } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { AppError } from '../middleware/errorHandler';

const idParamSchema = z.object({ id: z.string().uuid() });

const bloqueSchema = z.object({
  titulo: z.string().trim().min(1).max(150),
  descripcion: z.string().trim().max(5000).optional().default(''),
  // Accept any non-empty string: full URLs (Cloudinary, etc.) and relative paths
  // like /uploads/<filename> produced by the local upload endpoint.
  imagenes: z.array(z.string().min(1)).default([]),
  orden: z.number().int().optional(),
  activo: z.boolean().optional(),
  servicioId: z.string().uuid(),
});

export const blocksController = {
  list: (async (req, res, next) => {
    try {
      const servicioId = req.query.servicioId
        ? z.string().uuid().parse(req.query.servicioId)
        : undefined;
      const bloques = await prisma.bloque.findMany({
        where: servicioId ? { servicioId } : undefined,
        orderBy: [{ servicioId: 'asc' }, { orden: 'asc' }],
      });
      res.json(bloques);
    } catch (e) { next(e); }
  }) as RequestHandler,

  get: (async (req, res, next) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const bloque = await prisma.bloque.findUnique({ where: { id } });
      if (!bloque) throw new AppError('Bloque no encontrado', 404);
      res.json(bloque);
    } catch (e) { next(e); }
  }) as RequestHandler,

  create: (async (req, res, next) => {
    try {
      const data = bloqueSchema.parse(req.body);
      const bloque = await prisma.$transaction(async (tx) => {
        const orden = data.orden !== undefined
          ? data.orden
          : (await tx.bloque.count({ where: { servicioId: data.servicioId } })) + 1;
        return tx.bloque.create({ data: { ...data, orden } });
      });
      res.status(201).json(bloque);
    } catch (e) { next(e); }
  }) as RequestHandler,

  update: (async (req, res, next) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data = bloqueSchema.partial().parse(req.body);
      const bloque = await prisma.bloque.update({ where: { id }, data });
      res.json(bloque);
    } catch (e) { next(e); }
  }) as RequestHandler,

  remove: (async (req, res, next) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      await prisma.bloque.delete({ where: { id } });
      res.status(204).send();
    } catch (e) { next(e); }
  }) as RequestHandler,
};
