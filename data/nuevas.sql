-- CreateTable
CREATE TABLE IF NOT EXISTS "TipoOrganizacion" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "OrganizacionDelictual" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaIdentificacion" TIMESTAMP(3) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "tipoOrganizacionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "MiembrosOrganizacion" (
    "id" SERIAL PRIMARY KEY,
    "organizacionId" INTEGER NOT NULL,
    "imputadoId" INTEGER NOT NULL,
    "rol" TEXT,
    "fechaIngreso" TIMESTAMP(3) NOT NULL,
    "fechaSalida" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Añadir Foreign Keys
ALTER TABLE "OrganizacionDelictual"
    ADD CONSTRAINT "OrganizacionDelictual_tipoOrganizacionId_fkey"
    FOREIGN KEY ("tipoOrganizacionId") REFERENCES "TipoOrganizacion"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MiembrosOrganizacion"
    ADD CONSTRAINT "MiembrosOrganizacion_organizacionId_fkey"
    FOREIGN KEY ("organizacionId") REFERENCES "OrganizacionDelictual"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "MiembrosOrganizacion_imputadoId_fkey"
    FOREIGN KEY ("imputadoId") REFERENCES "Imputado"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Crear índice único
CREATE UNIQUE INDEX IF NOT EXISTS "MiembrosOrganizacion_organizacionId_imputadoId_key" 
ON "MiembrosOrganizacion"("organizacionId", "imputadoId");