-- Migration: add_event_fields_to_presupuestos
-- Idempotent: creates presupuestos + mensajes tables if they don't exist,
-- then adds new columns if they don't already exist.

-- ── presupuestos ────────────────────────────────────────────────────────────

CREATE SEQUENCE IF NOT EXISTS "presupuestos_numero_seq";

CREATE TABLE IF NOT EXISTS "presupuestos" (
    "id"               UUID          NOT NULL DEFAULT gen_random_uuid(),
    "numero"           INTEGER       NOT NULL DEFAULT nextval('"presupuestos_numero_seq"'),
    "cliente_nombre"   VARCHAR(150)  NOT NULL,
    "cliente_email"    VARCHAR(255),
    "cliente_telefono" VARCHAR(25),
    "nombre_evento"    VARCHAR(200),
    "fecha_evento"     DATE,
    "ubicacion"        VARCHAR(200),
    "anticipo"         DECIMAL(10,2),
    "imagenes"         TEXT[]        NOT NULL DEFAULT '{}',
    "items"            JSONB         NOT NULL DEFAULT '[]',
    "subtotal"         DECIMAL(10,2) NOT NULL DEFAULT 0,
    "igic_porcentaje"  DECIMAL(5,2)  NOT NULL DEFAULT 7,
    "igic_importe"     DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total"            DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notas"            TEXT,
    "created_at"       TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT "presupuestos_pkey" PRIMARY KEY ("id")
);

ALTER SEQUENCE "presupuestos_numero_seq" OWNED BY "presupuestos"."numero";

CREATE UNIQUE INDEX IF NOT EXISTS "presupuestos_numero_key" ON "presupuestos"("numero");
CREATE INDEX IF NOT EXISTS "idx_presupuestos_created_at" ON "presupuestos"("created_at");

-- Add new columns to existing tables (safe if table already existed)
ALTER TABLE "presupuestos" ADD COLUMN IF NOT EXISTS "nombre_evento"    VARCHAR(200);
ALTER TABLE "presupuestos" ADD COLUMN IF NOT EXISTS "fecha_evento"     DATE;
ALTER TABLE "presupuestos" ADD COLUMN IF NOT EXISTS "ubicacion"        VARCHAR(200);
ALTER TABLE "presupuestos" ADD COLUMN IF NOT EXISTS "anticipo"         DECIMAL(10,2);
ALTER TABLE "presupuestos" ADD COLUMN IF NOT EXISTS "imagenes"         TEXT[] NOT NULL DEFAULT '{}';

-- ── mensajes ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "mensajes" (
    "id"         UUID         NOT NULL DEFAULT gen_random_uuid(),
    "nombre"     VARCHAR(150) NOT NULL,
    "email"      VARCHAR(255) NOT NULL,
    "telefono"   VARCHAR(25),
    "mensaje"    TEXT         NOT NULL,
    "leido"      BOOLEAN      NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT "mensajes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_mensajes_leido"      ON "mensajes"("leido");
CREATE INDEX IF NOT EXISTS "idx_mensajes_created_at" ON "mensajes"("created_at");
