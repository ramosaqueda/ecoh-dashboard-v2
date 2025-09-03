-- CreateTable
CREATE TABLE "estados_causa" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(500),
    "codigo" VARCHAR(20) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER,
    "color" VARCHAR(7),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estados_causa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "estados_causa_nombre_key" ON "estados_causa"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "estados_causa_codigo_key" ON "estados_causa"("codigo");

-- AlterTable
ALTER TABLE "Causa" ADD COLUMN "estadoCausaId" INTEGER;

-- CreateIndex
CREATE INDEX "idx_causa_estado_causa" ON "Causa"("estadoCausaId");

-- AddForeignKey
ALTER TABLE "Causa" ADD CONSTRAINT "Causa_estadoCausaId_fkey" FOREIGN KEY ("estadoCausaId") REFERENCES "estados_causa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Insertar datos iniciales de estados
INSERT INTO "estados_causa" ("nombre", "descripcion", "codigo", "activo", "orden") VALUES
('En Tramitación', 'Causa que se encuentra en proceso de investigación activa', 'TRAMITACION', true, 1),
('Investigación Cerrada', 'Causa con investigación cerrada pero sin sentencia', 'INV_CERRADA', true, 2),
('Cerrada con Sentencia', 'Causa cerrada con sentencia definitiva', 'CERRADA_SENTENCIA', true, 3);
