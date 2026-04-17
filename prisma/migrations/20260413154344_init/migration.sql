-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('PENDIENTE', 'ACEPTADA', 'RECHAZADA');

-- CreateTable
CREATE TABLE "admins" (
    "id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicios" (
    "id" UUID NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bloques" (
    "id" UUID NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "imagenes" TEXT[],
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "servicio_id" UUID NOT NULL,

    CONSTRAINT "bloques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "telefono" VARCHAR(25) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "estado" "EstadoReserva" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_evento" TIMESTAMPTZ,
    "notas" TEXT,
    "google_event_id" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "servicio_id" UUID,
    "servicio_nombre" VARCHAR(150),

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE INDEX "idx_servicios_activo" ON "servicios"("activo");

-- CreateIndex
CREATE INDEX "idx_servicios_orden" ON "servicios"("orden");

-- CreateIndex
CREATE INDEX "idx_bloques_servicio_id" ON "bloques"("servicio_id");

-- CreateIndex
CREATE INDEX "idx_bloques_activo" ON "bloques"("activo");

-- CreateIndex
CREATE INDEX "idx_bloques_servicio_orden" ON "bloques"("servicio_id", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "reservas_google_event_id_key" ON "reservas"("google_event_id");

-- CreateIndex
CREATE INDEX "idx_reservas_email" ON "reservas"("email");

-- CreateIndex
CREATE INDEX "idx_reservas_estado" ON "reservas"("estado");

-- CreateIndex
CREATE INDEX "idx_reservas_servicio_id" ON "reservas"("servicio_id");

-- CreateIndex
CREATE INDEX "idx_reservas_created_at" ON "reservas"("created_at");

-- CreateIndex
CREATE INDEX "idx_reservas_fecha_evento" ON "reservas"("fecha_evento");

-- CreateIndex
CREATE INDEX "idx_reservas_estado_created_at" ON "reservas"("estado", "created_at");

-- AddForeignKey
ALTER TABLE "bloques" ADD CONSTRAINT "bloques_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
