-- Migration: add_media_arrays
-- Replaces the single `imagen` column in `servicios` with `imagenes TEXT[]`
-- and adds `videos TEXT[]` to both `servicios` and `bloques`.

-- 1. Add new columns with defaults
ALTER TABLE "servicios" ADD COLUMN "imagenes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "servicios" ADD COLUMN "videos"   TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "bloques"   ADD COLUMN "videos"   TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- 2. Migrate existing single imagen → first element of imagenes array
UPDATE "servicios"
SET "imagenes" = ARRAY["imagen"]
WHERE "imagen" IS NOT NULL AND "imagen" <> '';

-- 3. Drop the old single-image column
ALTER TABLE "servicios" DROP COLUMN "imagen";
