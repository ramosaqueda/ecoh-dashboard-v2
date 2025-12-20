-- CreateEnum
CREATE TYPE "estadoactividad" AS ENUM ('inicio', 'en_proceso', 'terminado');

-- DropForeignKey
ALTER TABLE "telefonos" DROP CONSTRAINT "telefonos_idProveedorServicio_fkey";

-- DropForeignKey
ALTER TABLE "telefonos_causa" DROP CONSTRAINT "telefonos_causa_idCausa_fkey";

-- DropForeignKey
ALTER TABLE "telefonos_causa" DROP CONSTRAINT "telefonos_causa_idTelefono_fkey";

-- DropForeignKey
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_rolId_fkey";

-- AlterTable
ALTER TABLE "Actividad" ADD COLUMN     " glosa_cierre" TEXT,
ADD COLUMN     "observacion" TEXT,
ADD COLUMN     "usuario_asignado_id" INTEGER;

-- AlterTable
ALTER TABLE "Causa" ADD COLUMN     "atvtId" INTEGER,
ADD COLUMN     "causaSacfi" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "esCrimenOrganizado" BOOLEAN,
ADD COLUMN     "estadoCausaId" INTEGER,
ADD COLUMN     "origenCausaId" INTEGER;

-- AlterTable
ALTER TABLE "Imputado" ADD COLUMN     "alias" TEXT,
ADD COLUMN     "caracteristicas" TEXT;

-- AlterTable
ALTER TABLE "TipoActividad" ADD COLUMN     "reqinforme" BOOLEAN DEFAULT false,
ADD COLUMN     "siglainf" TEXT;

-- AlterTable
ALTER TABLE "telefonos" ADD COLUMN     "enviar_custodia" BOOLEAN,
ADD COLUMN     "extraccionForense" BOOLEAN,
ADD COLUMN     "id_ubicacion" INTEGER,
ADD COLUMN     "nue" TEXT,
ALTER COLUMN "numeroTelefonico" DROP NOT NULL,
ALTER COLUMN "numeroTelefonico" SET DATA TYPE TEXT,
ALTER COLUMN "solicitaTrafico" DROP NOT NULL,
ALTER COLUMN "solicitaImei" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Genograma" (
    "id" SERIAL NOT NULL,
    "rucCausa" VARCHAR(255),
    "personas" JSONB NOT NULL,
    "relaciones" JSONB NOT NULL,
    "mermaidCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "causaId" INTEGER,

    CONSTRAINT "Genograma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineHito" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "fecha" TIMESTAMP(6) NOT NULL,
    "descripcion" TEXT,
    "icono" TEXT,
    "imagenUrl" TEXT,
    "causaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "TimelineHito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CausaOrganizacion" (
    "id" SERIAL NOT NULL,
    "organizacionId" INTEGER NOT NULL,
    "causaId" INTEGER NOT NULL,
    "fechaAsociacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacion" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CausaOrganizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrimenOrganizadoParams" (
    "value" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "CrimenOrganizadoParams_pkey" PRIMARY KEY ("value")
);

-- CreateTable
CREATE TABLE "CausasCrimenOrganizado" (
    "causaId" INTEGER NOT NULL,
    "parametroId" INTEGER NOT NULL,
    "estado" BOOLEAN,

    CONSTRAINT "CausasCrimenOrganizado_pkey" PRIMARY KEY ("causaId","parametroId")
);

-- CreateTable
CREATE TABLE "CausasRelacionadas" (
    "id" SERIAL NOT NULL,
    "causaMadreId" INTEGER NOT NULL,
    "causaAristaId" INTEGER NOT NULL,
    "fechaRelacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacion" TEXT,
    "tipoRelacion" VARCHAR(255),

    CONSTRAINT "CausasRelacionadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Atvt" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT " Atvt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ubicacion_telefono" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,

    CONSTRAINT "ubicaciontelefono_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorrelativoTipoActividad" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER,
    "sigla" TEXT,
    "tipoActividad" INTEGER NOT NULL,
    "usuario" INTEGER,
    "createdAt" TIMESTAMP(6),

    CONSTRAINT "CorrelativoTipoActividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedidaIntrusiva" (
    "id" SERIAL NOT NULL,
    "causa_id" INTEGER NOT NULL,
    "tipo_medida_id" INTEGER NOT NULL,
    "fiscal_id" INTEGER NOT NULL,
    "tribunal_id" INTEGER NOT NULL,
    "cantidad_domicilios" INTEGER,
    "domicilios_aprobados" INTEGER,
    "detenidos" INTEGER,
    "unidad_policial_id" INTEGER NOT NULL,
    "fechaSolicitud" TIMESTAMP(6) NOT NULL,
    "nombreJuez" VARCHAR(255),
    "estado" "estadoactividad" NOT NULL DEFAULT 'inicio',
    "observacion" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedidaIntrusiva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resoluciones_tribunal" (
    "id" SERIAL NOT NULL,
    "resolucion" VARCHAR(100) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resoluciones_tribunal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnidadPolicial" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "UnidadPolicial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MIHallazgos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "MIHallazgos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoMedida" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TipoMedida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medida_Hallazgo" (
    "medida_id" INTEGER NOT NULL,
    "hallazgo_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Medida_Hallazgo_pkey" PRIMARY KEY ("medida_id","hallazgo_id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "color" VARCHAR(20),
    "icono" VARCHAR(50),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sitios" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "icono" VARCHAR(50) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER,
    "categoria_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sitios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "origenes_causa" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(500),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "color" VARCHAR(7),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "origenes_causa_pkey" PRIMARY KEY ("id")
);

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
CREATE INDEX "Genograma_causaId_idx" ON "Genograma"("causaId");

-- CreateIndex
CREATE INDEX "Genograma_rucCausa_idx" ON "Genograma"("rucCausa");

-- CreateIndex
CREATE INDEX "idx_timelinehito_causaid" ON "TimelineHito"("causaId");

-- CreateIndex
CREATE INDEX "CausaOrganizacion_causaId_idx" ON "CausaOrganizacion"("causaId");

-- CreateIndex
CREATE INDEX "CausaOrganizacion_organizacionId_idx" ON "CausaOrganizacion"("organizacionId");

-- CreateIndex
CREATE UNIQUE INDEX "CausaOrganizacion_organizacionId_causaId_unique" ON "CausaOrganizacion"("organizacionId", "causaId");

-- CreateIndex
CREATE INDEX "idx_causas_relacionadas_arista" ON "CausasRelacionadas"("causaAristaId");

-- CreateIndex
CREATE INDEX "idx_causas_relacionadas_fecha" ON "CausasRelacionadas"("fechaRelacion");

-- CreateIndex
CREATE INDEX "idx_causas_relacionadas_madre" ON "CausasRelacionadas"("causaMadreId");

-- CreateIndex
CREATE UNIQUE INDEX "CausasRelacionadas_causaMadreId_causaAristaId_key" ON "CausasRelacionadas"("causaMadreId", "causaAristaId");

-- CreateIndex
CREATE UNIQUE INDEX "unique_ubicacion_nombre" ON "ubicacion_telefono"("nombre");

-- CreateIndex
CREATE INDEX "medida_intrusiva_causa_id_idx" ON "MedidaIntrusiva"("causa_id");

-- CreateIndex
CREATE INDEX "medida_intrusiva_fiscal_id_idx" ON "MedidaIntrusiva"("fiscal_id");

-- CreateIndex
CREATE INDEX "medida_intrusiva_tipo_medida_id_idx" ON "MedidaIntrusiva"("tipo_medida_id");

-- CreateIndex
CREATE UNIQUE INDEX "resoluciones_tribunal_resolucion_key" ON "resoluciones_tribunal"("resolucion");

-- CreateIndex
CREATE UNIQUE INDEX "UnidadPolicial_nombre_key" ON "UnidadPolicial"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "MIHallazgos_nombre_key" ON "MIHallazgos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "TipoMedida_nombre_key" ON "TipoMedida"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_key" ON "categorias"("nombre");

-- CreateIndex
CREATE INDEX "idx_categorias_activo" ON "categorias"("activo");

-- CreateIndex
CREATE INDEX "idx_categorias_orden" ON "categorias"("orden");

-- CreateIndex
CREATE INDEX "idx_sitios_activo" ON "sitios"("activo");

-- CreateIndex
CREATE INDEX "idx_sitios_categoria_id" ON "sitios"("categoria_id");

-- CreateIndex
CREATE INDEX "idx_sitios_nombre" ON "sitios"("nombre");

-- CreateIndex
CREATE INDEX "idx_sitios_orden" ON "sitios"("orden");

-- CreateIndex
CREATE UNIQUE INDEX "estados_causa_nombre_key" ON "estados_causa"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "estados_causa_codigo_key" ON "estados_causa"("codigo");

-- CreateIndex
CREATE INDEX "idx_actividad_usuario_asignado" ON "Actividad"("usuario_asignado_id");

-- CreateIndex
CREATE INDEX "fki_fk_causa_atvt" ON "Causa"("atvtId");

-- CreateIndex
CREATE INDEX "idx_telefonos_imei" ON "telefonos"("imei");

-- CreateIndex
CREATE INDEX "idx_telefonos_numero" ON "telefonos"("numeroTelefonico");

-- CreateIndex
CREATE INDEX "idx_telefonos_proveedor" ON "telefonos"("idProveedorServicio");

-- CreateIndex
CREATE INDEX "idx_telefonos_ubicacion" ON "telefonos"("id_ubicacion");

-- AddForeignKey
ALTER TABLE "Genograma" ADD CONSTRAINT "Genograma_causaId_fkey" FOREIGN KEY ("causaId") REFERENCES "Causa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineHito" ADD CONSTRAINT "fk_causa" FOREIGN KEY ("causaId") REFERENCES "Causa"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Causa" ADD CONSTRAINT "fk_causa_atvt" FOREIGN KEY ("atvtId") REFERENCES "Atvt"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Causa" ADD CONSTRAINT "Causa_origenCausaId_fkey" FOREIGN KEY ("origenCausaId") REFERENCES "origenes_causa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Causa" ADD CONSTRAINT "Causa_estadoCausaId_fkey" FOREIGN KEY ("estadoCausaId") REFERENCES "estados_causa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CausaOrganizacion" ADD CONSTRAINT "CausaOrganizacion_causaId_fkey" FOREIGN KEY ("causaId") REFERENCES "Causa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CausaOrganizacion" ADD CONSTRAINT "CausaOrganizacion_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "OrganizacionDelictual"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CausasCrimenOrganizado" ADD CONSTRAINT "CausasCrimenOrganizado_parametroId_fkey" FOREIGN KEY ("parametroId") REFERENCES "CrimenOrganizadoParams"("value") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CausasRelacionadas" ADD CONSTRAINT "CausasRelacionadas_causaAristaId_fkey" FOREIGN KEY ("causaAristaId") REFERENCES "Causa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CausasRelacionadas" ADD CONSTRAINT "CausasRelacionadas_causaMadreId_fkey" FOREIGN KEY ("causaMadreId") REFERENCES "Causa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telefonos" ADD CONSTRAINT "fk_telefono_proveedor" FOREIGN KEY ("idProveedorServicio") REFERENCES "proveedores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "telefonos" ADD CONSTRAINT "fk_telefono_ubicacion" FOREIGN KEY ("id_ubicacion") REFERENCES "ubicacion_telefono"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "telefonos_causa" ADD CONSTRAINT "fk_telefonocausa_causa" FOREIGN KEY ("idCausa") REFERENCES "Causa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "telefonos_causa" ADD CONSTRAINT "fk_telefonocausa_telefono" FOREIGN KEY ("idTelefono") REFERENCES "telefonos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "fk_usuario_rol" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CorrelativoTipoActividad" ADD CONSTRAINT "fkUsuario" FOREIGN KEY ("usuario") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CorrelativoTipoActividad" ADD CONSTRAINT "fktipoActividad" FOREIGN KEY ("tipoActividad") REFERENCES "TipoActividad"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Actividad" ADD CONSTRAINT "fk_actividad_usuario_asignado" FOREIGN KEY ("usuario_asignado_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MedidaIntrusiva" ADD CONSTRAINT "MedidaIntrusiva_causa_id_fkey" FOREIGN KEY ("causa_id") REFERENCES "Causa"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MedidaIntrusiva" ADD CONSTRAINT "MedidaIntrusiva_fiscal_id_fkey" FOREIGN KEY ("fiscal_id") REFERENCES "Fiscal"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MedidaIntrusiva" ADD CONSTRAINT "MedidaIntrusiva_tipo_medida_id_fkey" FOREIGN KEY ("tipo_medida_id") REFERENCES "TipoMedida"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MedidaIntrusiva" ADD CONSTRAINT "MedidaIntrusiva_tribunal_id_fkey" FOREIGN KEY ("tribunal_id") REFERENCES "Tribunal"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MedidaIntrusiva" ADD CONSTRAINT "MedidaIntrusiva_unidad_policial_id_fkey" FOREIGN KEY ("unidad_policial_id") REFERENCES "UnidadPolicial"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Medida_Hallazgo" ADD CONSTRAINT "Medida_Hallazgo_hallazgo_id_fkey" FOREIGN KEY ("hallazgo_id") REFERENCES "MIHallazgos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Medida_Hallazgo" ADD CONSTRAINT "Medida_Hallazgo_medida_id_fkey" FOREIGN KEY ("medida_id") REFERENCES "MedidaIntrusiva"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sitios" ADD CONSTRAINT "fk_sitios_categoria" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
