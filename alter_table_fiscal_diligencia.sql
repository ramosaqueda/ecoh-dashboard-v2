-- CreateTable
CREATE TABLE "FiscalDiligencia" (
    "id" SERIAL NOT NULL,
    "fiscalId" INTEGER NOT NULL,
    "diligenciaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FiscalDiligencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FiscalDiligencia_fiscalId_idx" ON "FiscalDiligencia"("fiscalId");

-- CreateIndex
CREATE UNIQUE INDEX "FiscalDiligencia_fiscalId_diligenciaId_key" ON "FiscalDiligencia"("fiscalId", "diligenciaId");

-- AddForeignKey
ALTER TABLE "FiscalDiligencia" ADD CONSTRAINT "FiscalDiligencia_fiscalId_fkey" FOREIGN KEY ("fiscalId") REFERENCES "Fiscal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalDiligencia" ADD CONSTRAINT "FiscalDiligencia_diligenciaId_fkey" FOREIGN KEY ("diligenciaId") REFERENCES "DiligenciaMinima"("id") ON DELETE CASCADE ON UPDATE CASCADE;
