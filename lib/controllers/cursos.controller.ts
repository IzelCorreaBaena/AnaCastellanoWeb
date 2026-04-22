import { RequestHandler } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../db';
import { AppError } from '../middleware/errorHandler';

type CursoRow = Awaited<ReturnType<typeof prisma.curso.findFirst>>;
const serializeCurso = (c: NonNullable<CursoRow>) => ({
  ...c,
  precio: c.precio instanceof Prisma.Decimal ? c.precio.toNumber() : c.precio,
});

const listQuerySchema = z.object({
  all: z.coerce.boolean().optional(),
});

const cursoSchema = z.object({
  titulo: z.string().trim().min(1).max(150),
  descripcion: z.string().trim().max(5000).optional().default(''),
  imagen: z.string().url().max(500).optional().nullable(),
  precio: z.number().nonnegative().optional().nullable(),
  duracion: z.string().trim().max(100).optional().nullable(),
  modalidad: z.string().trim().max(100).optional().nullable(),
  orden: z.number().int().min(0).max(10_000).optional(),
  activo: z.boolean().optional(),
});

const idParamSchema = z.object({ id: z.string().uuid() });

export const cursosController = {
  list: (async (req, res, next) => {
    try {
      const { all } = listQuerySchema.parse(req.query);
      // Skip the activo filter only when the caller is authenticated AND
      // explicitly requests all records. Public callers always see active only.
      const isAdmin = Boolean(req.admin);
      const showAll = all === true && isAdmin;

      const cursos = await prisma.curso.findMany({
        where: showAll ? undefined : { activo: true },
        orderBy: { orden: 'asc' },
      });
      res.json(cursos.map(serializeCurso));
    } catch (e) { next(e); }
  }) as RequestHandler,

  get: (async (req, res, next) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const curso = await prisma.curso.findUnique({ where: { id } });
      if (!curso) throw new AppError('Curso no encontrado', 404);
      res.json(serializeCurso(curso));
    } catch (e) { next(e); }
  }) as RequestHandler,

  create: (async (req, res, next) => {
    try {
      const data = cursoSchema.parse(req.body);
      const curso = await prisma.curso.create({ data });
      res.status(201).json(serializeCurso(curso));
    } catch (e) { next(e); }
  }) as RequestHandler,

  update: (async (req, res, next) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data = cursoSchema.partial().parse(req.body);
      const curso = await prisma.curso.update({ where: { id }, data });
      res.json(serializeCurso(curso));
    } catch (e) { next(e); }
  }) as RequestHandler,

  remove: (async (req, res, next) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      await prisma.curso.delete({ where: { id } });
      res.status(204).send();
    } catch (e) { next(e); }
  }) as RequestHandler,
};
