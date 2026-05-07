-- Migration: add_presupuesto_event_columns
-- Adds columns that were missing from the previous migration.
-- All statements are idempotent.

ALTER TABLE "presupuestos" ADD COLUMN IF NOT EXISTS "nombre_evento" VARCHAR(200);
ALTER TABLE "presupuestos" ADD COLUMN IF NOT EXISTS "anticipo"      DECIMAL(10,2);
ALTER TABLE "presupuestos" ADD COLUMN IF NOT EXISTS "imagenes"      TEXT[] NOT NULL DEFAULT '{}';

-- Fix fecha_evento type if it was created as VARCHAR by the old migration.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'presupuestos'
      AND column_name  = 'fecha_evento'
      AND udt_name     = 'varchar'
  ) THEN
    ALTER TABLE "presupuestos"
      ALTER COLUMN "fecha_evento" TYPE DATE
      USING CASE
        WHEN "fecha_evento" ~ '^\d{4}-\d{2}-\d{2}' THEN "fecha_evento"::DATE
        ELSE NULL
      END;
  END IF;
END $$;
