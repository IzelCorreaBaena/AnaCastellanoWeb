-- CreateTable
CREATE TABLE "cursos" (
    "id" UUID NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "imagen" VARCHAR(500),
    "precio" DECIMAL(10,2),
    "duracion" VARCHAR(100),
    "modalidad" VARCHAR(100),
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "cursos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_cursos_activo" ON "cursos"("activo");

-- CreateIndex
CREATE INDEX "idx_cursos_orden" ON "cursos"("orden");
