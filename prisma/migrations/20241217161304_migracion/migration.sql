-- CreateEnum
CREATE TYPE "EstadoActividad" AS ENUM ('inicio', 'en_proceso', 'terminado');

-- CreateTable
CREATE TABLE "Causa" (
    "id" SERIAL NOT NULL,
    "denominacionCausa" TEXT NOT NULL,
    "ruc" TEXT,
    "fechaDelHecho" TIMESTAMP(3),
    "rit" TEXT,
    "fechaIta" TIMESTAMP(3),
    "numeroIta" TEXT,
    "fechaPpp" TIMESTAMP(3),
    "numeroPpp" TEXT,
    "observacion" TEXT,
    "foliobw" TEXT,
    "causaEcoh" BOOLEAN NOT NULL,
    "causaLegada" BOOLEAN,
    "coordenadasSs" TEXT,
    "homicidioConsumado" BOOLEAN,
    "constituyeSs" BOOLEAN,
    "sinLlamadoEcoh" BOOLEAN,
    "fechaHoraTomaConocimiento" TIMESTAMP(3),
    "comunaId" INTEGER,
    "analistaId" INTEGER,
    "fiscalId" INTEGER,
    "focoId" INTEGER,
    "delitoId" INTEGER,
    "abogadoId" INTEGER,
    "tribunalId" INTEGER,
    "nacionalidadVictimaId" INTEGER,

    CONSTRAINT "Causa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Victima" (
    "id" SERIAL NOT NULL,
    "nombreVictima" TEXT NOT NULL,
    "docId" TEXT NOT NULL,
    "nacionalidadId" INTEGER,

    CONSTRAINT "Victima_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Imputado" (
    "id" SERIAL NOT NULL,
    "nombreSujeto" TEXT NOT NULL,
    "docId" TEXT NOT NULL,
    "nacionalidadId" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "fotoPrincipal" TEXT,

    CONSTRAINT "Imputado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fotografia" (
    "id" SERIAL NOT NULL,
    "url" TEXT,
    "filename" TEXT NOT NULL,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imputadoId" INTEGER NOT NULL,

    CONSTRAINT "Fotografia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nacionalidad" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Nacionalidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analista" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Analista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fiscal" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Fiscal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Foco" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Foco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delito" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Delito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Abogado" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Abogado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tribunal" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Tribunal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CausasImputados" (
    "causaId" INTEGER NOT NULL,
    "imputadoId" INTEGER NOT NULL,
    "cautelarId" INTEGER,
    "fechaFormalizacion" TIMESTAMP(3),
    "formalizado" BOOLEAN NOT NULL DEFAULT false,
    "esimputado" BOOLEAN NOT NULL DEFAULT false,
    "essujetoInteres" BOOLEAN NOT NULL DEFAULT false,
    "plazo" INTEGER,

    CONSTRAINT "CausasImputados_pkey" PRIMARY KEY ("causaId","imputadoId")
);

-- CreateTable
CREATE TABLE "CausasVictimas" (
    "causaId" INTEGER NOT NULL,
    "victimaId" INTEGER NOT NULL,

    CONSTRAINT "CausasVictimas_pkey" PRIMARY KEY ("causaId","victimaId")
);

-- CreateTable
CREATE TABLE "Comuna" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Comuna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cautelar" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Cautelar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoOrganizacion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoOrganizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizacionDelictual" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaIdentificacion" TIMESTAMP(3) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "tipoOrganizacionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizacionDelictual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MiembrosOrganizacion" (
    "id" SERIAL NOT NULL,
    "organizacionId" INTEGER NOT NULL,
    "imputadoId" INTEGER NOT NULL,
    "rol" TEXT,
    "fechaIngreso" TIMESTAMP(3) NOT NULL,
    "fechaSalida" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MiembrosOrganizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telefonos" (
    "id" SERIAL NOT NULL,
    "numeroTelefonico" INTEGER NOT NULL,
    "idProveedorServicio" INTEGER NOT NULL,
    "imei" TEXT NOT NULL,
    "abonado" TEXT NOT NULL,
    "solicitaTrafico" BOOLEAN NOT NULL,
    "solicitaImei" BOOLEAN NOT NULL,
    "observacion" TEXT,

    CONSTRAINT "telefonos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telefonos_causa" (
    "id" SERIAL NOT NULL,
    "idTelefono" INTEGER NOT NULL,
    "idCausa" INTEGER NOT NULL,

    CONSTRAINT "telefonos_causa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "clerk_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cargo" TEXT,
    "rolId" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoActividad" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(500),
    "areaId" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoActividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Actividad" (
    "id" SERIAL NOT NULL,
    "causa_id" INTEGER NOT NULL,
    "tipo_actividad_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaTermino" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoActividad" NOT NULL DEFAULT 'inicio',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Actividad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MiembrosOrganizacion_organizacionId_imputadoId_key" ON "MiembrosOrganizacion"("organizacionId", "imputadoId");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_clerk_id_key" ON "usuarios"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Area_nombre_key" ON "Area"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "TipoActividad_nombre_key" ON "TipoActividad"("nombre");

-- CreateIndex
CREATE INDEX "TipoActividad_areaId_idx" ON "TipoActividad"("areaId");

-- CreateIndex
CREATE INDEX "Actividad_causa_id_idx" ON "Actividad"("causa_id");

-- CreateIndex
CREATE INDEX "Actividad_tipo_actividad_id_idx" ON "Actividad"("tipo_actividad_id");

-- CreateIndex
CREATE INDEX "Actividad_usuario_id_idx" ON "Actividad"("usuario_id");

-- AddForeignKey
ALTER TABLE "Causa" ADD CONSTRAINT "Causa_abogadoId_fkey" FOREIGN KEY ("abogadoId") REFERENCES "Abogado"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Causa" ADD CONSTRAINT "Causa_analistaId_fkey" FOREIGN KEY ("analistaId") REFERENCES "Analista"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Causa" ADD CONSTRAINT "Causa_comunaId_fkey" FOREIGN KEY ("comunaId") REFERENCES "Comuna"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Causa" ADD CONSTRAINT "Causa_delitoId_fkey" FOREIGN KEY ("delitoId") REFERENCES "Delito"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Causa" ADD CONSTRAINT "Causa_fiscalId_fkey" FOREIGN KEY ("fiscalId") REFERENCES "Fiscal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Causa" ADD CONSTRAINT "Causa_focoId_fkey" FOREIGN KEY ("focoId") REFERENCES "Foco"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Causa" ADD CONSTRAINT "Causa_nacionalidadVictimaId_fkey" FOREIGN KEY ("nacionalidadVictimaId") REFERENCES "Nacionalidad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Causa" ADD CONSTRAINT "Causa_tribunalId_fkey" FOREIGN KEY ("tribunalId") REFERENCES "Tribunal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Victima" ADD CONSTRAINT "Victima_nacionalidadId_fkey" FOREIGN KEY ("nacionalidadId") REFERENCES "Nacionalidad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Imputado" ADD CONSTRAINT "Imputado_nacionalidadId_fkey" FOREIGN KEY ("nacionalidadId") REFERENCES "Nacionalidad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fotografia" ADD CONSTRAINT "Fotografia_imputadoId_fkey" FOREIGN KEY ("imputadoId") REFERENCES "Imputado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CausasImputados" ADD CONSTRAINT "CausasImputados_causaId_fkey" FOREIGN KEY ("causaId") REFERENCES "Causa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CausasImputados" ADD CONSTRAINT "CausasImputados_cautelarId_fkey" FOREIGN KEY ("cautelarId") REFERENCES "Cautelar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CausasImputados" ADD CONSTRAINT "CausasImputados_imputadoId_fkey" FOREIGN KEY ("imputadoId") REFERENCES "Imputado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CausasVictimas" ADD CONSTRAINT "CausasVictimas_causaId_fkey" FOREIGN KEY ("causaId") REFERENCES "Causa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CausasVictimas" ADD CONSTRAINT "CausasVictimas_victimaId_fkey" FOREIGN KEY ("victimaId") REFERENCES "Victima"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizacionDelictual" ADD CONSTRAINT "OrganizacionDelictual_tipoOrganizacionId_fkey" FOREIGN KEY ("tipoOrganizacionId") REFERENCES "TipoOrganizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MiembrosOrganizacion" ADD CONSTRAINT "MiembrosOrganizacion_imputadoId_fkey" FOREIGN KEY ("imputadoId") REFERENCES "Imputado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MiembrosOrganizacion" ADD CONSTRAINT "MiembrosOrganizacion_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "OrganizacionDelictual"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telefonos" ADD CONSTRAINT "telefonos_idProveedorServicio_fkey" FOREIGN KEY ("idProveedorServicio") REFERENCES "proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telefonos_causa" ADD CONSTRAINT "telefonos_causa_idTelefono_fkey" FOREIGN KEY ("idTelefono") REFERENCES "telefonos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telefonos_causa" ADD CONSTRAINT "telefonos_causa_idCausa_fkey" FOREIGN KEY ("idCausa") REFERENCES "Causa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipoActividad" ADD CONSTRAINT "TipoActividad_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Actividad" ADD CONSTRAINT "Actividad_causa_id_fkey" FOREIGN KEY ("causa_id") REFERENCES "Causa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Actividad" ADD CONSTRAINT "Actividad_tipo_actividad_id_fkey" FOREIGN KEY ("tipo_actividad_id") REFERENCES "TipoActividad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Actividad" ADD CONSTRAINT "Actividad_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
