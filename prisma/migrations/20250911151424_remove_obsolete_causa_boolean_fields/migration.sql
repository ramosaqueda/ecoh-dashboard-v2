/*
  Warnings:

  - You are about to drop the column `causaEcoh` on the `Causa` table. All the data in the column will be lost.
  - You are about to drop the column `causaLegada` on the `Causa` table. All the data in the column will be lost.
  - You are about to drop the column `causaSacfi` on the `Causa` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Causa" DROP COLUMN "causaEcoh",
DROP COLUMN "causaLegada",
DROP COLUMN "causaSacfi";
