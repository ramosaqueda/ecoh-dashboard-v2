-- CreateTable
CREATE TABLE "UnidadPolicial" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "UnidadPolicial_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Causa" ADD COLUMN "unidadPolicialId" INTEGER;

-- AddForeignKey
ALTER TABLE "Causa" ADD CONSTRAINT "Causa_unidadPolicialId_fkey" FOREIGN KEY ("unidadPolicialId") REFERENCES "UnidadPolicial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Optional: Insert initial data if needed (commented out)
-- INSERT INTO "UnidadPolicial" ("nombre") VALUES ('PDI'), ('Carabineros de Chile');
