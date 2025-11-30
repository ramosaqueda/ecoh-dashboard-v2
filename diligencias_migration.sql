-- CreateTable
CREATE TABLE "DiligenciaMinima" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiligenciaMinima_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CausaDiligencia" (
    "id" SERIAL NOT NULL,
    "causaId" INTEGER NOT NULL,
    "diligenciaId" INTEGER NOT NULL,
    "realizada" BOOLEAN NOT NULL DEFAULT false,
    "fechaRealizacion" TIMESTAMP(3),
    "fechaReiteracion" TIMESTAMP(3),
    "observacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CausaDiligencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CausaDiligencia_causaId_diligenciaId_key" ON "CausaDiligencia"("causaId", "diligenciaId");

-- CreateIndex
CREATE INDEX "CausaDiligencia_causaId_idx" ON "CausaDiligencia"("causaId");

-- AddForeignKey
ALTER TABLE "CausaDiligencia" ADD CONSTRAINT "CausaDiligencia_causaId_fkey" FOREIGN KEY ("causaId") REFERENCES "Causa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CausaDiligencia" ADD CONSTRAINT "CausaDiligencia_diligenciaId_fkey" FOREIGN KEY ("diligenciaId") REFERENCES "DiligenciaMinima"("id") ON DELETE CASCADE ON UPDATE CASCADE;
