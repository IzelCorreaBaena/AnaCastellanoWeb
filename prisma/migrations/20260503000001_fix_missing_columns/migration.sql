-- Migration: fix_missing_columns
-- Adds columns that are in the Prisma schema but missing from the live DB.
-- All statements use IF NOT EXISTS so they are safe to re-run.

-- servicios.imagen — added by 20260414123009_anadir_imagen_servicio but missing
-- in the live DB (migration was recorded as applied but SQL never ran).
ALTER TABLE "servicios" ADD COLUMN IF NOT EXISTS "imagen" VARCHAR(500);

-- cursos.imagenes — array of image/video URLs for multi-media support on courses.
ALTER TABLE "cursos" ADD COLUMN IF NOT EXISTS "imagenes" TEXT[];
