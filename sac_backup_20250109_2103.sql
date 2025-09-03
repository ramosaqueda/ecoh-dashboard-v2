--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: EstadoActividad; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EstadoActividad" AS ENUM (
    'inicio',
    'en_proceso',
    'terminado'
);


ALTER TYPE public."EstadoActividad" OWNER TO postgres;

--
-- Name: estadoactividad; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estadoactividad AS ENUM (
    'inicio',
    'en_proceso',
    'terminado'
);


ALTER TYPE public.estadoactividad OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Atvt; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Atvt" (
    id integer NOT NULL,
    nombre text NOT NULL
);


ALTER TABLE public."Atvt" OWNER TO postgres;

--
-- Name:  Atvt_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public." Atvt_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public." Atvt_id_seq" OWNER TO postgres;

--
-- Name:  Atvt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public." Atvt_id_seq" OWNED BY public."Atvt".id;


--
-- Name: Abogado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Abogado" (
    id integer NOT NULL,
    nombre text NOT NULL
);


ALTER TABLE public."Abogado" OWNER TO postgres;

--
-- Name: Abogado_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Abogado_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Abogado_id_seq" OWNER TO postgres;

--
-- Name: Abogado_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Abogado_id_seq" OWNED BY public."Abogado".id;


--
-- Name: Actividad; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Actividad" (
    id integer NOT NULL,
    causa_id integer NOT NULL,
    tipo_actividad_id integer NOT NULL,
    usuario_id integer NOT NULL,
    "fechaInicio" timestamp(3) without time zone NOT NULL,
    "fechaTermino" timestamp(3) without time zone NOT NULL,
    estado public."EstadoActividad" DEFAULT 'inicio'::public."EstadoActividad" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    observacion text,
    usuario_asignado_id integer,
    " glosa_cierre" text
);


ALTER TABLE public."Actividad" OWNER TO postgres;

--
-- Name: Actividad_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Actividad_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Actividad_id_seq" OWNER TO postgres;

--
-- Name: Actividad_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Actividad_id_seq" OWNED BY public."Actividad".id;


--
-- Name: Analista; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Analista" (
    id integer NOT NULL,
    nombre text NOT NULL
);


ALTER TABLE public."Analista" OWNER TO postgres;

--
-- Name: Analista_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Analista_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Analista_id_seq" OWNER TO postgres;

--
-- Name: Analista_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Analista_id_seq" OWNED BY public."Analista".id;


--
-- Name: Area; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Area" (
    id integer NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Area" OWNER TO postgres;

--
-- Name: Area_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Area_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Area_id_seq" OWNER TO postgres;

--
-- Name: Area_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Area_id_seq" OWNED BY public."Area".id;


--
-- Name: Causa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Causa" (
    id integer NOT NULL,
    "denominacionCausa" text NOT NULL,
    ruc text,
    "fechaDelHecho" timestamp(3) without time zone,
    rit text,
    "fechaIta" timestamp(3) without time zone,
    "numeroIta" text,
    "fechaPpp" timestamp(3) without time zone,
    "numeroPpp" text,
    observacion text,
    foliobw text,
    "causaEcoh" boolean NOT NULL,
    "causaLegada" boolean,
    "coordenadasSs" text,
    "homicidioConsumado" boolean,
    "constituyeSs" boolean,
    "sinLlamadoEcoh" boolean,
    "fechaHoraTomaConocimiento" timestamp(3) without time zone,
    "comunaId" integer,
    "analistaId" integer,
    "fiscalId" integer,
    "focoId" integer,
    "delitoId" integer,
    "abogadoId" integer,
    "tribunalId" integer,
    "nacionalidadVictimaId" integer,
    "esCrimenOrganizado" boolean,
    "atvtId" integer,
    "causaSacfi" boolean DEFAULT false NOT NULL,
    "estadoCausaId" integer
);


ALTER TABLE public."Causa" OWNER TO postgres;

--
-- Name: CausaOrganizacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CausaOrganizacion" (
    id integer NOT NULL,
    "organizacionId" integer NOT NULL,
    "causaId" integer NOT NULL,
    "fechaAsociacion" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    observacion text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CausaOrganizacion" OWNER TO postgres;

--
-- Name: CausaOrganizacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."CausaOrganizacion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CausaOrganizacion_id_seq" OWNER TO postgres;

--
-- Name: CausaOrganizacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."CausaOrganizacion_id_seq" OWNED BY public."CausaOrganizacion".id;


--
-- Name: Causa_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Causa_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Causa_id_seq" OWNER TO postgres;

--
-- Name: Causa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Causa_id_seq" OWNED BY public."Causa".id;


--
-- Name: CausasCrimenOrganizado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CausasCrimenOrganizado" (
    "causaId" integer NOT NULL,
    "parametroId" integer NOT NULL,
    estado boolean
);


ALTER TABLE public."CausasCrimenOrganizado" OWNER TO postgres;

--
-- Name: CausasImputados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CausasImputados" (
    "causaId" integer NOT NULL,
    "imputadoId" integer NOT NULL,
    "cautelarId" integer,
    "fechaFormalizacion" timestamp(3) without time zone,
    formalizado boolean DEFAULT false NOT NULL,
    esimputado boolean DEFAULT false NOT NULL,
    "essujetoInteres" boolean DEFAULT false NOT NULL,
    plazo integer
);


ALTER TABLE public."CausasImputados" OWNER TO postgres;

--
-- Name: CausasRelacionadas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CausasRelacionadas" (
    id integer NOT NULL,
    "causaMadreId" integer NOT NULL,
    "causaAristaId" integer NOT NULL,
    "fechaRelacion" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    observacion text,
    "tipoRelacion" character varying(255),
    CONSTRAINT check_no_self_reference CHECK (("causaMadreId" <> "causaAristaId"))
);


ALTER TABLE public."CausasRelacionadas" OWNER TO postgres;

--
-- Name: CausasRelacionadas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."CausasRelacionadas_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CausasRelacionadas_id_seq" OWNER TO postgres;

--
-- Name: CausasRelacionadas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."CausasRelacionadas_id_seq" OWNED BY public."CausasRelacionadas".id;


--
-- Name: CausasVictimas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CausasVictimas" (
    "causaId" integer NOT NULL,
    "victimaId" integer NOT NULL
);


ALTER TABLE public."CausasVictimas" OWNER TO postgres;

--
-- Name: Cautelar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Cautelar" (
    id integer NOT NULL,
    nombre text NOT NULL
);


ALTER TABLE public."Cautelar" OWNER TO postgres;

--
-- Name: Cautelar_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Cautelar_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Cautelar_id_seq" OWNER TO postgres;

--
-- Name: Cautelar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Cautelar_id_seq" OWNED BY public."Cautelar".id;


--
-- Name: Comuna; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Comuna" (
    id integer NOT NULL,
    nombre text NOT NULL
);


ALTER TABLE public."Comuna" OWNER TO postgres;

--
-- Name: Comuna_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Comuna_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Comuna_id_seq" OWNER TO postgres;

--
-- Name: Comuna_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Comuna_id_seq" OWNED BY public."Comuna".id;


--
-- Name: CorrelativoTipoActividadSeq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."CorrelativoTipoActividadSeq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CorrelativoTipoActividadSeq" OWNER TO postgres;

--
-- Name: CorrelativoTipoActividad; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CorrelativoTipoActividad" (
    id integer DEFAULT nextval('public."CorrelativoTipoActividadSeq"'::regclass) NOT NULL,
    numero integer,
    sigla text,
    "tipoActividad" integer NOT NULL,
    usuario integer,
    "createdAt" timestamp without time zone
);


ALTER TABLE public."CorrelativoTipoActividad" OWNER TO postgres;

--
-- Name: CrimenOrganizadoParams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CrimenOrganizadoParams" (
    value integer NOT NULL,
    label text NOT NULL,
    descripcion text NOT NULL
);


ALTER TABLE public."CrimenOrganizadoParams" OWNER TO postgres;

--
-- Name: Delito; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Delito" (
    id integer NOT NULL,
    nombre text NOT NULL
);


ALTER TABLE public."Delito" OWNER TO postgres;

--
-- Name: Delito_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Delito_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Delito_id_seq" OWNER TO postgres;

--
-- Name: Delito_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Delito_id_seq" OWNED BY public."Delito".id;


--
-- Name: Fiscal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Fiscal" (
    id integer NOT NULL,
    nombre text NOT NULL
);


ALTER TABLE public."Fiscal" OWNER TO postgres;

--
-- Name: Fiscal_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Fiscal_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Fiscal_id_seq" OWNER TO postgres;

--
-- Name: Fiscal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Fiscal_id_seq" OWNED BY public."Fiscal".id;


--
-- Name: Foco; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Foco" (
    id integer NOT NULL,
    nombre text NOT NULL
);


ALTER TABLE public."Foco" OWNER TO postgres;

--
-- Name: Foco_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Foco_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Foco_id_seq" OWNER TO postgres;

--
-- Name: Foco_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Foco_id_seq" OWNED BY public."Foco".id;


--
-- Name: Fotografia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Fotografia" (
    id integer NOT NULL,
    url text,
    filename text NOT NULL,
    "esPrincipal" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "imputadoId" integer NOT NULL
);


ALTER TABLE public."Fotografia" OWNER TO postgres;

--
-- Name: Fotografia_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Fotografia_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Fotografia_id_seq" OWNER TO postgres;

--
-- Name: Fotografia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Fotografia_id_seq" OWNED BY public."Fotografia".id;


--
-- Name: Genograma; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Genograma" (
    id integer NOT NULL,
    "rucCausa" character varying(255),
    personas jsonb NOT NULL,
    relaciones jsonb NOT NULL,
    "mermaidCode" text NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "causaId" integer
);


ALTER TABLE public."Genograma" OWNER TO postgres;

--
-- Name: Genograma_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Genograma_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Genograma_id_seq" OWNER TO postgres;

--
-- Name: Genograma_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Genograma_id_seq" OWNED BY public."Genograma".id;


--
-- Name: Imputado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Imputado" (
    id integer NOT NULL,
    "nombreSujeto" text NOT NULL,
    "docId" text NOT NULL,
    "nacionalidadId" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone,
    "fotoPrincipal" text,
    alias text,
    caracterisiticas text
);


ALTER TABLE public."Imputado" OWNER TO postgres;

--
-- Name: Imputado_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Imputado_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Imputado_id_seq" OWNER TO postgres;

--
-- Name: Imputado_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Imputado_id_seq" OWNED BY public."Imputado".id;


--
-- Name: MIHallazgos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MIHallazgos" (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL
);


ALTER TABLE public."MIHallazgos" OWNER TO postgres;

--
-- Name: MIHallazgos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."MIHallazgos_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."MIHallazgos_id_seq" OWNER TO postgres;

--
-- Name: MIHallazgos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."MIHallazgos_id_seq" OWNED BY public."MIHallazgos".id;


--
-- Name: MedidaIntrusiva; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MedidaIntrusiva" (
    id integer NOT NULL,
    causa_id integer NOT NULL,
    tipo_medida_id integer NOT NULL,
    fiscal_id integer NOT NULL,
    tribunal_id integer NOT NULL,
    cantidad_domicilios integer,
    domicilios_aprobados integer,
    detenidos integer,
    unidad_policial_id integer NOT NULL,
    "fechaSolicitud" timestamp without time zone NOT NULL,
    "nombreJuez" character varying(255),
    estado public.estadoactividad DEFAULT 'inicio'::public.estadoactividad NOT NULL,
    observacion text,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."MedidaIntrusiva" OWNER TO postgres;

--
-- Name: MedidaIntrusiva_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."MedidaIntrusiva_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."MedidaIntrusiva_id_seq" OWNER TO postgres;

--
-- Name: MedidaIntrusiva_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."MedidaIntrusiva_id_seq" OWNED BY public."MedidaIntrusiva".id;


--
-- Name: Medida_Hallazgo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Medida_Hallazgo" (
    medida_id integer NOT NULL,
    hallazgo_id integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Medida_Hallazgo" OWNER TO postgres;

--
-- Name: MiembrosOrganizacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MiembrosOrganizacion" (
    id integer NOT NULL,
    "organizacionId" integer NOT NULL,
    "imputadoId" integer NOT NULL,
    rol text,
    "fechaIngreso" timestamp(3) without time zone NOT NULL,
    "fechaSalida" timestamp(3) without time zone,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MiembrosOrganizacion" OWNER TO postgres;

--
-- Name: MiembrosOrganizacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."MiembrosOrganizacion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."MiembrosOrganizacion_id_seq" OWNER TO postgres;

--
-- Name: MiembrosOrganizacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."MiembrosOrganizacion_id_seq" OWNED BY public."MiembrosOrganizacion".id;


--
-- Name: Nacionalidad; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Nacionalidad" (
    id integer NOT NULL,
    nombre text NOT NULL
);


ALTER TABLE public."Nacionalidad" OWNER TO postgres;

--
-- Name: Nacionalidad_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Nacionalidad_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Nacionalidad_id_seq" OWNER TO postgres;

--
-- Name: Nacionalidad_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Nacionalidad_id_seq" OWNED BY public."Nacionalidad".id;


--
-- Name: OrganizacionDelictual; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrganizacionDelictual" (
    id integer NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    "fechaIdentificacion" timestamp(3) without time zone NOT NULL,
    activa boolean DEFAULT true NOT NULL,
    "tipoOrganizacionId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."OrganizacionDelictual" OWNER TO postgres;

--
-- Name: OrganizacionDelictual_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."OrganizacionDelictual_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."OrganizacionDelictual_id_seq" OWNER TO postgres;

--
-- Name: OrganizacionDelictual_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."OrganizacionDelictual_id_seq" OWNED BY public."OrganizacionDelictual".id;


--
-- Name: TimelineHito; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TimelineHito" (
    id integer NOT NULL,
    titulo text NOT NULL,
    fecha timestamp without time zone NOT NULL,
    descripcion text,
    icono text,
    "imagenUrl" text,
    "causaId" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone NOT NULL
);


ALTER TABLE public."TimelineHito" OWNER TO postgres;

--
-- Name: TimelineHito_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."TimelineHito_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."TimelineHito_id_seq" OWNER TO postgres;

--
-- Name: TimelineHito_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."TimelineHito_id_seq" OWNED BY public."TimelineHito".id;


--
-- Name: TipoActividad; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TipoActividad" (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion character varying(500),
    "areaId" integer NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    siglainf text,
    reqinforme boolean DEFAULT false
);


ALTER TABLE public."TipoActividad" OWNER TO postgres;

--
-- Name: TipoActividad_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."TipoActividad_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."TipoActividad_id_seq" OWNER TO postgres;

--
-- Name: TipoActividad_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."TipoActividad_id_seq" OWNED BY public."TipoActividad".id;


--
-- Name: TipoMedida; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TipoMedida" (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TipoMedida" OWNER TO postgres;

--
-- Name: TipoMedida_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."TipoMedida_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."TipoMedida_id_seq" OWNER TO postgres;

--
-- Name: TipoMedida_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."TipoMedida_id_seq" OWNED BY public."TipoMedida".id;


--
-- Name: TipoOrganizacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TipoOrganizacion" (
    id integer NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TipoOrganizacion" OWNER TO postgres;

--
-- Name: TipoOrganizacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."TipoOrganizacion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."TipoOrganizacion_id_seq" OWNER TO postgres;

--
-- Name: TipoOrganizacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."TipoOrganizacion_id_seq" OWNED BY public."TipoOrganizacion".id;


--
-- Name: Tribunal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Tribunal" (
    id integer NOT NULL,
    nombre text NOT NULL
);


ALTER TABLE public."Tribunal" OWNER TO postgres;

--
-- Name: Tribunal_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Tribunal_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Tribunal_id_seq" OWNER TO postgres;

--
-- Name: Tribunal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Tribunal_id_seq" OWNED BY public."Tribunal".id;


--
-- Name: UnidadPolicial; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UnidadPolicial" (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL
);


ALTER TABLE public."UnidadPolicial" OWNER TO postgres;

--
-- Name: UnidadPolicial_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."UnidadPolicial_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."UnidadPolicial_id_seq" OWNER TO postgres;

--
-- Name: UnidadPolicial_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."UnidadPolicial_id_seq" OWNED BY public."UnidadPolicial".id;


--
-- Name: Victima; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Victima" (
    id integer NOT NULL,
    "nombreVictima" text NOT NULL,
    "docId" text NOT NULL,
    "nacionalidadId" integer
);


ALTER TABLE public."Victima" OWNER TO postgres;

--
-- Name: Victima_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Victima_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Victima_id_seq" OWNER TO postgres;

--
-- Name: Victima_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Victima_id_seq" OWNED BY public."Victima".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: categorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL,
    descripcion text,
    color character varying(20),
    icono character varying(50),
    activo boolean DEFAULT true NOT NULL,
    orden integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.categorias OWNER TO postgres;

--
-- Name: categorias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categorias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categorias_id_seq OWNER TO postgres;

--
-- Name: categorias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categorias_id_seq OWNED BY public.categorias.id;


--
-- Name: estados_causa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estados_causa (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion character varying(500),
    codigo character varying(20) NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    orden integer,
    color character varying(7),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone
);


ALTER TABLE public.estados_causa OWNER TO postgres;

--
-- Name: estados_causa_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estados_causa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estados_causa_id_seq OWNER TO postgres;

--
-- Name: estados_causa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estados_causa_id_seq OWNED BY public.estados_causa.id;


--
-- Name: origenes_causa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.origenes_causa (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL,
    descripcion character varying(200),
    codigo character varying(10) NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    orden integer,
    color character varying(7),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.origenes_causa OWNER TO postgres;

--
-- Name: origenes_causa_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.origenes_causa_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER SEQUENCE public.origenes_causa_id_seq OWNER TO postgres;

--
-- Name: origenes_causa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.origenes_causa_id_seq OWNED BY public.origenes_causa.id;


--
-- Name: proveedores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proveedores (
    id integer NOT NULL,
    nombre text NOT NULL
);


ALTER TABLE public.proveedores OWNER TO postgres;

--
-- Name: proveedores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.proveedores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.proveedores_id_seq OWNER TO postgres;

--
-- Name: proveedores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.proveedores_id_seq OWNED BY public.proveedores.id;


--
-- Name: resoluciones_tribunal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resoluciones_tribunal (
    id integer NOT NULL,
    resolucion character varying(100) NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.resoluciones_tribunal OWNER TO postgres;

--
-- Name: resoluciones_tribunal_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.resoluciones_tribunal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.resoluciones_tribunal_id_seq OWNER TO postgres;

--
-- Name: resoluciones_tribunal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.resoluciones_tribunal_id_seq OWNED BY public.resoluciones_tribunal.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: sitios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sitios (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text NOT NULL,
    url character varying(500) NOT NULL,
    icono character varying(50) NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    orden integer,
    categoria_id integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sitios OWNER TO postgres;

--
-- Name: sitios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sitios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sitios_id_seq OWNER TO postgres;

--
-- Name: sitios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sitios_id_seq OWNED BY public.sitios.id;


--
-- Name: telefonos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.telefonos (
    id integer NOT NULL,
    "idProveedorServicio" integer NOT NULL,
    imei text NOT NULL,
    abonado text NOT NULL,
    "solicitaTrafico" boolean,
    "solicitaImei" boolean,
    observacion text,
    "numeroTelefonico" text,
    "extraccionForense" boolean,
    enviar_custodia boolean,
    id_ubicacion integer,
    nue text
);


ALTER TABLE public.telefonos OWNER TO postgres;

--
-- Name: telefonos_causa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.telefonos_causa (
    id integer NOT NULL,
    "idTelefono" integer NOT NULL,
    "idCausa" integer NOT NULL
);


ALTER TABLE public.telefonos_causa OWNER TO postgres;

--
-- Name: telefonos_causa_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.telefonos_causa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.telefonos_causa_id_seq OWNER TO postgres;

--
-- Name: telefonos_causa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.telefonos_causa_id_seq OWNED BY public.telefonos_causa.id;


--
-- Name: telefonos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.telefonos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.telefonos_id_seq OWNER TO postgres;

--
-- Name: telefonos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.telefonos_id_seq OWNED BY public.telefonos.id;


--
-- Name: ubicacion_telefono; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ubicacion_telefono (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL
);


ALTER TABLE public.ubicacion_telefono OWNER TO postgres;

--
-- Name: ubicaciontelefono_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ubicaciontelefono_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ubicaciontelefono_id_seq OWNER TO postgres;

--
-- Name: ubicaciontelefono_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ubicaciontelefono_id_seq OWNED BY public.ubicacion_telefono.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    clerk_id text NOT NULL,
    email text NOT NULL,
    nombre text NOT NULL,
    cargo text,
    "rolId" integer DEFAULT 3 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: Abogado id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Abogado" ALTER COLUMN id SET DEFAULT nextval('public."Abogado_id_seq"'::regclass);


--
-- Name: Actividad id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Actividad" ALTER COLUMN id SET DEFAULT nextval('public."Actividad_id_seq"'::regclass);


--
-- Name: Analista id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Analista" ALTER COLUMN id SET DEFAULT nextval('public."Analista_id_seq"'::regclass);


--
-- Name: Area id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Area" ALTER COLUMN id SET DEFAULT nextval('public."Area_id_seq"'::regclass);


--
-- Name: Atvt id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Atvt" ALTER COLUMN id SET DEFAULT nextval('public." Atvt_id_seq"'::regclass);


--
-- Name: Causa id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Causa" ALTER COLUMN id SET DEFAULT nextval('public."Causa_id_seq"'::regclass);


--
-- Name: CausaOrganizacion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CausaOrganizacion" ALTER COLUMN id SET DEFAULT nextval('public."CausaOrganizacion_id_seq"'::regclass);


--
-- Name: CausasRelacionadas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CausasRelacionadas" ALTER COLUMN id SET DEFAULT nextval('public."CausasRelacionadas_id_seq"'::regclass);


--
-- Name: Cautelar id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cautelar" ALTER COLUMN id SET DEFAULT nextval('public."Cautelar_id_seq"'::regclass);


--
-- Name: Comuna id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comuna" ALTER COLUMN id SET DEFAULT nextval('public."Comuna_id_seq"'::regclass);


--
-- Name: Delito id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Delito" ALTER COLUMN id SET DEFAULT nextval('public."Delito_id_seq"'::regclass);


--
-- Name: Fiscal id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fiscal" ALTER COLUMN id SET DEFAULT nextval('public."Fiscal_id_seq"'::regclass);


--
-- Name: Foco id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Foco" ALTER COLUMN id SET DEFAULT nextval('public."Foco_id_seq"'::regclass);


--
-- Name: Fotografia id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fotografia" ALTER COLUMN id SET DEFAULT nextval('public."Fotografia_id_seq"'::regclass);


--
-- Name: Genograma id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Genograma" ALTER COLUMN id SET DEFAULT nextval('public."Genograma_id_seq"'::regclass);


--
-- Name: Imputado id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Imputado" ALTER COLUMN id SET DEFAULT nextval('public."Imputado_id_seq"'::regclass);


--
-- Name: MIHallazgos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MIHallazgos" ALTER COLUMN id SET DEFAULT nextval('public."MIHallazgos_id_seq"'::regclass);


--
-- Name: MedidaIntrusiva id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MedidaIntrusiva" ALTER COLUMN id SET DEFAULT nextval('public."MedidaIntrusiva_id_seq"'::regclass);


--
-- Name: MiembrosOrganizacion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MiembrosOrganizacion" ALTER COLUMN id SET DEFAULT nextval('public."MiembrosOrganizacion_id_seq"'::regclass);


--
-- Name: Nacionalidad id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Nacionalidad" ALTER COLUMN id SET DEFAULT nextval('public."Nacionalidad_id_seq"'::regclass);


--
-- Name: OrganizacionDelictual id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrganizacionDelictual" ALTER COLUMN id SET DEFAULT nextval('public."OrganizacionDelictual_id_seq"'::regclass);


--
-- Name: TimelineHito id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TimelineHito" ALTER COLUMN id SET DEFAULT nextval('public."TimelineHito_id_seq"'::regclass);


--
-- Name: TipoActividad id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TipoActividad" ALTER COLUMN id SET DEFAULT nextval('public."TipoActividad_id_seq"'::regclass);


--
-- Name: TipoMedida id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TipoMedida" ALTER COLUMN id SET DEFAULT nextval('public."TipoMedida_id_seq"'::regclass);


--
-- Name: TipoOrganizacion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TipoOrganizacion" ALTER COLUMN id SET DEFAULT nextval('public."TipoOrganizacion_id_seq"'::regclass);


--
-- Name: Tribunal id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tribunal" ALTER COLUMN id SET DEFAULT nextval('public."Tribunal_id_seq"'::regclass);


--
-- Name: UnidadPolicial id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnidadPolicial" ALTER COLUMN id SET DEFAULT nextval('public."UnidadPolicial_id_seq"'::regclass);


--
-- Name: Victima id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Victima" ALTER COLUMN id SET DEFAULT nextval('public."Victima_id_seq"'::regclass);


--
-- Name: categorias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias ALTER COLUMN id SET DEFAULT nextval('public.categorias_id_seq'::regclass);


--
-- Name: estados_causa id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estados_causa ALTER COLUMN id SET DEFAULT nextval('public.estados_causa_id_seq'::regclass);


--
-- Name: origenes_causa id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.origenes_causa ALTER COLUMN id SET DEFAULT nextval('public.origenes_causa_id_seq'::regclass);


--
-- Name: proveedores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedores ALTER COLUMN id SET DEFAULT nextval('public.proveedores_id_seq'::regclass);


--
-- Name: resoluciones_tribunal id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resoluciones_tribunal ALTER COLUMN id SET DEFAULT nextval('public.resoluciones_tribunal_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: sitios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sitios ALTER COLUMN id SET DEFAULT nextval('public.sitios_id_seq'::regclass);


--
-- Name: telefonos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.telefonos ALTER COLUMN id SET DEFAULT nextval('public.telefonos_id_seq'::regclass);


--
-- Name: telefonos_causa id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.telefonos_causa ALTER COLUMN id SET DEFAULT nextval('public.telefonos_causa_id_seq'::regclass);


--
-- Name: ubicacion_telefono id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ubicacion_telefono ALTER COLUMN id SET DEFAULT nextval('public.ubicaciontelefono_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: Abogado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Abogado" (id, nombre) FROM stdin;
2	Juan Pablo Gonzáles
3	Maria Veronica Castro
4	Patricio López
5	Equipo Jurídico
6	No Aplica
7	No Definido
1	Gisselle Marcela Barraza Gallardo
\.


--
-- Data for Name: Actividad; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Actividad" (id, causa_id, tipo_actividad_id, usuario_id, "fechaInicio", "fechaTermino", estado, "createdAt", "updatedAt", observacion, usuario_asignado_id, " glosa_cierre") FROM stdin;
3	14	3	2	2024-11-26 00:00:00	2024-11-26 00:00:00	terminado	2024-12-18 14:22:23.588	2024-12-18 14:22:23.588	reporte de monitoreo Nro. 4, el el cual contiene análisis de la información contenida en pendrive y microSD, asociados a NUE 6862827 	\N	\N
27	148	2	2	2025-04-28 00:00:00	2025-05-13 00:00:00	terminado	2025-05-13 17:02:48.207	2025-05-13 17:02:48.207	Extracción y analisis de datos teléfono,  INFORME DE  ADQUISICION FORENSE EFA13-2025 CAUSA ROL N° 2500582540-K I. Teléfono marca Samsung Galaxy A35 5G SM-A356E NUE 3113392.	\N	\N
29	86	2	2	2024-12-01 00:00:00	2024-12-30 00:00:00	terminado	2025-05-13 17:05:10.979	2025-05-13 17:05:10.979	Informe extraccion y analisis  2201180094-0 NUE 748738 Samsung SM-S926b Galaxy S24 Imputado Johan Perez	\N	\N
30	86	2	2	2025-03-01 00:00:00	2025-04-20 00:00:00	terminado	2025-05-13 17:06:06.336	2025-05-13 17:06:06.336	Informe Extraccion y analisis  EFA11-2025RUC 2201180094-0 Samsung SM-S911b Galaxy S23 PARANDA Imputado Patricia Aranda\n	\N	\N
5	104	5	2	2024-10-10 00:00:00	2024-10-16 00:00:00	terminado	2024-12-19 19:40:00	2024-12-19 19:40:00	Importado desde Teams: RUC 2401114980-0 OFICIO BANCO ESTADO  	\N	\N
6	34	1	2	2024-08-14 00:00:00	2024-09-09 00:00:00	terminado	2024-12-20 19:40:00	2024-12-20 19:40:00	Importado desde Teams: Analisis de trafico RUC 2400606321-3 el amanecer	\N	\N
8	31	5	2	2024-05-24 00:00:00	2024-05-24 00:00:00	terminado	2024-12-22 19:40:00	2024-12-22 19:40:00	Importado desde Teams: Informe Monitoreo Blue Rain RUC 2400478139-9	\N	\N
9	14	5	2	2024-11-27 00:00:00	2024-11-27 00:00:00	terminado	2024-12-23 19:40:00	2024-12-23 19:40:00	Importado desde Teams: CAUSA BLEST GANA RUC 2400175742-K REPORTE MONITOREO	\N	\N
12	32	1	2	2024-10-01 00:00:00	2024-10-04 00:00:00	terminado	2024-12-26 19:40:00	2024-12-26 19:40:00	Importado desde Teams: RUC 2400481752-0 Fourteen Years, generar informe georreferencial lugar de trabajo y SS	\N	\N
14	22	5	2	2024-08-16 00:00:00	2024-08-30 00:00:00	terminado	2024-12-28 19:40:00	2024-12-28 19:40:00	Importado desde Teams: RUC 2400362167-3 Diligencia forense y de analisis / femicidio intimo ocurrido en Ovalle el 31/03/2024	\N	\N
16	40	2	2	2024-07-23 00:00:00	2024-07-23 00:00:00	terminado	2024-12-30 19:40:00	2024-12-30 19:40:00	Importado desde Teams: EXTRACCION TELEFONO RUC 2400718295-K ZIG-ZAG	\N	\N
17	34	1	2	2024-06-10 00:00:00	2024-06-10 00:00:00	terminado	2024-12-31 19:40:00	2024-12-31 19:40:00	Importado desde Teams: RUC 2400606321-3 EL amanecer Georreferencia  Track 	\N	\N
18	31	5	2	2024-05-02 00:00:00	2024-05-02 00:00:00	terminado	2025-01-01 19:40:00	2025-01-01 19:40:00	Importado desde Teams: RUC:2400478139-9, Blue Rain Analisis de videos	\N	\N
20	31	2	2	2024-04-29 00:00:00	2024-04-29 00:00:00	terminado	2025-01-03 19:40:00	2025-01-03 19:40:00	Importado desde Teams: RUC:2400478139-9, Blue Rain, extracci�n Forense	\N	\N
21	32	5	2	2024-04-29 00:00:00	2024-04-29 00:00:00	terminado	2025-01-04 19:40:00	2025-01-04 19:40:00	Importado desde Teams: RUC 2400481752-0, Fourteen years informe tempranos de analisis	\N	\N
22	22	2	2	2024-04-11 00:00:00	2024-04-19 00:00:00	terminado	2025-01-05 19:40:00	2025-01-05 19:40:00	Importado desde Teams: RUC 2400362167-3, Ruleta Rusa, reporte de extraccian y analisis.	\N	\N
23	22	5	2	2024-04-18 00:00:00	2024-04-19 00:00:00	terminado	2025-01-06 19:40:00	2025-01-06 19:40:00	Importado desde Teams: RUC 2400362167-3, Ruleta Rusa, reporte analisis criminal	\N	\N
13	34	2	2	2024-05-28 00:00:00	2024-06-13 00:00:00	terminado	2024-12-27 19:40:00	2024-12-18 20:31:35.91	Importado desde Teams: RUC 2400606321-3 El Amanecer Extracción Teleofonica	\N	\N
11	25	2	2	2024-05-30 00:00:00	2024-07-23 00:00:00	terminado	2024-12-25 19:40:00	2024-12-18 21:54:40.521	Importado desde Teams: CAUSA RUC 2400401487-8 Limpiaparabrisas. Revision y análisis telefonos  	\N	\N
15	79	5	2	2024-08-19 00:00:00	2024-08-19 00:00:00	terminado	2024-12-29 19:40:00	2024-12-18 21:54:46.217	Importado desde Teams: Gestión de preservacion y registro META RUC 2400505286-2	\N	\N
10	82	5	2	2024-10-22 00:00:00	2024-10-22 00:00:00	terminado	2024-12-24 19:40:00	2024-12-18 22:17:26.276	Importado desde Teams: Palza Barnes RUC 2401233454-7, solictar trafico IMEI	\N	\N
34	82	1	2	2024-11-11 00:00:00	2024-11-11 00:00:00	terminado	2025-05-13 17:12:30.227	2025-05-13 17:12:30.227		\N	\N
35	123	2	2	2025-01-03 00:00:00	2025-04-03 00:00:00	terminado	2025-05-13 17:13:50.263	2025-05-13 17:13:50.263	I.\tTeléfono marca Samsung, Modelo SM -A022M\tGalaxy A02  NUE 7943919. propiedad de Gerald Alexis ÁGUILA MALDONADO	\N	\N
4	102	2	2	2024-12-16 00:00:00	2024-12-20 00:00:00	terminado	2024-12-18 19:40:28.419	2025-01-13 20:03:06.119	Extracción telefono imputado ALEXIS ANTONIO SIERRA CASTRILLON,  Device Name: Samsung SM-J610g DS Galaxy J6+ 2018 Duos TD-LTE	\N	\N
68	148	6	2	2025-05-16 00:00:00	2025-05-16 00:00:00	terminado	2025-05-16 16:07:24.609	2025-05-16 16:07:24.609	Solicita datos suscriptor a compañias telefonica por numeros 56945792108,56966112006,56928586886 	\N	\N
24	121	1	3	2025-01-30 00:00:00	2025-01-30 00:00:00	terminado	2025-01-30 19:08:49.613	2025-03-27 15:30:47.272	Georreferenciación de trafico telefónico dia 5 de enerop 2025.	\N	\N
26	123	2	2	2025-03-27 00:00:00	2025-04-03 00:00:00	terminado	2025-04-03 11:53:33.336	2025-04-03 11:53:33.336	REPORTE N° EFA102025.	\N	\N
19	57	1	2	2024-05-08 00:00:00	2024-05-08 00:00:00	terminado	2025-01-02 19:40:00	2025-04-21 14:20:11.522	Importado desde Teams: RUC 2000164821-8, GEOREFERENCIACION Y ANALISIS	\N	\N
69	18	6	2	2025-05-20 00:00:00	2025-05-20 00:00:00	terminado	2025-05-20 13:00:19.933	2025-05-20 13:00:19.933	Busqueda de Nro telefonico sujeto de interés.	\N	\N
70	150	8	2	2025-05-22 00:00:00	2025-05-22 00:00:00	terminado	2025-05-22 17:39:56.593	2025-05-22 17:39:56.593	Solicita información a compañias telefonicas sujetos de interés.	\N	\N
71	151	1	2	2025-04-22 00:00:00	2025-05-22 00:00:00	terminado	2025-05-22 17:44:30.284	2025-05-22 17:44:30.284	Se realiza informe georreferencial de monitoreo telemático causa RUC   2010048427-8 a solicitud de Fiscal Nicolas Shertzer 	\N	\N
7	40	2	2	2024-07-18 00:00:00	2024-07-18 00:00:00	terminado	2024-12-21 19:40:00	2025-05-22 23:01:02.096	Importado desde Teams: EXTRACCION FORENSE RUC 2400718295-K	\N	\N
72	152	2	2	2025-05-29 00:00:00	2025-06-20 00:00:00	en_proceso	2025-06-02 20:47:04.536	2025-06-02 21:14:18.063	8 teleofnos para análisis	\N	\N
78	147	3	3	2025-05-19 00:00:00	2025-06-16 00:00:00	en_proceso	2025-06-10 15:03:42.525	2025-06-10 15:03:42.525	Reporte con antecedentes relevantes de imputado SASHA MENDIETA	3	\N
77	150	2	1	2025-06-09 00:00:00	2025-06-13 00:00:00	en_proceso	2025-06-09 16:45:39.244	2025-06-09 16:46:22.414	Realizar extracción y análisis teléfono víctima	2	\N
81	85	6	3	2025-02-21 00:00:00	2025-03-24 00:00:00	terminado	2025-06-10 15:31:09.399	2025-06-10 15:31:09.399	Set fotográfico demostrativo de la cronología de los hechos de la causa 	3	\N
82	146	6	3	2025-04-25 00:00:00	2025-05-25 00:00:00	en_proceso	2025-06-10 15:33:46.969	2025-06-10 15:33:46.969	Revisión teléfonos celulares de la causa, revisión extracción forense, diligencias de teléfonos no extraídos 	3	\N
76	40	6	2	2025-06-06 00:00:00	2025-06-19 00:00:00	en_proceso	2025-06-06 01:34:49.256	2025-06-10 22:11:08.722	Generar linea de tiempo de eventos importanntes 	2	\N
32	123	2	2	2025-04-25 00:00:00	2025-05-13 00:00:00	terminado	2025-05-13 17:09:08.981	2025-06-12 15:16:57.61	Informe  telefono Jose Abreu	\N	\N
75	125	2	1	2025-06-05 00:00:00	2025-06-05 00:00:00	inicio	2025-06-05 23:19:18.29	2025-06-17 17:07:32.519	Actividad de prueba para Barbara León.	3	\N
33	103	1	2	2025-05-01 00:00:00	2025-05-13 00:00:00	terminado	2025-05-13 17:09:46.116	2025-06-19 22:27:25.286	Informe Georrefenrenciación de trafico telefono victma	\N	Informe georreferenciación tráfico telefónico N° GA 10-2025
73	40	5	2	2025-05-29 00:00:00	2025-06-10 00:00:00	terminado	2025-06-04 16:00:04.56	2025-07-11 13:21:59.527	Se solicitó reporte  de análisis de videos de cámaras de seguridad, esta listo el de botillería y  fue entregado al Fiscal	\N	Se solicitó reporte de análisis de videos de cámaras de seguridad, esta listo el de botillería y fue entregado al Fiscal
80	85	3	3	2025-04-20 00:00:00	2025-06-20 00:00:00	en_proceso	2025-06-10 15:29:33.753	2025-07-23 16:27:14.589	Reporte de la causa	3	\N
83	6	2	3	2025-04-05 00:00:00	2025-05-05 00:00:00	en_proceso	2025-06-10 15:44:10.458	2025-06-10 15:44:10.458	Revisión y análisis de extracción forense realizada. Elaboración de un nuevo reporte de análisis de extracción forense	3	\N
84	6	6	3	2025-04-02 00:00:00	2025-05-05 00:00:00	inicio	2025-06-10 15:46:20.582	2025-06-10 15:46:20.582	Revisión de causa para complementación de informes ya elaborados. 	3	\N
85	36	2	3	2025-01-07 00:00:00	2025-01-22 00:00:00	terminado	2025-06-10 15:48:08.717	2025-06-10 15:48:08.717	Informe EFA de celular imputado Álvaro Alejandro Castillo Araya	3	\N
86	111	6	3	2024-12-29 00:00:00	2025-01-10 00:00:00	terminado	2025-06-10 15:49:46.888	2025-06-10 15:49:46.888	Revisión teléfonos imputados	3	\N
87	13	22	3	2025-02-10 00:00:00	2025-02-10 00:00:00	terminado	2025-06-10 15:51:49.016	2025-06-10 15:51:49.016	Informe Análisis pendiente	3	\N
88	46	1	3	2024-12-12 00:00:00	2024-12-30 00:00:00	terminado	2025-06-10 15:55:27.3	2025-06-10 15:55:27.3	Informe Georreferenciación teléfono móvil de imputado.	3	\N
91	125	2	3	2025-02-25 00:00:00	2025-03-17 00:00:00	terminado	2025-06-10 16:02:58.496	2025-06-10 16:02:58.496	Informe EFA teléfono testigo Pricilla Cepeda Gatica	3	\N
92	125	2	3	2025-02-27 00:00:00	2025-04-10 00:00:00	terminado	2025-06-10 16:03:48.11	2025-06-10 16:03:48.11	Informe EFA celular testigo Cristóbal Bravo	3	\N
93	151	6	3	2025-04-10 00:00:00	2025-04-15 00:00:00	terminado	2025-06-10 16:06:01.808	2025-06-10 16:06:01.808	Informe sujetos interés en causa de Los Vilos 	3	\N
94	151	2	3	2025-04-30 00:00:00	2025-06-30 00:00:00	en_proceso	2025-06-10 16:07:49.086	2025-06-10 16:07:49.086	Informe EFA de 20 teléfonos móviles para causa de drogas y armas a cargo de Fiscal Freddy Salinas	3	\N
95	6	6	3	2025-03-04 00:00:00	2025-06-10 00:00:00	en_proceso	2025-06-10 16:09:45.786	2025-06-10 16:09:45.786	Revisión causa, infopol para cronología de los hechos	3	\N
96	6	6	3	2025-03-04 00:00:00	2025-06-10 00:00:00	inicio	2025-06-10 16:11:13.571	2025-06-10 16:11:13.571	Revisión y ampliación del informe de trafico de llamados teléfono victima Cristian Flores Tapia	3	\N
97	6	14	3	2025-03-15 00:00:00	2025-06-10 00:00:00	inicio	2025-06-10 16:13:00.044	2025-06-10 16:13:00.044	Reportes sujetos de interés de la causa (René, Efrain Pedraza, Majinnbu, Tingui)	3	\N
98	34	8	6	2025-06-10 00:00:00	2025-06-10 00:00:00	terminado	2025-06-10 16:54:57.286	2025-06-10 16:54:57.286	Envío "PIDE CUENTA" a LACRIM sección balística, pericias celular Samsung	6	\N
99	110	8	6	2025-06-10 00:00:00	2025-06-10 00:00:00	terminado	2025-06-10 19:44:56.141	2025-06-10 19:44:56.141	Envío de IP a la BH, tomar declaración de víctima y testigos. Además, identificar imputados. 	6	\N
100	150	8	6	2025-06-10 00:00:00	2025-06-17 00:00:00	en_proceso	2025-06-10 20:14:17.177	2025-06-10 20:14:17.177	Escrito para solicitar tráfico de llamadas del imputado David Mazzolotti	6	\N
101	150	2	2	2025-06-10 00:00:00	2025-06-20 00:00:00	en_proceso	2025-06-10 22:10:07.989	2025-06-10 22:10:07.989	Extraccion y análisis telefono José Castillo (Testigo)	2	\N
104	63	6	2	2025-06-11 00:00:00	2025-06-20 00:00:00	inicio	2025-06-11 19:44:03.917	2025-06-11 19:44:03.917	Revisar RUN que se le habrían podido haber asignado al imputado Medina Ladera.	2	\N
106	120	8	6	2025-06-11 00:00:00	2025-06-11 00:00:00	terminado	2025-06-11 20:53:00.791	2025-06-11 20:53:00.791	Envío por OJV de escrito solicitando audiencia de aumento de plazo de investigación	6	\N
107	120	8	6	2025-06-11 00:00:00	2025-06-11 00:00:00	terminado	2025-06-11 21:40:38.628	2025-06-11 21:40:38.628	Envío "pide cuenta" de la IP del 15/05/25 dirigida a la BH.	6	\N
108	120	8	6	2025-06-12 00:00:00	2025-06-12 00:00:00	terminado	2025-06-12 15:35:12.03	2025-06-12 15:35:12.03	Envío correo a la BH con la resolución que ordena la detención de ambos imputados y la entrada y registro a su domicilio.	6	\N
109	150	8	6	2025-06-12 00:00:00	2025-06-12 00:00:00	terminado	2025-06-12 17:01:37.517	2025-06-12 17:01:37.517	Envío "cumple lo ordenado" por el escrito del tráfico de llamadas del imputado.	6	\N
105	63	5	2	2025-06-11 00:00:00	2025-06-26 00:00:00	en_proceso	2025-06-11 19:47:06.486	2025-06-17 19:27:36.205	Solicitud de trafico IMEI y cruzar resultados con los tráficos telefónicos de la victima	2	\N
115	63	2	4	2025-05-07 00:00:00	2025-06-16 00:00:00	terminado	2025-06-16 15:49:52.526	2025-06-16 15:50:30.904	Análisis extracción conversaciones de Whatssap tetsigo Enrique araya Flores (gásfiter jefe José Medina)	4	Análisis extracción conversaciones de Whatssap tetsigo Enrique araya Flores (gásfiter jefe José Medina)
116	158	1	4	2025-06-16 00:00:00	2025-06-16 00:00:00	terminado	2025-06-16 18:09:51.065	2025-06-16 18:10:24.139	Georreferenciación imputado día de los hechos	4	Georreferenciación con VB y subido a FCD
113	63	6	4	2025-06-13 00:00:00	2025-06-13 00:00:00	terminado	2025-06-13 18:42:16.298	2025-06-16 18:11:44.09	Depuración causa María José Zambra (resumen diligencias en 6 años)	4	\N
117	151	6	4	2025-04-21 00:00:00	2025-04-21 00:00:00	terminado	2025-06-16 18:11:36.259	2025-06-16 18:12:26.532	Reporte de análisis causas de robo con violencia con mismo modus operandi  realizados el 13 de abril 2025 	4	\N
118	158	6	4	2025-04-15 00:00:00	2025-04-16 00:00:00	terminado	2025-06-16 18:14:21.969	2025-06-16 18:14:43.052	Cuadro gráfico demostrativo día delito disparos injustificados en la vía pública 	4	realizado con VB de fiscal y subido a FCD
127	18	9	4	2025-05-19 00:00:00	2025-06-16 00:00:00	terminado	2025-06-16 18:34:00.622	2025-06-16 19:14:26.767	análisis cartolas bancarias 	4	\N
122	54	6	4	2025-05-19 00:00:00	2025-05-26 00:00:00	terminado	2025-06-16 18:25:36.506	2025-06-16 19:14:36.695	Análisis contexto sociocultural con perspectiva de género al historial penal de víctima Jamie 	4	\N
123	151	9	4	2025-05-19 00:00:00	2025-06-27 00:00:00	terminado	2025-06-16 18:26:39.894	2025-06-16 19:14:39.892	informe patrimonial microtráfico parte alta de 3 intervinientes de un clan familiar en microtráfico en la parte alta 2500127653-3	4	\N
125	151	6	4	2025-05-19 00:00:00	2025-05-19 00:00:00	terminado	2025-06-16 18:31:53.401	2025-06-16 19:14:44.077	indagacion en cuentas bancarias vigentes y no vigentes de sujeto de interés en causa robos brinks 2500598285-8	4	\N
126	18	6	4	2025-05-19 00:00:00	2025-05-19 00:00:00	terminado	2025-06-16 18:32:56.099	2025-06-16 19:14:50.596	análisis videos sujeto de interés 	4	\N
120	54	1	4	2025-05-15 00:00:00	2025-05-16 00:00:00	terminado	2025-06-16 18:17:14.156	2025-06-16 19:14:55.281	Georreferenciación víctima causa	4	\N
121	54	6	4	2025-05-15 00:00:00	2025-05-23 00:00:00	terminado	2025-06-16 18:24:16.644	2025-06-16 19:14:58.145	Análisis comparativo de todos los informes de pericias de los intervinientes 	4	\N
131	151	22	4	2025-04-01 00:00:00	2025-04-05 00:00:00	terminado	2025-06-16 18:46:04.046	2025-06-16 19:15:21.248	REPORTE 2 ELQUI DEL 2 AL 10 ABRIL PROVINCIA DEL ELQUI	4	\N
128	132	6	4	2025-03-24 00:00:00	2025-03-25 00:00:00	terminado	2025-06-16 18:36:17.459	2025-06-16 19:15:28.206	análisis videos causa y subidos a FCD	4	\N
129	9	14	4	2025-03-24 00:00:00	2025-03-24 00:00:00	terminado	2025-06-16 18:41:38.721	2025-06-16 19:15:30.752	Informe entrevista hermana cazuela 	4	\N
130	151	22	4	2025-03-15 00:00:00	2025-03-22 00:00:00	terminado	2025-06-16 18:44:39.922	2025-06-16 19:15:33.102	REPORTE 1 CRIMINALIDAD MARZO PROVINCIA DEL ELQUI	4	\N
112	155	6	2	2025-06-13 00:00:00	2025-06-13 00:00:00	terminado	2025-06-13 18:24:10.556	2025-06-16 20:56:32.141	Geoposicionamiento de punto de interes para la investigación	2	Informe enviado
89	125	1	3	2025-05-15 00:00:00	2025-06-15 00:00:00	en_proceso	2025-06-10 15:58:47.562	2025-06-17 17:07:38.493	Elaboración informes trafico voz/datos de 06 números telefónicos de sujetos de interés de la causa 	3	\N
138	151	22	4	2025-05-29 00:00:00	2025-05-31 00:00:00	terminado	2025-06-16 18:51:58.78	2025-06-16 19:14:14.407	REPORTE 9 DE CRIMINALIDAD DEL 23 AL 29 DE MAYO PROVINCIA DEL ELQUI	4	\N
139	151	20	4	2025-05-25 00:00:00	2025-05-29 00:00:00	terminado	2025-06-16 18:53:45.324	2025-06-16 19:14:19.514	Informe cierre foco "calles peligrosas"	4	\N
114	156	2	2	2025-05-20 00:00:00	2025-06-16 00:00:00	terminado	2025-06-16 13:02:20.86	2025-07-03 21:43:24.577		2	Extracción realizada, información decodificada se procede a análisis.
102	152	2	2	2025-06-10 00:00:00	2025-06-26 00:00:00	terminado	2025-06-10 22:10:50.778	2025-09-01 13:49:15.914	Extraccion Telefono Galaxy A21s SM-A217M\nNUE 776866 (imputado)	2	Se realiza extraccion forense e informe de análisis.
137	151	22	4	2025-05-22 00:00:00	2025-05-24 00:00:00	terminado	2025-06-16 18:51:24.114	2025-06-16 19:14:21.881	REPORTE 8 CRIMINALIDAD PROVINCIA ELQUI del 16 al 22 MAYO	4	\N
136	151	22	4	2025-05-15 00:00:00	2025-05-18 00:00:00	terminado	2025-06-16 18:50:51.393	2025-06-16 19:15:05.05	REPORTE 7 CRIMINALIDAD DEL 9 AL 15 DE MAYO PROVINCIA DEL ELQUI	4	\N
134	151	22	4	2025-04-25 00:00:00	2025-04-28 00:00:00	terminado	2025-06-16 18:48:12.864	2025-06-16 19:15:16.922	REPORTE 5 CRIMINALIDAD  DEL 25 DE ABRIL AL 30 DE ABRIL	4	\N
132	151	22	4	2025-04-10 00:00:00	2025-04-14 00:00:00	terminado	2025-06-16 18:46:52.69	2025-06-16 19:15:19.208	REPORTE 3 CRIMINALIDAD ELQUI 3 DEL 10 ABRIL AL 16 DE ABRIL 	4	\N
133	151	22	4	2025-04-01 00:00:00	2025-04-06 00:00:00	terminado	2025-06-16 18:47:25.63	2025-06-16 19:15:23.897	REPORTE 4 DEL 17 AL 23 ABRIL	4	\N
146	18	6	4	2025-05-22 00:00:00	2025-06-16 00:00:00	inicio	2025-06-16 19:04:17.844	2025-06-16 19:04:17.844	análisis ip	4	\N
150	49	2	4	2025-06-16 00:00:00	2025-06-16 00:00:00	inicio	2025-06-16 19:06:57.254	2025-06-16 19:06:57.254	análisis extracción de teléfonos imputado	4	\N
148	151	6	4	2025-05-29 00:00:00	2025-06-16 00:00:00	terminado	2025-06-16 19:05:40.607	2025-06-16 19:13:48.496	maqueta boletín semestral	4	\N
119	151	9	4	2025-03-31 00:00:00	2025-04-07 00:00:00	terminado	2025-06-16 18:15:56.676	2025-06-16 19:13:52.044	Informe patrimonial de 3 intervinientes en causa de microtráfico del oficio 50 del OS7	4	\N
152	159	5	4	2025-06-13 00:00:00	2025-06-16 00:00:00	terminado	2025-06-16 19:12:02.647	2025-06-16 19:13:56.338	Reporte de análisis intervinientes	4	\N
175	17	2	3	2024-11-14 00:00:00	2024-12-23 00:00:00	terminado	2025-06-17 17:43:03.192	2025-06-17 17:43:03.192	Extraccion y analisis Teléfono imputado Jonathan Sanders	3	Se obtiene información respecto de armas y drogas en dispositivo telefónico. Ubicación de telefono relacionado a los hechos 
140	151	20	4	2025-06-10 00:00:00	2025-06-10 00:00:00	terminado	2025-06-16 18:54:26.042	2025-06-16 19:14:02.622	Informe inicial buenos muchachos 2025	4	\N
149	49	6	4	2025-06-10 00:00:00	2025-06-10 00:00:00	terminado	2025-06-16 19:06:23.929	2025-06-16 19:14:06.918	análisis videos y edición	4	\N
153	132	1	4	2025-06-06 00:00:00	2025-06-08 00:00:00	terminado	2025-06-16 19:13:08.191	2025-06-16 19:14:10.908	informe geo testigo 	4	\N
141	28	6	4	2025-05-26 00:00:00	2025-05-28 00:00:00	terminado	2025-06-16 18:55:17.1	2025-06-16 19:14:16.979	Cuadro gráfico demostrativo Cámaras día de los hechos homicidio	4	\N
124	63	6	4	2025-05-20 00:00:00	2025-05-20 00:00:00	terminado	2025-06-16 18:30:24.172	2025-06-16 19:14:24.584	reporte de análisis sujeto de interés Cristian Silva Cavieres en causa María José Zambra	4	\N
143	72	6	4	2025-05-16 00:00:00	2025-05-16 00:00:00	terminado	2025-06-16 18:58:29.896	2025-06-16 19:14:52.726	análisis y edición de videos homicidio almagro	4	\N
135	151	22	4	2025-05-08 00:00:00	2025-05-12 00:00:00	terminado	2025-06-16 18:49:20.778	2025-06-16 19:15:07.707	REPORTE 6 CRIMINALIDAD DEL 1 AL 8 DE MAYO 2025 PROVINCIA ELQUI	4	\N
145	151	6	4	2025-05-06 00:00:00	2025-05-08 00:00:00	terminado	2025-06-16 19:02:20.47	2025-06-16 19:15:10.656	Investigación y búsqueda de antecedentes relevantes, junto a reporte de indagaciones en causa de armas con fiscal freddy salinas	4	\N
144	63	6	4	2025-04-25 00:00:00	2025-04-25 00:00:00	terminado	2025-06-16 19:00:54.567	2025-06-16 19:15:14.474	preservación de cuenta correo catana2212@gmail.com de jose medina ladera	4	\N
156	86	2	2	2025-06-16 00:00:00	2025-06-16 00:00:00	terminado	2025-06-16 23:35:33.657	2025-06-16 23:35:58.636	Informe Tyare Muñoz	2	Informe entregado
155	86	2	2	2025-06-16 00:00:00	2025-06-16 00:00:00	terminado	2025-06-16 23:34:32.201	2025-06-16 23:36:10.043	preinforme Sandra Carolina Gomez	2	Informe entregado
154	86	2	2	2025-06-16 00:00:00	2025-06-16 00:00:00	terminado	2025-06-16 23:33:18.881	2025-06-16 23:36:26.128	Informe inputado Juan Pizarro	2	Informe entregado
31	86	2	2	2025-05-13 00:00:00	2025-05-13 00:00:00	terminado	2025-05-13 17:06:50.247	2025-06-16 23:36:35.614	  Informe Extraccion y analisis  EFA14-2025RUC 2201180094-0 iPhone NUE 7767912 Imputado Sandra	\N	\N
157	125	2	2	2025-06-16 00:00:00	2025-06-16 00:00:00	en_proceso	2025-06-16 23:38:37.582	2025-06-16 23:38:58.372	extraccion telefono víctima	2	\N
159	150	2	2	2025-06-16 00:00:00	2025-07-03 00:00:00	inicio	2025-06-16 23:43:18.85	2025-06-16 23:43:18.85	Extración telefonn jose Castillo	2	\N
161	152	2	2	2025-06-16 00:00:00	2025-07-03 00:00:00	inicio	2025-06-16 23:45:58.13	2025-06-16 23:45:58.13	extracion NUE 5236507	2	\N
162	151	2	2	2025-06-16 00:00:00	2025-07-31 00:00:00	en_proceso	2025-06-16 23:47:14.316	2025-06-16 23:47:14.316	extracción telefono imputado abuso sexual 2401331626-7	2	\N
163	151	2	2	2025-06-16 00:00:00	2025-06-16 00:00:00	en_proceso	2025-06-16 23:49:27.556	2025-06-16 23:49:27.556	Extraccion telefono RUC 2500577188-1	2	\N
166	158	2	2	2025-05-17 00:00:00	2025-06-17 00:00:00	terminado	2025-06-17 00:02:52.646	2025-06-17 00:03:53.459	Extracción y decodificación teléfono imputado	2	Listo para retiro de OS7, a la espera de respuesta de fiscal si requiere analisis
176	33	1	3	2024-10-25 00:00:00	2025-06-05 00:00:00	terminado	2025-06-17 18:01:14.28	2025-06-17 18:01:14.28	Informe de trafico de voz/datos y Georreferenciación de número telefónico de sujeto interes 9-5421 6537	3	Ubicación geográfica, desplazamiento, de numero de teléfono móvil de sujeto de interés antes durante y después de los hechos 
142	151	6	4	2025-06-13 00:00:00	2025-06-13 00:00:00	terminado	2025-06-16 18:57:31.531	2025-06-17 13:57:57.707	análisis y edición de videos cámaras de seguridad causa robos brinks con fiscal freddy salinas	4	Informado a Fiscal y archivos a disposición de oficial de caso.
170	63	5	2	2025-04-19 00:00:00	2025-04-21 00:00:00	terminado	2025-06-17 14:07:24.177	2025-06-17 14:10:39.038		2	Reporte de análisis puntos de interés y cruce de IMEI
171	82	5	2	2024-10-20 00:00:00	2024-10-25 00:00:00	terminado	2025-06-17 15:03:34.407	2025-06-17 15:03:34.407	análisis y reporte de videos de cámaras de seguridad	2	análisis y reporte de videos de cámaras de seguridad entregado a Fiscal Freddy Salinas
173	151	2	2	2025-02-13 00:00:00	2025-03-13 00:00:00	en_proceso	2025-06-17 15:37:05.431	2025-06-17 15:37:05.431	Extraccion y análisis información dos telefonos (JUANITO)NUE 78025550 RUC 2500167086-K	2	\N
174	18	6	2	2025-04-15 00:00:00	2025-04-15 00:00:00	terminado	2025-06-17 15:43:56.877	2025-06-17 15:43:56.877	Realizar Análisis de rrss de sujeto de interés	2	Se entrega información a fiscal de Análisis de rrss de sujeto de interés
178	33	1	3	2024-10-25 00:00:00	2025-06-05 00:00:00	terminado	2025-06-17 19:03:30.685	2025-06-17 19:03:30.685	Informe tráfico de voz/datos numero telefonico de sujeto de interes (testigo) Matias Aracena Castro, 9-3639 3821	3	Ubicación Geográfica, desplazamiento número telefónico de sujeto de interés (testigo) Matias Aracena Castro, según declaracion
167	151	6	2	2025-06-17 00:00:00	2025-06-17 00:00:00	terminado	2025-06-17 00:05:39.299	2025-06-18 18:31:22.825	compilado sistema de registro	2	Compilada ver 2. OK
151	154	9	4	2025-06-16 00:00:00	2025-06-16 00:00:00	terminado	2025-06-16 19:07:39.97	2025-06-27 18:18:20.681	reporte patrimonial victima	4	Entregado a equipo y fiscal. Subido a FCD
172	151	2	2	2025-03-12 00:00:00	2025-03-12 00:00:00	terminado	2025-06-17 15:36:24.882	2025-07-11 13:16:50.633	Extraccion y análisis información telefono diputada NUE 7802552 RUC 2500167086-K	2	EXtracción realizada. Análisis sera realizado por Roberto Vergara B. Se crea Disco duro  NUE 5236508
165	151	1	2	2025-04-16 00:00:00	2025-05-22 00:00:00	terminado	2025-06-16 23:57:41.35	2025-07-11 13:20:41.919	informe georreferenciación cuasa RUC 2010048427-8	2	Informe entregado A Fiscal
147	52	19	4	2025-05-29 00:00:00	2025-06-16 00:00:00	terminado	2025-06-16 19:05:06.544	2025-07-14 13:12:32.274	Depuración causa y categorización de informes 	4	Enviada a fiscal
158	8	2	2	2025-06-16 00:00:00	2025-06-16 00:00:00	terminado	2025-06-16 23:41:54.253	2025-07-18 19:52:28.019	Extraccion telefono imputado en causa 2500734232-6	2	Se realiza extracción y se envia reporte a Fiscal Eduadro Yañez.
164	151	2	2	2025-05-15 00:00:00	2025-05-29 00:00:00	inicio	2025-06-16 23:50:35.681	2025-08-24 00:48:23.902	extraccion telefono ruc 2401279144-1 vicuña	2	\N
177	33	1	3	2024-10-25 00:00:00	2025-06-05 00:00:00	terminado	2025-06-17 18:03:47.598	2025-06-17 19:04:18.045	Informe de trafico de voz/datos de numero telefónico de sujeto de interés (testigo) Matias Aracena Castro, 9-7365 3215	3	Ubicación geográfica de movil de sujeto de interés (testigo) Matias Aracena Castro, antes, durante y despues de los hechos.
179	6	10	8	2025-06-17 00:00:00	2025-06-17 00:00:00	terminado	2025-06-17 19:18:44.276	2025-06-17 19:20:44.638	Realizar contacto con víctima 108i, señora Juana Tapia	8	Se comunica con víctima 108i, exitosamente.
181	161	8	6	2025-06-17 00:00:00	2025-06-17 00:00:00	terminado	2025-06-17 20:14:24.16	2025-06-17 20:14:24.16	Solicitud enviada: Nueva Solicitud UAJ # 764	6	Envío solicitud a UAJ para autorizar Sobreseimiento Definitivo.
182	127	1	3	2025-03-13 00:00:00	2025-06-20 00:00:00	en_proceso	2025-06-17 20:14:30.121	2025-06-17 20:14:30.121	Informe tráfico voz/datos del número telefónico de la víctima Jorge Maximiliano Dominguez Vargas 9-7183 6162	3	\N
183	151	22	3	2025-01-09 00:00:00	2025-01-24 00:00:00	terminado	2025-06-17 20:27:44.375	2025-06-17 20:27:44.375	Informe con datos para abrir causa relacionada a Lavado de dinero, comuna de Canela, a solicitud de Diputado de la República.	3	Obtención datos patrimoniales de Clan Familiar. Matrimonio, 03 hijos, 03 convivientes, respecto de 03 sociedades compuestas por los 03 hermanos.
186	125	1	3	2025-05-20 00:00:00	2025-06-16 00:00:00	terminado	2025-06-17 21:04:03.705	2025-06-17 21:04:03.705	Informe GA trafico voz/datos del número telefónico del imputado Nicolás Tripainao 9 5804 7405 	3	Información respecto tráfico telefónico y datos, localización geográfica de antenas respecto del número Telefónico del imputado Nicolás Tripainao
187	34	2	2	2025-06-17 00:00:00	2025-06-17 00:00:00	en_proceso	2025-06-17 23:41:24.247	2025-06-17 23:41:24.247	Extracciones de SEBASTIÁN IGNACIO GODOY VILCHES\n	2	\N
169	40	5	2	2025-05-25 00:00:00	2025-06-02 00:00:00	terminado	2025-06-17 13:57:16.97	2025-06-18 18:31:55.406	Informe cuadro grafico demostrativo cámaras de seguridad botillería.	2	Reporte enviado a Fiscal Eduardo Yañez
190	151	20	3	2025-03-09 00:00:00	2025-03-26 00:00:00	terminado	2025-06-18 20:34:17.083	2025-06-18 20:34:17.083	REPORTE DE LEVANTAMIENTO DE FOCO MOTOCHORROS 2025	3	Reporte con elaboración de antecedentes para causas relacionadas al modus operandi Motochorros 
191	151	20	3	2025-03-19 00:00:00	2025-04-03 00:00:00	terminado	2025-06-18 20:38:25.133	2025-06-18 20:38:25.133	Reporte levantamiento Foco Novela Turca 2025	3	Reporte con antecedentes relevantes para causas relacionadas a 02 bandas asociadas a los Departamentos Rojos en Las Compañías 
192	151	20	3	2025-02-20 00:00:00	2025-03-10 00:00:00	terminado	2025-06-18 20:40:59.104	2025-06-18 20:40:59.104	Reporte de cierre de Foco TdA 2024	3	Reporte con descripción de resultados, de actividades, datos obtenidos respecto del cierre del Foco TdA 2024
193	146	22	3	2025-06-01 00:00:00	2025-06-30 00:00:00	en_proceso	2025-06-18 20:50:42.11	2025-06-18 20:50:42.11	Oficio solicitado por UCIEX respecto de causa Ana Maria Pizarro, para la solicitud a META por plataforma Messenger. Elaboración, coordinación y correcciones, con UCIEX RM y región de coquimbo.	3	\N
194	151	22	5	2025-06-17 00:00:00	2025-06-18 00:00:00	terminado	2025-06-18 23:08:29.007	2025-06-18 23:08:29.007	Informe de avance de los compromisos adquiridos por UPCE en el marco de la visita del mes de enero 	5	Enviado a Carmen Gloria en su calidad de DER (s) 
195	151	22	5	2025-06-19 00:00:00	2025-06-19 00:00:00	terminado	2025-06-19 00:33:16.131	2025-06-19 00:33:16.131	Reporte carga de trabajo ATVT	5	Reporte enviado
196	162	5	2	2025-06-19 00:00:00	2025-06-19 00:00:00	terminado	2025-06-19 02:11:16.113	2025-06-19 02:11:16.113	Realizar análisis de causas  mismo modus operandi	2	Reporte de análisis enviado al fiscal Yañez, se propone traer 4 causas correspondiente a serie de robos, mismo sujeto
198	110	2	2	2025-06-16 00:00:00	2025-06-19 00:00:00	terminado	2025-06-19 16:07:11.196	2025-06-19 16:07:11.196	Solicita extracción forense, telefono imputada  Gipsy Arqueros	2	Se realizan intentos fallidos de extracción forense, se informa a fiscal, se realizará nueva prueba a la llegada de XRY en Julio.
199	151	2	2	2025-06-03 00:00:00	2025-06-26 00:00:00	en_proceso	2025-06-19 17:11:40.864	2025-06-19 17:11:40.864	Solicita Extracción de dos telefonos celulares NUE 7004884 7004885  iphone y Honor	2	\N
103	148	5	2	2025-06-11 00:00:00	2025-06-13 00:00:00	en_proceso	2025-06-11 16:08:50.068	2025-06-23 22:32:54.051	Reporte de análisis par asujeto de intereés MARCOS EZEQUIEL CASTILLO ESCUDERO 	2	\N
203	150	8	6	2025-06-24 00:00:00	2025-06-24 00:00:00	terminado	2025-06-24 14:14:03.266	2025-06-24 14:14:03.266		6	Envío correo solicitando la ficha clínica de la víctima Manuel Campusano
205	159	5	4	2025-06-23 00:00:00	2025-06-24 00:00:00	terminado	2025-06-24 17:02:12.087	2025-06-24 17:02:12.087		4	Enviado a equipo y fiscal, subido a FCD
206	151	22	4	2025-05-29 00:00:00	2025-06-05 00:00:00	terminado	2025-06-24 17:06:34.213	2025-06-24 17:06:34.213	Reporte de criminalidad del 22 al 29 de mayo provincia elqui	4	Enviado a jefaturas 
207	158	23	4	2025-05-18 00:00:00	2025-06-25 00:00:00	en_proceso	2025-06-24 17:08:50.262	2025-06-24 17:08:50.262	Informe de evidencia digital teléfono imputado con respecto a cosas de interés y mensajes y llamadas relacionadas al 30/03/25	4	\N
204	157	8	6	2025-06-24 00:00:00	2025-06-24 00:00:00	terminado	2025-06-24 15:03:18.28	2025-06-28 01:38:47.043	Redactar OD para el imputado BASTIÁN VERGARA TORRES ok	6	Envío OD para revisión al fiscal NZB
282	185	25	3	2025-08-05 00:00:00	2025-09-04 00:00:00	inicio	2025-08-05 15:05:03.75	2025-08-22 13:37:33.953	Realizar EF y Reporte de análisis de 03 teléfonos de los 03 imputados	3	\N
202	163	24	2	2025-06-23 00:00:00	2025-06-23 00:00:00	terminado	2025-06-24 12:24:33.524	2025-06-28 01:50:14.028	Informe temprano de análisis "Villa el Tangue" queda link	2	https://minpublicocl.sharepoint.com/:w:/s/ECOH-SACFICoquimbo/EUza70l1ucJBrljN7quq67QBtRYFQmEOwBVuu2lgBvT4lQ?e=a6acmz
197	133	1	2	2025-06-19 00:00:00	2025-07-10 00:00:00	en_proceso	2025-06-19 15:22:50.703	2025-06-30 16:36:56.791	Realizar informe de geoposicionamiento trafico telefonico N° +569 29874234 	2	\N
185	125	22	3	2025-06-16 00:00:00	2025-06-23 00:00:00	terminado	2025-06-17 20:58:31.459	2025-08-13 16:50:52.034	Reporte gráfico de secuencia cronológica de imágenes de camaras de seguridad, antes, durante y después del homicidio en sector Skatepark, Coquimbo	3	Presentación cronológica de la madrugada del dia de los hechos, desde diferentes cámaras de seguridad recopiladas en la investigación.  Imagenes, georreferenciación de hechos relacionados a la causa.
201	133	5	2	2025-06-23 00:00:00	2025-06-27 00:00:00	terminado	2025-06-23 22:45:36.811	2025-09-01 13:50:13.019	5.- celulares incautados:\n                - tenemos el de álvaro castillo en el ruc de origen ok y esta en poder del fiscal cvm\n                - el de josé abreu incautado al ser detenido. (pide autorización judicial tráfico de llamadas, a partir del hecho 1 hasta después del hecho 2 de él o los números que traficaban en ese teléfono) en poder de rafael el celular, con escrito presentado ayer aun sin resolucion por parte de jg ovalle solicitando autorizacion de vaciado y analisis \n                - el de gerald aguila. Esta en poder de rafael y ya hay resolución que autoriza vaciado y analisis 	2	Informe realizado.
208	165	22	4	2025-06-24 00:00:00	2025-06-25 00:00:00	terminado	2025-06-25 18:47:02.175	2025-06-25 18:47:02.175	Documento de hallazgos evidencia digital y resumen de pericias 	4	realizado y enviado a fiscal junto a reunión con victima 108 
209	14	8	6	2025-06-25 00:00:00	2025-06-25 00:00:00	terminado	2025-06-25 20:14:32.465	2025-06-25 20:14:32.465	Peritaje balístico	6	Pide cuenta LACRIM Central
189	151	23	3	2025-06-09 00:00:00	2025-06-20 00:00:00	terminado	2025-06-18 16:14:14.519	2025-06-25 20:47:11.569	Informe Analisis telefono movil imputado ANDREA JAVIER MELENDEZ ALFARO alias CHOCLITO 	3	Se identifican imágenes obtenidas a través del proceso de extraccion y analisis relacionadas a drogas y armas principalmente durante el año 2025
212	153	24	3	2025-05-30 00:00:00	2025-05-30 00:00:00	terminado	2025-06-25 21:56:36.604	2025-06-25 21:56:36.604	Característica de los hechos y denuncia, diligencias instruidas por Fiscal de turno Ecoh, lugar del SS, antecedentes víctima y red familiar. Imputado NN. 	3	Antecedentes de las primeras 24 horas desde la concurrencia al SS, por parte del equipo Ecoh de turno
213	173	24	3	2025-05-22 00:00:00	2025-05-22 00:00:00	terminado	2025-06-26 14:11:40.373	2025-06-26 14:11:40.373	Característica de los hechos denunciados, lugares señalados, posible SS, antecedentes victima, diligencias instruidas. En este caso NO hubo concurrencia por parte del equipo de turno, al ya estar en libertad la victima sin lesiones y realizando la denuncia respectiva.	3	Antecedentes preliminares de las primeras 24 horas desde la denuncia por parte de la victima respecto de haberse encontrado privado de libertad por varios dias, denunciando los hechos en una comisaria en la comuna de Coquimbo
308	151	6	4	2025-07-20 00:00:00	2025-08-11 00:00:00	terminado	2025-08-13 20:58:44.458	2025-08-13 20:58:44.458	Entrevistas a fiscales a cargo de las investigaciones que marcaron el semestre, transcripciones y redacción completa del apartado de las investigaciones para el boletín de criminalidad 	4	Enviado a administradora y fiscal jefe
214	147	24	3	2025-04-25 00:00:00	2025-04-25 00:00:00	terminado	2025-06-26 14:19:43.757	2025-06-26 14:19:43.757	Antecedentes de las primeras 24 horas del homicidio consumado ocurrido en sector de los Deptos rojos, en las Compañías. Característica de los hechos, localización geográfica de SS, diligencias instruidas por el Fiscal ecoh de turno, elementos preliminares de analisis,entre otros	3	Elementos preliminares respecto de los hechos, la denuncia, la victima, SS, imputado nn
215	146	24	3	2025-04-21 00:00:00	2025-04-21 00:00:00	terminado	2025-06-26 14:57:13.477	2025-06-26 14:57:13.477	Antecedentes de las primeras 24 horas del hallazgo de restos humanos, en sector de Avenida Cuatro Esquinas, en La Serena. Característica de los hechos, localización geográfica de SS, diligencias instruidas por el Fiscal ecoh de turno, elementos preliminares de analisis,entre otros.	3	A través de los indicios que entrega la BH, se indica preliminarmente que existe una PPDD por Ana María Pizarro Pizarro desaparecida desde el día 03 de abril
216	132	24	4	2025-03-20 00:00:00	2025-03-20 00:00:00	terminado	2025-06-26 16:49:31.642	2025-06-26 16:49:31.642	Realización ITA	4	Enviado a fiscal y equipo, subido a BW y carpeta ECOH 2025
217	165	24	4	2025-04-11 00:00:00	2025-04-11 00:00:00	terminado	2025-06-26 16:50:37.698	2025-06-26 16:50:37.698	Realización ITA	4	Enviado a fiscal y equipo, subido a BW y carpeta ECOH 2025
218	151	24	4	2025-04-12 00:00:00	2025-04-12 00:00:00	terminado	2025-06-26 16:52:39.763	2025-06-26 16:52:39.763	Realización ITA secuestro VIF 2500504595-1	4	Enviado a fiscal y equipo, subido a BW y carpeta ECOH 2025
219	154	24	4	2025-06-06 00:00:00	2025-06-06 00:00:00	terminado	2025-06-26 16:53:55.673	2025-06-26 16:53:55.673	Realización ITA	4	Enviado a fiscal y equipo, subido a BW y carpeta ECOH 2025
221	151	15	7	2025-06-23 00:00:00	2025-06-23 00:00:00	terminado	2025-06-26 20:31:21.2	2025-06-26 20:31:21.2		7	Temas de la tabla fueron cloncluidos
222	153	10	7	2025-06-26 00:00:00	2025-06-26 00:00:00	terminado	2025-06-26 20:32:10.91	2025-06-26 20:32:10.91		7	Se realiza traspaso de profesional ATVT con víctima 108
223	151	7	7	2025-06-25 00:00:00	2025-06-26 00:00:00	terminado	2025-06-26 20:34:16.277	2025-06-26 20:34:16.277	Reunión de gestión con Jefa de Unidad de Personas, Fiscal Jefe, Administrador y ecoh Limarí.	7	Se entregan documentos comprometidos para la reunión. 
224	175	12	7	2025-06-27 00:00:00	2025-06-27 00:00:00	terminado	2025-06-27 15:50:33.224	2025-06-27 15:50:33.224		7	se entrega MP rondas 
220	164	12	7	2025-06-25 00:00:00	2025-06-26 00:00:00	terminado	2025-06-26 20:30:22.33	2025-06-27 17:14:27.617	Renovación de convenio de arriendo para víctima reubicada 	7	Entregada
200	148	6	2	2025-06-23 00:00:00	2025-06-23 00:00:00	terminado	2025-06-23 22:32:26.245	2025-06-27 23:41:41.804	Se solicita realizar compilado de evidencia e incorporar en presentación a fin de apoyar audiencia de control de detención imputado  a MARCOS EZEQUIEL CASTILLO ESCUDERO.VICENTE BENJAMIN GUERRERO GUERRERO	2	Se realiza compilado y es enviado a fiscal Salinas para su revisión, incorpora audios y videos extraidos desde telefono ME 
225	151	7	7	2025-06-30 00:00:00	2025-06-30 00:00:00	terminado	2025-06-30 18:45:21.683	2025-06-30 18:45:21.683	Reunión de coordinación con BICRIM Ovalle	7	designación de tareas investigativas para causas.
79	85	2	3	2025-03-10 00:00:00	2025-03-31 00:00:00	terminado	2025-06-10 15:09:07.296	2025-06-30 19:29:05.228	Extracción Teléfono móvil y análisis de teléfono posiblemente de Brian Lopetegui.	3	Se obtiene información relevante respecto de días previos y dia de los hechos denunciados. El teléfono pertenece a uno de los sujetos involucrados en los delitos. Se levantan imágenes, audios, videos relacionados a los hechos.
227	86	25	2	2025-05-13 00:00:00	2025-05-13 00:00:00	terminado	2025-07-01 15:12:01.274	2025-07-01 15:12:01.274	Extracción y análisis de información telefono SM-A536e DS Galaxy A53 5G NUE 7767917	2	Informe de extracción forense N° EFA12-2025 Imputado Alvaro Zepeda. Enviado a Fiscal.
228	86	25	2	2025-03-15 00:00:00	2025-05-15 00:00:00	terminado	2025-07-01 15:14:42.933	2025-07-01 15:14:42.933	Extraccion forense de 2 telefono I.\tTeléfono marca Samsung, Modelo \tGalaxy S24 NUE 7478738.N° \nII.\tTeléfono marca Apple, modelo iPhone 12 Pro-Max 5g NUE 6850752. pertenecientes a imputado Johan perez	2	Informe EFA022025 entregado\nI.\tTeléfono marca Samsung, Modelo \tGalaxy S24 NUE 7478738.N° \nII.\tTeléfono marca Apple, modelo iPhone 12 Pro-Max 5g NUE 6850752.\n
229	86	25	2	2025-04-24 00:00:00	2025-05-13 00:00:00	terminado	2025-07-01 15:16:09.665	2025-07-01 15:16:09.665	Realizar Informe Extraccion y analisis Telefono Samsung SM-S911b Galaxy S23 Imputado PATRICIA ARANDA	2	Informe Extraccion y analisis  EFA11-2025RUC 2201180094-0 Samsung SM-S911b Galaxy S23 PARANDA 
230	179	2	2	2025-06-02 00:00:00	2025-07-01 00:00:00	terminado	2025-07-01 18:55:45.68	2025-07-01 18:55:45.68	FSALINAS SOLICITA EXTRTACCION DE DOS TELEFONOS CELULARES, MARCA POCO Y APPLE IPHONE	2	SE REALIZA INTENTO DE EXTRACCION POR FUERZA BRUTA POR 2 SEMANAS SIN RESULTADO
231	53	23	4	2025-07-01 00:00:00	2025-07-02 00:00:00	terminado	2025-07-02 22:10:24.801	2025-07-02 22:10:24.801	Carpeta con videos íntegros y editados de la cronología de los hechos para audiencia 	4	con VB, subido a carpeta N y entregado a Fiscal
232	128	10	7	2025-07-02 00:00:00	2025-07-02 00:00:00	terminado	2025-07-03 19:17:28.748	2025-07-03 19:17:28.748	Citación a testigo La Beba a declarar	7	citación confirmada
233	151	7	7	2025-07-03 00:00:00	2025-07-03 00:00:00	terminado	2025-07-03 19:18:43.705	2025-07-11 16:16:53.43	Reunión revisión causas ECOH Limarí	7	reunión terminada
234	100	19	7	2025-07-03 00:00:00	2025-07-03 00:00:00	terminado	2025-07-03 19:19:58.148	2025-07-14 19:14:54.746	Análisis carpetas TRIFAM	7	terminado
235	156	23	2	2025-06-30 00:00:00	2025-07-09 00:00:00	terminado	2025-07-03 21:44:17.456	2025-07-15 20:58:49.515	Análisis de evidencia digital extración telefono de Rodrigo Ortiz	2	Se realiza informe de extracción y reporte de analisis, se envía a Fiscal Eduardo Yañez.
236	56	5	3	2025-06-30 00:00:00	2025-07-03 00:00:00	terminado	2025-07-04 13:46:06.635	2025-07-04 13:46:06.635	Diligencias de la causa. Analisis sujeto interés y vehículos	3	Reporte relacionados a diligencias respecto de la causa. Actualización antecedentes.
211	171	22	3	2025-06-25 00:00:00	2025-07-31 00:00:00	en_proceso	2025-06-25 21:51:14.356	2025-07-04 14:33:04.625	Levantamiento antecedentes de víctimas relacionadas a la causa ruc en investigación, por posible caso de ESNNA. Antecedentes de sujetos de interés. Residencias donde están institucionalizadas las víctimas 	3	\N
237	155	25	2	2025-07-07 00:00:00	2025-07-11 00:00:00	inicio	2025-07-07 16:34:50.488	2025-07-07 16:34:50.488	Extracción telefono celular marca  Samsung A25, propiedad de Cistrian  Carvajal Acevedo	2	\N
238	124	2	2	2025-07-03 00:00:00	2025-07-07 00:00:00	terminado	2025-07-07 21:40:11.333	2025-07-07 21:40:11.333	solicta extracción \nFabricante\tXiaomi\nProducto\t23124RN87G telefono es devuelto a la victima	2	Se realiza informe Extraccion IEED-004 RUC 2500151596-1 y se sube a FCD
168	150	6	2	2025-05-23 00:00:00	2025-05-23 00:00:00	terminado	2025-06-17 13:15:57.201	2025-07-11 13:21:01.811	Recuperación en terreno de cámaras se seguridad SALFA y empresa Ingenieria y pryectos en Caleta San Pedro	2	Se realiza recuperación de cámaras y se deja a disposición de PDI. se construirá informe
240	97	10	7	2025-07-11 00:00:00	2025-07-11 00:00:00	terminado	2025-07-11 16:17:46.237	2025-07-11 16:17:46.237	citación a testigos\n	7	citación
241	151	18	7	2025-07-11 00:00:00	2025-07-11 00:00:00	terminado	2025-07-11 16:18:17.805	2025-07-11 16:18:17.805	reunión junta de vecinos los naranjos	7	realizada
242	151	7	7	2025-07-11 00:00:00	2025-07-11 00:00:00	terminado	2025-07-11 16:19:04.938	2025-07-11 16:19:04.938	presentación mayor de carabineros 	7	realizada
239	19	3	3	2025-07-09 00:00:00	2025-07-10 00:00:00	terminado	2025-07-09 20:45:28.089	2025-07-11 19:13:20.139	Antecedentes respecto del numero telefónico de la victima	3	Antecedentes respecto del actual usuario del numero telefónico que mantenía la victima Cesar Eduardo Godoy Espinoza
243	151	24	4	2025-07-12 00:00:00	2025-07-12 00:00:00	terminado	2025-07-14 17:02:13.37	2025-07-14 17:02:13.37	ITA CAUSA 2500942883-9	4	Subido a BW, enviado a Fiscal 
244	180	24	4	2025-07-10 00:00:00	2025-07-11 00:00:00	terminado	2025-07-14 17:03:04.37	2025-07-14 17:03:04.37	ITA 33 causa callejon santa elena	4	Subido a BW, enviado a fiscal 
245	151	24	4	2025-07-08 00:00:00	2025-07-08 00:00:00	terminado	2025-07-14 17:04:49.076	2025-07-14 17:04:49.076	ITA 32 IV CENTENARIO, SECUESTRO  	4	Subido a FCD y enviado a fiscal 
246	97	12	7	2025-07-14 00:00:00	2025-07-14 00:00:00	terminado	2025-07-15 13:48:28.119	2025-07-15 13:48:28.119	FEL y rondas a vic108	7	se entrega mp
247	97	7	7	2025-07-14 00:00:00	2025-07-14 00:00:00	terminado	2025-07-15 13:49:38.195	2025-07-15 13:49:38.195	ingreso de TIP y acompañamiento en la toma de declaración 	7	se ingresa y toma declaración
248	97	12	7	2025-07-15 00:00:00	2025-07-15 00:00:00	terminado	2025-07-15 14:55:49.751	2025-07-15 14:55:49.751	FEL a TIP	7	entregada
250	124	3	2	2025-07-18 00:00:00	2025-07-18 00:00:00	terminado	2025-07-18 17:19:54.178	2025-07-18 17:19:54.178	Identificar si existe relación entre abonado e imputado	2	Se realiza reporte de monitoreo, en relación con la identificación de la identificacion de una persona informada por la compañia y el imputado  GERALD MAURICIO VALDERRAMA SOTO. Se logra  establecer que existe relación entre abonado e imputado
249	86	2	2	2025-07-15 00:00:00	2025-07-15 00:00:00	terminado	2025-07-15 21:43:00.402	2025-07-18 19:53:13.883	Extracción forense Samsung Galaxy S21 Ultra 5G SM-G998B\nNUE 7478740	2	Se realiza extracción, aparentemente no hay elementos importatnes para análisis.
251	60	6	4	2025-07-10 00:00:00	2025-07-14 00:00:00	terminado	2025-07-21 13:46:41.703	2025-07-21 13:46:41.703	Aporte evidencias para JO	4	Subida a carpeta N
252	151	9	4	2025-07-18 00:00:00	2025-07-21 00:00:00	terminado	2025-07-21 20:13:25.923	2025-07-21 20:13:25.923	Realizacion analisis cuentas bancarias imputado Patricio Jara en informe patrimonial causa RUC 2201062289-5 para el fiscal Carlos Vidal 	4	Enviado a Fiscal Carlos Vidal 
253	54	6	4	2025-07-10 00:00:00	2025-07-15 00:00:00	terminado	2025-07-21 21:29:42.341	2025-07-21 21:29:42.341	Linea de tiempo cronologia delitos asociacion criminal COLATE 	4	VB FISCAL ZOLEZZI Y ENVIADO
254	181	24	3	2025-07-15 00:00:00	2025-07-24 00:00:00	terminado	2025-07-22 21:48:16.213	2025-07-22 21:48:16.213	Antecedentes que se tienen de las primeras 24 horas de la causa	3	Antecedentes generales del caso, víctimas, imputados, redes criminales, antecedentes para analisis.
255	182	24	3	2025-07-16 00:00:00	2025-07-18 00:00:00	terminado	2025-07-22 21:50:39.728	2025-07-22 21:50:39.728	Datos generales de la denuncia, declaraciones de la conviviente, antecedentes de los hechos. Grabaciones de las cámaras ubicadas en el sector del domicilio de la victima. Posibles imputados. 	3	Antecedentes preliminares respecto del homicidio consumado de la víctima RODRIGO ELTIT ELTIT en su domicilio el dia 13.07.2025
256	117	25	3	2025-06-12 00:00:00	2025-07-25 00:00:00	en_proceso	2025-07-22 21:54:58.7	2025-07-22 21:54:58.7	Extraccion  y analisis dispositivo móvil imputado Darien Andres Araya Tabilo	3	\N
226	117	25	3	2025-06-02 00:00:00	2025-07-15 00:00:00	en_proceso	2025-07-01 14:07:34.713	2025-07-22 22:03:53.773	Realizar proceso de extracción y posterior análisis del teléfono incautado a uno de los imputados de la causa, DARIEN ANDRES ARAYA TABILO. Dispositivo incautado cuando se lleva a cabo la OD que estaba en su contra. Encontrar elementos relacionados a los hechos ocurridos el dia 22.08.2024 en sector La Cantera Coquimbo 	3	\N
257	182	2	3	2025-07-21 00:00:00	2025-07-23 00:00:00	terminado	2025-07-23 15:35:01.507	2025-07-23 15:35:01.507	Extraer grabaciones de las cámaras de video que se mantienen en el PC de la conviviente de la víctima, respaldados y subidos a FCD de la causa	3	Levantamiento de videos desde PC de la conviviente de la victima. Grabaciones de las cámaras instaladas al exterior del domicilio de la victima y su familia, del dia de los hechos 
258	2	10	14	2025-07-16 00:00:00	2025-07-17 00:00:00	terminado	2025-07-25 13:54:17.684	2025-07-25 13:54:17.684	- Se coordina entrevista con profesional ATVT\n- Toma de declaración el día 17 de abril con la abogada Verónica Castro a las 17 horas vía zoom. 	14	- Se entrevista a la víctima 108 vía zoom para realizar acompañamiento, contención y resolver dudas.\n\n- Abogada toma declaración a la víctima 108.\n\n- Se realizan ambas diligencias sin inconveniente. 
259	3	10	14	2025-04-10 00:00:00	2025-04-17 00:00:00	terminado	2025-07-25 14:25:11.804	2025-07-25 14:25:11.804	Se intento en varias ocasiones contactar a los testigos para la preparación de juicio oral, sin embargo no se logro por los siguientes motivos:\n\n1-\tJenderson José Sánchez Yovera, documento de identidad Venezolano 28.121.080, domiciliado en Calle Juan Antonio Ríos N*16, Coquimbo, teléfono +569 61561480. Se encuentra su celular fuera de servicio.\n2-\tNayive Alexandra Rojas Adasme, cédula de identidad 21.923.314-0, se encuentra en situación de calle en Coquimbo y con consumo problemático de pasta base.\n\n3-\tHilber José Fernández Arrieche, cédula de identidad 28.295.191-6, se encuentra en situación de calle en Coquimbo y con consumo problemático de pasta base.\n\n4- Con respecto al testigo Pablo Andrés Rebolledo Lobos, cedula de identidad: 16.169.081-3 no contesto el teléfono móvil, se solicito a don Diógenes que lo fuera a notificar al domicilio pero informo que la vivienda no se encontraban moradores.\n\n	14	No fue posible establecer contacto con los testigos señalados, debido a diversos factores. Algunos de ellos no cuentan con teléfonos móviles disponibles, mientras que otros se encuentran actualmente en situación de calle, con consumo problemático de drogas, lo que dificulta su localización y notificación. Estas circunstancias han impedido concretar su citación de manera efectiva.
280	151	25	2	2025-07-31 00:00:00	2025-08-01 00:00:00	terminado	2025-08-04 14:28:57.223	2025-08-04 14:28:57.223	periciar preliminarmente un celular que irá a dejar la defensora Ilabaca, el que mantiene una aplicación que según permite el seguimiento en tiempo real para determinar si el imputado estuvo a no en el SS	2	Se realiza extracción y anáñisis telefono entregado por defensa asociado a RUC 2501058407-0. Telefono iPhone, analisis de 
260	19	10	14	2025-03-19 00:00:00	2025-03-19 00:00:00	terminado	2025-07-25 14:55:47.033	2025-07-25 14:55:47.033	Se realizó una entrevista con la víctima 108, en dependencias de ECOH, con la participación del equipo fiscal a cargo de la causa y de la profesional del Área de Atención a Víctimas y Testigos (ATVT). El objetivo de la instancia fue resolver dudas respecto al proceso de investigación en curso.\n\nDurante la entrevista, se brindó contención emocional a la señora María, quien se encontraba visiblemente afectada. Asimismo, se evaluó la necesidad de implementar medidas de protección; sin embargo, estas no fueron consideradas necesarias, ya que la víctima expresó no sentir temor ni inseguridad en el contexto actual.	14	Se lograron resolver las dudas de la víctima 108 y entregar contención emocional. 
261	28	10	14	2025-02-19 00:00:00	2025-02-19 00:00:00	terminado	2025-07-25 15:12:57.576	2025-07-25 15:12:57.576	- Se coordina entrevista con profesional ATVT\n- Toma de declaración el día 19 de enero con la abogada Verónica Castro a las 15 horas vía zoom.\n	14	- Se entrevista a la testigo vía zoom para realizar acompañamiento, contención y resolver dudas.\n\n- Abogada toma declaración a testigo.\n\n- Se realizan ambas diligencias sin inconveniente.\n
262	45	16	14	2025-04-16 00:00:00	2025-06-26 00:00:00	terminado	2025-07-25 15:27:09.273	2025-07-25 15:27:09.273	Se contacta a la abogada de jurídica del Hospital de La Serena para solicitar ficha clínica del imputado el día 16 de abril. 	14	- La ficha clínica fue enviada el 26- 06-2025.
263	137	1	4	2025-07-28 00:00:00	2025-07-28 00:00:00	terminado	2025-07-28 20:51:40.444	2025-07-28 20:51:40.444	Informe georreferenciación tráfico voz y datos teléfono victima Bastián  Vargas (sin registro)	4	Enviado a fiscal y subido a FCD
264	47	10	14	2025-05-06 00:00:00	2025-05-06 00:00:00	terminado	2025-07-30 13:54:46.806	2025-07-30 13:54:46.806	- Se realizo la preparación de juicio oral en dependencias de la Fiscalía de Ovalle vía zoom. \n- Fiscal Nicolás Nicoreanu realizo la preparación de juicio oral con el testigo Miguel Salas.\n- Realizo apoyo ATVT Felipe Palma, realiza pauta de detección de necesidades.\n- Testigo solicita caracterización. 	14	- Preparación de juicio realizada.\n- Se coordinará caracterización para el testigo el día del juicio oral. 
265	47	16	14	2025-01-13 00:00:00	2025-01-13 00:00:00	terminado	2025-07-30 14:00:12.977	2025-07-30 14:00:12.977	- Se contacto a secretaría del  SML de Ovalle  para solicitar informe de autopsia. Además, se envió correo a Francisco Fredes para consultar por resultados de alcoholemia de la víctima.	14	- Enviaron documentos solicitados.
266	49	16	14	2025-01-02 00:00:00	2025-01-02 00:00:00	terminado	2025-07-31 21:19:28.122	2025-07-31 21:19:28.122	Se contacta a coordinador de CAVD La Serena para informar sobre entrevista que tendrá la familia con el fiscal Nicolás Nicoreanu y profesional ATVT, para solicitar la participación del abogado querellante.	14	Se coordina participación del abogado querellante en la entrevista.
267	49	16	14	2025-01-13 00:00:00	2025-01-13 00:00:00	terminado	2025-07-31 21:21:14.514	2025-07-31 21:21:14.514	Se contacto a Paula Tabilo del SML La Serena para solicitar informe toxicológico de la víctima. 	14	- Paula del SML envió informe pendiente
268	49	10	14	2025-01-02 00:00:00	2025-01-02 00:00:00	terminado	2025-07-31 21:24:22.508	2025-07-31 21:24:22.508	Se informa a la víctima 108,  que la entrevista con el Fiscal y profesional ATVT será el martes 7 de enero a las 16:30 hrs, en dependencias de SACFI.	14	Víctima 108 informada
269	49	10	14	2025-01-07 00:00:00	2025-01-07 00:00:00	terminado	2025-07-31 21:26:34.018	2025-07-31 21:26:34.018	Se realiza entrevista informativa con Fiscal , profesional ATVT, abogado querellante y familia de occiso.	14	- Entrevista realizada\n- Se resuelven dudas
270	49	10	14	2025-06-10 00:00:00	2025-06-10 00:00:00	terminado	2025-07-31 21:28:14.736	2025-07-31 21:28:14.736	Se contacta a Gabriela para informar que la entrevista con el Fiscal será el día miércoles 18/06/2025., a las 15:30 horas presencial en dependencias de SACFI.	14	- Víctima 108 informada
271	49	10	14	2025-06-18 00:00:00	2025-06-18 00:00:00	terminado	2025-07-31 21:30:02.256	2025-07-31 21:30:02.256	Se realizó reunión con víctima 108, padre del occiso, abogado querellante y fiscal Nicolas Nicoreanu. 	14	- Reunión realizada\n- Dudas resueltas
272	17	7	8	2025-07-31 00:00:00	2025-08-31 00:00:00	terminado	2025-08-01 16:43:04.783	2025-08-01 16:44:32.368	Se realiza preparación de juicio Oral con el Fiscal Zolezzi, a tres a 4 testigos.	8	Se logra preparar a los testigos.
273	54	16	14	2025-01-03 00:00:00	2025-01-03 00:00:00	terminado	2025-08-01 17:10:10.388	2025-08-01 17:10:10.388	Se contacta a profesional de CAVAS para informar que están las coordinaciones realizadas para utilizar la sala de entrevista video grabada y el apoyo del técnico de sala. Además, se informa que profesional ATVT está en constante comunicación con el padre de la víctima, quien informo que Jamie quiere participar de la pericia. Sin embargo, es necesario estar monitoreando cada cierto tiempo ya que puede desistir.	14	Se informa coordinación realizada. 
274	54	7	14	2025-01-17 00:00:00	2025-01-17 00:00:00	terminado	2025-08-01 17:24:20.827	2025-08-01 17:24:20.827	Se realizo reunión con Fiscal , profesionales de ECOH y comisario Cristián Jerez de la BH que estará a cargo de la investigación.	14	- El fiscal solicito varias diligencias al equipo.\n- Profesional ATVT coordinará con comisario toma de declaraciones de los testigos.
275	54	7	14	2025-01-20 00:00:00	2025-01-20 00:00:00	terminado	2025-08-01 17:31:15.3	2025-08-01 17:31:15.3	Se realiza entrevista con la víctima Jamie Alfaro, abogada Verónica Castro , profesional ATVT y fiscal a cargo Nicolás Zolezzi.	14	- Se realizó contención y acompañamiento a la víctima\n- Se resolvieron dudas\n- Fiscal tomo declaración \n- Se explico objetivo y se recordó  el horario de la entrevista con profesionales del CAVAS. Además, se informo nuevamente que un conductor la irá a buscar a su domicilio para llevarla a las dependencias de la Fiscalía local de Coquimbo. 
276	54	10	14	2025-03-16 00:00:00	2025-03-16 00:00:00	terminado	2025-08-01 17:37:19.544	2025-08-01 17:37:19.544	Jamie Alfaro víctima de la causa, se contacta con profesional ATVT para realizar consultas y solicitar reunión con Fiscal a cargo del caso.	14	- Se coordina entrevista con Fiscal y profesional ATVT.
277	54	7	14	2025-03-19 00:00:00	2025-03-20 00:00:00	terminado	2025-08-01 17:39:53.429	2025-08-01 17:39:53.429	Se realiza entrevista telefónica con Jamie Alfaro, Fiscal Nicolás Zolezzi y profesional ATVT. Se resuelven dudas, se da a conocer plazo de termino de la etapa de investigación y se cita de manera presencial a víctima a dependencias de ECOH el día jueves 20 a las 12 horas.	14	- Se realiza entrevista, se resuelven dudas y se realiza contención.\n- Se cita para el día 20 de marzo a dependencias de ECOH, sin embargo no asiste. 
278	54	10	14	2025-03-19 00:00:00	2025-03-19 00:00:00	terminado	2025-08-01 17:42:13.188	2025-08-01 17:42:13.188	Se contacto a madre de vÍctima, de nombre Marcela Herrera para informar que el día 4 de abril a las 12 horas se realizará la toma de declaración. Subcomisario Jerez de la BH viajará para realizar la diligencia.	14	- Testigo informada\n- Se coordina día, hora y lugar de la toma de declaración de la testigo Marcela Herrera con comisario.
279	54	7	14	2025-03-19 00:00:00	2025-03-19 00:00:00	terminado	2025-08-01 17:44:40.858	2025-08-01 17:44:40.858	Se realizó reunión con subcomisario Jerez, fiscal Nicolas Zolezzi, abogado, analista y ATVT en dependencias de la Brigada de homicidios La Serena. \n\n	14	Se realizo reunión con equipo ECOH y comisario en dependencias de la BH. Los temas tratados fueron:\n\n1- Diligencias pendientes\n2- Se acordó apoyo de ATVT en contactar a familiares para toma de declaración\n3- ATVT solicitará antecedentes de personal médico para toma de declaraciones\n4- Se acordaron plazos
281	54	10	14	2025-01-20 00:00:00	2025-01-20 00:00:00	terminado	2025-08-04 15:03:32.402	2025-08-04 15:03:32.402	Se realizo entrevista presencial con testigo y equipo ECOH con el objetivo de recabar información y resolver dudas. 	14	- Entrevista realizada
283	66	10	14	2025-07-22 00:00:00	2025-07-22 00:00:00	terminado	2025-08-05 15:27:36.033	2025-08-05 15:27:36.033	e tomó contacto con la  víctima de la causa a fin de citarla para el dia jueves 24 de julio a las 12:00  horas en dependencias de ECOH, con motivo de la preparación de juicio oral con el fiscal. \n\nObjetivos de la preparación:\n\n1- Revisión de la declaración\n2- Contextualización de los hechos\n3- Explicación del procedimiento judicial\n4- contención y acompañamiento\n5- Detección de necesidades	14	Se realizo preparación de juicio oral sin inconvenientes.
284	124	8	6	2025-08-05 00:00:00	2025-08-05 00:00:00	terminado	2025-08-05 16:40:30.006	2025-08-05 16:40:49.683	Enviar correo a ENTEL.	6	Envío correo a ENTEL solicitando la información de los números telefónicos de los imputados. Adjunté el acta del JG La Serena donde consta la autorización.
285	66	7	14	2025-07-31 00:00:00	2025-07-31 00:00:00	terminado	2025-08-05 18:23:42.467	2025-08-05 18:23:42.467	- Profesional ATVT realizó acompañamiento y contención a la víctima al Tribunal \n- Víctima ingreso por entrada diferenciada\n- Ingreso a las 8:20 y estuvo hasta las 14:00\n- Se coordino traslado de ida y vuelta a su domicilio\n-  Se entrego colación \n 	14	- Víctima Macarena Alarcón declaro en TOP La Serena \n- Profesional ATVT realizó acompañamiento y contención.
286	66	7	14	2025-07-24 00:00:00	2025-07-24 00:00:00	terminado	2025-08-05 18:29:35.495	2025-08-05 18:29:35.495	El dia jueves 24 de julio a las 12:00  horas se realizo la preparación de juicio grupal en dependencias de ECOH, la que realizó el fiscal a cargo de la causa en compañia de la profesional ATVT.\n\nDonde se realizaron las siguientes acciones:\n\n1- Revisión de la declaración\n2- Contextualización de los hechos\n3- Explicación del procedimiento judicial\n4- contención y acompañmiento\n5- Medidas de protección solicitadas (movilización y entrada diferenciada)	14	Se realizo preparación de juicio sin inconvenientes
309	151	6	4	2025-07-20 00:00:00	2025-08-11 00:00:00	terminado	2025-08-13 21:12:27.778	2025-08-13 21:12:27.778	Entrevistas a autoridades relevantes de otras instituciones, jefe brigada de homicidios, jefe de la sip coquimbo, jefa de la sip La Serena, Cristopher jefe de ORICRIM Gendarmería, transcribir, resumir y redactar para el boletin de criminalidad	4	enviado a administradora y fiscal jefe
287	66	7	14	2025-07-24 00:00:00	2025-07-24 00:00:00	terminado	2025-08-05 18:54:53.265	2025-08-05 18:54:53.265	El dia jueves 24 de julio a las 12:00  horas se realizo la preparación de juicio grupal en dependencias de ECOH, la que realizó el fiscal a cargo de la causa en compañia de la profesional ATVT.\n\nDonde se realizaron las siguientes acciones:\n\n1- Revisión de la declaración\n2- Contextualización de los hechos\n3- Explicación del procedimiento judicial\n4- contención y acompañmiento\n5- Medidas de protección solicitadas (movilización y entrada diferenciada)	14	Se realizó preparación de juicio sin inconvenientes
288	66	7	14	2025-07-31 00:00:00	2025-07-31 00:00:00	terminado	2025-08-05 18:56:53.145	2025-08-05 18:56:53.145	- Profesional ATVT realizó acompañamiento a testigo en el Tribunal para su declaración en juicio oral.\n\n- No alcanzo a declarar, se citó para el dia 1 de agosto a las 8:30 horas profesional ATVT la acompañará.\n\n- Se coordinó nuevamente traslado.	14	- Testigo no alcanzo a declarar\n- La declaración se realizará el día 1 de agosto .\n- Profesional ATVT la acompañará\n- Se coordinó traslado y entrada diferenciada
289	66	7	14	2025-08-01 00:00:00	2025-08-01 00:00:00	terminado	2025-08-05 21:35:26.591	2025-08-05 21:35:26.591	- Profesional ATVT realizó acompañamiento a testigo \n- Ingreso por entrada diferenciada	14	- La testigo Yeruzka Coronado asistió y declaró en juicio oral sin inconvenientes. \n- Profesional ATVT realizó acompañamiento.
290	66	7	14	2025-07-28 00:00:00	2025-07-28 00:00:00	terminado	2025-08-05 21:45:28.379	2025-08-05 21:45:28.379	El dia lunes 28 de julio a las 12:30  horas se realizo la preparación de juicio en dependencias de ECOH, la que realizó el fiscal a cargo de la causa en compañia de la profesional ATVT.\n\nDonde se realizaron las siguientes acciones:\n\n1- Revisión de la declaración\n2- Contextualización de los hechos\n3- Explicación del procedimiento judicial\n4- contención y acompañmiento\n5- Medidas de protección solicitadas (movilización y entrada diferenciada)	14	- Se realiza preparación de juicio\n- Se solicitará traslado y entrada diferenciada para el testigo Juan Castro.
291	66	7	14	2025-07-31 00:00:00	2025-07-31 00:00:00	terminado	2025-08-05 21:50:17.693	2025-08-05 21:50:17.693	- Testigo declaró en juicio oral\n- Se coordinó traslado e ingreso diferenciado.	14	Profesional ATVT realizó acompañamiento a testigo en el Tribunal para su declaración en juicio oral.
292	58	8	6	2025-08-06 00:00:00	2025-08-06 00:00:00	terminado	2025-08-06 18:08:36.132	2025-08-06 18:08:36.132	Pide cuenta de los siguientes oficios:\n1. Instrucción Particular remitida por oficio nro. 199370 de fecha 30 de enero de 2024, que solicitó a Ud. complementar la autopsia 04-LSC-AUT-102-22, precisando causa y fecha de muerte de la víctima PATRICIO MARCELO CORTES AGUILERA, cédula de identidad nro. 20.142.806-8.\n2. Pide Cuenta remitida por oficio nro. 209553 de fecha 23 de mayo de 2024.\n3. REQUERIMIENTO DE INFORMACIÓN remitido por oficio nro. 241599 del 08 de mayo del 2025.	6	Requerimiento información, pide cuenta.
293	59	8	6	2025-08-06 00:00:00	2025-08-06 00:00:00	terminado	2025-08-06 18:11:10.961	2025-08-06 18:11:10.961	Pide cuenta de los siguientes oficios:\n1) REQUERIMIENTO DE INFORMACIÓN, remitida por oficio nro. 227676 del 25 de noviembre del 2024.\n2) 2° PIDE CUENTA, remitida por oficio nro. 234485 del 17 de febrero del 2025.	6	Requerimiento información, pide cuenta.\n
294	186	8	6	2025-08-07 00:00:00	2025-08-07 00:00:00	terminado	2025-08-07 14:18:55.015	2025-08-07 14:18:55.015	Solicito a la AF Coquimbo informar si RUBÉN ALEXIS BUGUEÑO CORTÉS, cédula nacional de identidad nro. 16.893.338-K, mantiene registros de inscripciones, autorizaciones y permisos, conforme a Ley 17.798 sobre Control de Armas.	6	Envío correo a la AF Coquimbo solicitando informar si el imputado mantiene registros de inscripciones conforme a Ley sobre Control de Armas.
295	186	8	6	2025-08-07 00:00:00	2025-08-07 00:00:00	terminado	2025-08-07 21:51:56.216	2025-08-07 21:51:56.216	IP a la BH para tomar declaraciones de testigos y un imputado. Además, levantamiento de cámaras y envío de informes periciales.	6	IP a la BH para tomar declaraciones de testigos y un imputado. Además, levantamiento de cámaras y envío de informes periciales.
297	186	24	4	2025-08-07 00:00:00	2025-08-07 00:00:00	terminado	2025-08-08 16:09:41.881	2025-08-08 16:09:41.881	Informe de análisis temprano causa ruc 2501095209-6 que incluye relato de los hechos, red familiar, análisis preliminar redes sociales intervinientes, elementos considerados del crimen y set fotográfico del sitio del suceso. 	4	Enviado a Fiscal, subido a BW y FCD
299	186	7	14	2025-08-08 00:00:00	2025-08-08 00:00:00	terminado	2025-08-11 14:13:45.64	2025-08-11 14:13:45.64	- Profesional ATVT Asiste al SS\n- En dependencias de la BH se entrevista a víctima 108 Genesis Delso y a la hermana quien la estaba acompañando. 	14	- Se realiza entrevista a víctima 108 Genesis Delso\n- Se evalúa riesgo y necesidades de protección\n- Se realiza intervención en crisis\n- Se entrevista a hermana de Genesis 
296	151	6	2	2025-08-07 00:00:00	2025-08-08 00:00:00	terminado	2025-08-08 12:51:36.16	2025-09-01 14:13:18.055	Se solicita la recuperación de dos archivos PDF dañados, de la causa Procultura 	2	Se realizan varios intentos fallidos de recuperación total, solo recuperación parcial, se genera informe a UGI
300	186	12	14	2025-08-08 00:00:00	2025-08-08 00:00:00	terminado	2025-08-11 14:16:11.482	2025-08-11 14:16:11.482	- Se activa FEL\n- Genesis informa que por ahora se trasladará con sus hijos al domicilio de su madre. 	14	- Se activa FEL a víctima 108 Genesis Delso\n
301	186	12	14	2025-08-11 00:00:00	2025-08-11 00:00:00	terminado	2025-08-11 14:22:43.284	2025-08-11 14:22:43.284	- Se solicito MP por OPA, correo y se contacto vía telefónica al sargento Pedro Zamora. 	14	- Se solicito rondas policiales y contacto telefónico prioritario.
302	186	10	14	2025-08-11 00:00:00	2025-08-12 00:00:00	en_proceso	2025-08-11 15:09:17.777	2025-08-11 15:14:58.635	- Se realizará entrevista presencial en casa ECOH	14	\N
298	186	16	14	2025-08-07 00:00:00	2025-08-08 00:00:00	terminado	2025-08-08 17:25:58.181	2025-08-11 16:35:35.843	- Se contacta al SML para solicitar información con respecto al informe de autopsia y fecha para retiro del cuerpo.\n-Se envían oficios al SML.\n- Paula del SML informa que será funeral de alto riesgo.\n- El retiro del cuerpo se realizará el día 8 de agosto a las 14 horas.\n 	14	- Se contacta a SML para consultar por entrega de cuerpo (funeral de alto riesgo) informa que no se presento ningún inconveniente. \n- Se contactó a víctima 108 vía teléfono, quien informa que se realizo el funeral sin problemas. 
303	190	24	3	2025-08-11 00:00:00	2025-08-12 00:00:00	terminado	2025-08-12 22:47:06.943	2025-08-12 22:47:06.943	Datos de la denuncia, antecedentes de los hechos, de la víctima, testigos, lugares claves, diligencias investigativas, entre otros	3	Antecedentes levantados a través de la denuncia y de las primeras diligencias instruidas por parte del fiscal de la causa.
304	54	1	4	2025-08-08 00:00:00	2025-08-08 00:00:00	terminado	2025-08-13 15:00:23.916	2025-08-13 15:00:23.916	Terminado informe que no contiene datos de trafico de voz ni de datos de la victima 	4	enviado a fiscal y subido a FCD
305	86	22	3	2025-08-06 00:00:00	2025-08-19 00:00:00	en_proceso	2025-08-13 15:10:34.516	2025-08-13 15:10:34.516	Revisión documentos y planillas respecto de bancos e instituciones que han informado movimientos,para preparación del juicio oral, solicitado por Fiscal de la causa	3	\N
306	86	22	3	2025-08-13 00:00:00	2025-08-13 00:00:00	terminado	2025-08-13 16:44:24.551	2025-08-13 20:44:35.272	Solicitud de revisión y levantamientos de antecedentes generales de 02 sociedades constituidas por 02 imputados de la causa	3	Documentos SII Sociedades JP  Limitada  y Sociedad Comercial Rodriguez y Pizarro Limitada \nDocumentos constitucion Sociedad Diario Oficial\nDocumentos Sociedades Equifax
307	151	6	4	2025-07-20 00:00:00	2025-08-11 00:00:00	terminado	2025-08-13 20:57:05.404	2025-08-13 20:57:05.404	Entrevistas a fiscales a cargo de focos investigativos, transcripciones, escritura de resumen para boletín de criminalidad primer semestre	4	Enviado borrador a fiscal jefe y administradora para su VB
310	190	2	2	2025-08-13 00:00:00	2025-08-14 00:00:00	terminado	2025-08-18 13:08:13.375	2025-08-18 13:08:13.375	Extracción de telefono entregado voluntariamente por víctima	2	Extración forense CELULAR\tVivo\tV2430, en XRY y captura de pantalla con Avila Forensic, se devuelve telefono a víctma\n
311	180	26	4	2025-08-11 00:00:00	2025-08-21 00:00:00	terminado	2025-08-21 16:23:13.207	2025-08-21 16:23:13.207	Análisis cámaras de seguridad, edición de videos y realización de cuadro gráfico demostrativo de la cronología de los hechos y sujetos implicados	4	Enviado a fiscal a cargo de la causa, subido a FCD
312	151	22	4	2025-08-20 00:00:00	2025-08-20 00:00:00	terminado	2025-08-21 16:24:47.505	2025-08-21 16:24:47.505	Reporte de antecedentes y compañeros de delito sujeto foco Huachalalume Bryan Angel	4	Enviado a fiscal a cargo del foco 
313	191	22	3	2025-08-21 00:00:00	2025-08-22 00:00:00	terminado	2025-08-22 14:26:53.523	2025-08-22 14:26:53.523	Antecedentes para proponer diligencias respecto de la causa                                           	3	Reporte sujeto de interés (imputado) y padre 
314	133	23	2	2025-08-14 00:00:00	2025-08-17 00:00:00	terminado	2025-08-22 15:00:58.724	2025-08-22 15:00:58.724	conforme la instrucción dada en esta causa, teniendo presente las cargas de trabajo,  solicito remitir un pre informe referente a la búsqueda en el dispositivo incautado referente a imputados “TOTANO” o “chico tongo” u otro parecido que pueda aludir a los coimputados.	2	Informe ED, relacionado a sujeto RODRIGO MAXIMILIANO ROJAS VALDIVIA  RUN 18353545-5
315	151	2	2	2025-08-01 00:00:00	2025-08-22 00:00:00	terminado	2025-08-22 15:43:20.88	2025-08-22 15:43:20.88	En causa 2500404679-2, se solicita la extración de dos equipos celulares.	2	Se realizan varios intentos de extracción con 3 herramientas forenses, no se ha podido realizar la extracción.  2500404679-2
316	117	2	2	2025-08-01 00:00:00	2025-08-01 00:00:00	terminado	2025-08-22 18:09:05.332	2025-08-22 18:09:05.332	Extracción forense  Galaxy A23 5G SM-A236M	2	Extracción forense  Galaxy A23 5G SM-A236M ok, el análisis lo realizará Barba Leon\n
317	151	2	2	2025-08-01 00:00:00	2025-08-02 00:00:00	terminado	2025-08-22 18:10:23.924	2025-08-22 18:10:23.924	Extracción forense telefono Galaxy A13 SM-A135M\n2500404679-2 NUE 7769117	2	Extracción forense telefono Galaxy A13 SM-A135M\n2500404679-2 NUE 7769117 OK
318	86	2	2	2025-08-01 00:00:00	2025-08-01 00:00:00	terminado	2025-08-22 18:11:58.061	2025-08-22 18:11:58.061	Extracción forense Galaxy  Galaxy S24 Ultra SM-S928B\n	2	Extracción forense Galaxy S24 Ultra SM-S928B,  fallida\n
319	151	25	2	2025-08-12 00:00:00	2025-08-22 00:00:00	en_proceso	2025-08-22 18:14:18.82	2025-08-22 18:14:18.82	Solicita Extración   iPhone 12 [iPhone13,2 D53gAP] 2501058407-0 NUE 3648534\n	2	\N
320	151	25	2	2025-08-12 00:00:00	2025-08-22 00:00:00	en_proceso	2025-08-22 18:14:58.613	2025-08-22 18:14:58.613	Solcita Extracción forense telefono Galaxy A16 5G SM-A166M\n2501058407-0 NUE 3648534	2	\N
188	151	5	5	2025-06-16 00:00:00	2025-06-18 00:00:00	inicio	2025-06-18 13:08:56.081	2025-08-24 00:48:04.536	Solicitud de freddy: necesito que contactes a la víctima de causa que te mando adjunta y le tomes declaración telefónica, te mando un formato también; como no pudimos rescatar el parte original porque es muy antiguo, esto es todo lo que nos mandaron. Me interesa especialmente cómo se produjo el robo y que indique si efectivamente le robaron el arma que aparece en el parte, características, a nombre de quien estaba inscrita y tipo de permiso que tenía. El RUC de nuestra causa en la cual hay que tomar la declaración es 2400304662-8.	11	\N
324	146	10	8	2025-08-27 00:00:00	2025-08-27 00:00:00	terminado	2025-08-27 12:45:08.229	2025-08-27 12:45:08.229		8	Jocelin solicita información acerca del estado de la causa, donde se le señala que se preguntó a UCIEX, quien responde que no ha llegado información, sin embargo se consultará nuevamente al MINREL
325	193	8	6	2025-08-25 00:00:00	2025-08-27 00:00:00	terminado	2025-08-27 13:44:24.145	2025-08-27 13:44:24.145	Redacción y envío escrito	6	Envió escrito al JG Coquimbo solicitando interceptación telefónica de los imputados Raúl Diaz y Diego Burrows
321	60	7	8	2025-08-26 00:00:00	2025-08-26 00:00:00	terminado	2025-08-26 16:51:39.814	2025-08-27 15:06:53.494	En contexto de reubicación temporal, se genera prestación de arriendo de inmueble en la ciudad de Chillán	8	terminada
322	60	10	8	2025-08-26 00:00:00	2025-08-26 00:00:00	terminado	2025-08-26 16:53:38.706	2025-08-27 15:07:08.39	Se contacta a la Testigo para coordinar firma de contrato de arriendo con la inmobiliaria en Chillán.	8	terminada
323	60	10	8	2025-08-26 00:00:00	2025-08-26 00:00:00	terminado	2025-08-26 16:55:59.345	2025-08-27 15:07:02.298	Se envía convenio de arriendo para que la víctima la pueda firmar para dar inicio a los trámites de entrega de dineros con fines de arriendo de inmueble en Chillán.	8	terminada
326	195	2	2	2025-08-13 00:00:00	2025-08-27 00:00:00	terminado	2025-08-27 15:24:09.326	2025-08-27 15:24:09.326	Extreaccion forense para foco altiplano	2	Extracción OK. se informa a Rvergara
328	196	8	6	2025-08-27 00:00:00	2025-08-27 00:00:00	terminado	2025-08-27 20:37:09.561	2025-08-27 20:37:09.561	Escrito solicitando orden de entrada y registro al domicilio del imputado Jhon Betancourt Castaño.	6	Escrito solicitando orden de entrada y registro al domicilio del imputado Jhon Betancourt Castaño.
329	194	8	6	2025-08-27 00:00:00	2025-08-27 00:00:00	terminado	2025-08-27 20:55:02.821	2025-08-27 20:55:02.821	Revisar las causas del imputado, cumple condena en causa RUC 2401197852-1.	6	El imputado MAICOL MORALES , cumple condena efectiva en la causa RUC 2401197852-1 del JG Ovalle.\nEl 16/01/25 fue condenado a la pena de 800  días de presidio menor en su grado medio, con presidio efectivo, abonándose el tiempo privado de libertad en prisión preventiva desde el 07 de octubre al 02 de noviembre del año 2024 y el tiempo de arresto domiciliario nocturno entre el 02 de noviembre de 2024 hasta esa fecha.\nEn audiencia de control de detención del 25/02/25 se ordenó su ingreso al CDP Ovalle, para cumplimiento efectivo de la pena.
330	196	8	6	2025-08-27 00:00:00	2025-08-27 00:00:00	terminado	2025-08-27 21:38:50.919	2025-08-27 21:38:50.919	Correo a BRIANCO solicitando información sobre la interceptación telefónica y otras diligencias.	6	Correo a BRIANCO solicitando información sobre la interceptación telefónica y otras diligencias.
331	186	23	4	2025-08-27 00:00:00	2025-08-27 00:00:00	terminado	2025-08-27 21:42:42.632	2025-08-27 21:42:42.632	Revisión cámaras de seguridad, edición de videos, subido a FCD	4	Revisión cámaras de seguridad, edición de videos, subido a FCD y carpeta N
332	13	8	6	2025-08-27 00:00:00	2025-08-27 00:00:00	terminado	2025-08-27 21:49:32.959	2025-08-27 21:49:32.959	Entrevista con testigo Felipe Moyano.	6	Entrevista con testigo Felipe Moyano.
333	152	8	6	2025-08-26 00:00:00	2025-08-27 00:00:00	terminado	2025-08-27 21:57:40.279	2025-08-27 21:57:40.279	Escrito solicitando aumento del plazo de investigación.	6	Como se pide, se fija audiencia para el día 24 de octubre de 2025, a \nlas 10:30 horas, a efecto de resolver la solicitud formulada por el Ministerio \nPúblico.\n
334	84	26	2	2025-08-27 00:00:00	2025-08-27 00:00:00	terminado	2025-08-27 23:39:13.816	2025-08-27 23:39:13.816	Se solicita cuadro gráfico demostrativo	2	Se realiza infomrme N°: ICGD -003
335	194	8	6	2025-08-28 00:00:00	2025-09-01 00:00:00	en_proceso	2025-08-28 16:03:16.036	2025-08-28 16:03:16.036	Escrito formalización	6	\N
336	60	10	8	2025-08-28 00:00:00	2025-08-28 00:00:00	terminado	2025-08-28 19:14:09.952	2025-08-28 19:14:09.952	Se solicita a Johann revisar cuenta su cuenta corriente de Banco Falabella, para poder firmar el contrato de arriendo del inmueble de Chillán, sin embargo no se ha visto reflejado el depósito por lo que se gestionará un día mas de estadía en el hotel ventura de Chillán.	8	terminada
327	146	10	8	2025-08-27 00:00:00	2025-08-27 00:00:00	terminado	2025-08-27 19:38:47.277	2025-08-28 21:39:04.308	Se comunica a la Víctima 108 acerca del cambio de profesional ATVT a Dafnne Gutiérrez y se orienta acerca de como entrar a Mi Fiscalía en Línea, pues quería solicitar copia de carpeta.	8	terminada
337	133	10	8	2025-08-28 00:00:00	2025-08-28 00:00:00	terminado	2025-08-28 21:38:42.361	2025-08-28 21:39:10.389	Se sostiene reunión con Jonathan y Yesenia, donde señalan su intención de abandonar el país para visitar Colombia con la intención de  volver al país aunque no con toda seguridad, se envía información al Fiscal por posible prueba anticipada.	8	terminada
338	60	7	8	2025-08-27 00:00:00	2025-08-28 00:00:00	terminado	2025-08-28 21:40:38.626	2025-08-28 21:41:18.599	Se renueva estadía de la familia en Hotel Ventura de Chillán por un día	8	terminada
340	193	8	6	2025-08-28 00:00:00	2025-09-05 00:00:00	en_proceso	2025-08-29 13:37:33.666	2025-08-29 13:37:33.666	Orden de detención, entrada y registro. Imputados Raúl Díaz y Natalia Morales 	6	\N
341	201	8	6	2025-08-28 00:00:00	2025-08-28 00:00:00	terminado	2025-08-29 13:43:18.799	2025-08-29 13:43:18.799	Orden de investigar a BRILAC La Serena, se pide complementar el INFORME POLICIAL nro. 47 del 26 de mayo de 2025.	6	Envío vía SITAD orden de investigar a la BRILAC La Serena.
342	193	8	6	2025-08-29 00:00:00	2025-08-29 00:00:00	terminado	2025-08-29 15:34:08.126	2025-08-29 15:34:08.126	Envío correo a ENTEL y CLARO solicitando el tráfico de llamadas de los imputados Raúl Diaz y Diego Burrows.	6	Envío correo a ENTEL y CLARO solicitando el tráfico de llamadas de los imputados Raúl Diaz y Diego Burrows.
343	202	8	6	2025-08-29 00:00:00	2025-08-29 00:00:00	terminado	2025-08-29 16:50:32.33	2025-08-29 16:50:32.33	Envío escrito solicitando interceptación telefónica. 	6	Envío escrito solicitando interceptación telefónica. 
344	203	24	4	2025-08-31 00:00:00	2025-08-31 00:00:00	terminado	2025-09-01 16:03:38.175	2025-09-01 16:03:38.175	ITA 40 Enviado a fiscal, subido a BW y FCD	4	ITA 40 Enviado a fiscal informe temprano de análisis, subido a BW y FCD
345	203	22	4	2025-09-01 00:00:00	2025-09-01 00:00:00	terminado	2025-09-01 16:04:51.21	2025-09-01 16:04:51.21	recopilación y realización de carpeta investigativa para ser usada en control de detención del caso y para equipo de traspaso de ecoh elqui a ecoh limarí	4	recopilación y realización de carpeta investigativa para ser usada en control de detención del caso y para equipo de traspaso de ecoh elqui a ecoh limarí
346	60	10	8	2025-08-29 00:00:00	2025-08-29 00:00:00	terminado	2025-09-01 20:40:52.921	2025-09-01 21:23:15.754	Se contacta a Johann, para informarle que la cuenta de su Banco que él dio estaba errada, por lo cual el banco rechazó el pago, y se tendrá que hacer de nuevo.	8	terminada
347	60	10	8	2025-08-29 00:00:00	2025-08-29 00:00:00	terminado	2025-09-01 20:48:00.67	2025-09-01 21:23:28.814	Se contacta a Marilú para informarles que se extendió la estadía del Hotel hasta el martes, esperando el depósito de la fiscalía para el arriendo de la casa y que se puedan cambiar a ella.	8	terminada
339	60	7	8	2025-08-28 00:00:00	2025-08-29 00:00:00	terminado	2025-08-28 21:41:07.178	2025-09-01 21:23:51.913	Se renueva estadía en Hotel ventura por un día	8	terminada
349	131	10	8	2025-09-01 00:00:00	2025-09-01 00:00:00	terminado	2025-09-01 21:13:29.945	2025-09-01 21:23:36.501	Se Contacta a la Sra Mónica y se le explica el traspaso de caso a la Profesional Paola Jazme, y se solicita información actual de la situación proteccional, señalando la Víctima 108 que no ha recibido ningún tipo de amenaza.	8	terminada
348	60	10	8	2025-09-01 00:00:00	2025-09-01 00:00:00	terminado	2025-09-01 21:10:11.416	2025-09-01 21:23:39.692	Marilú se contacta solicitando poder lavar ropa en el hotel, por lo cual se le solicita vía correo electrónico a Mario Cares, administrador del Hotel Ventura en Chillán que pueda autorizar el lavado de 14 Kilos de ropa, previa autorización de la Jefa de URAVIT Ivonne Alfarez.	8	terminada
\.


--
-- Data for Name: Analista; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Analista" (id, nombre) FROM stdin;
1	Rafael Ramos Aqueda
4	Barbara León Manriquez
5	No Definido
3	Lissette Mujica Inaiman  
2	Liliana Manzano Chávez
\.


--
-- Data for Name: Area; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Area" (id, nombre, descripcion, activo, "createdAt", "updatedAt") FROM stdin;
1	Análisis	Área de análisis de información	t	2024-12-06 09:33:53.868	2024-12-06 09:33:53.868
2	Jurídica	Área jurídica y legal	t	2024-12-06 09:33:53.868	2024-12-06 09:33:53.868
3	Proteccional	Área de protección	t	2024-12-06 09:33:53.868	2024-12-06 09:33:53.868
\.


--
-- Data for Name: Atvt; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Atvt" (id, nombre) FROM stdin;
2	Francisco Barrera
3	Paola Jazme
4	Felipe Ignacio Palma Rojas 
1	Dafnne Gutiérrez
\.


--
-- Data for Name: Causa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Causa" (id, "denominacionCausa", ruc, "fechaDelHecho", rit, "fechaIta", "numeroIta", "fechaPpp", "numeroPpp", observacion, foliobw, "causaEcoh", "causaLegada", "coordenadasSs", "homicidioConsumado", "constituyeSs", "sinLlamadoEcoh", "fechaHoraTomaConocimiento", "comunaId", "analistaId", "fiscalId", "focoId", "delitoId", "abogadoId", "tribunalId", "nacionalidadVictimaId", "esCrimenOrganizado", "atvtId", "causaSacfi", "estadoCausaId") FROM stdin;
12	Pasaje Brasil	2400157209-8	2024-02-06 00:00:00	790-2024	\N	3	2024-02-27 00:00:00	1	Audiencia De Rebeldia Y Sobreseimiento Temporal 07/08/2024 A Las 0830	2024-2-6950	t	f	-29.882364404506045, -71.24215721541569	t	t	\N	\N	7	1	3	1	1	2	1	\N	t	1	f	\N
145	Arrayan Costero	2401618383-7	2024-12-31 00:00:00		\N		\N			\N	t	f		t	f	\N	2024-12-30 23:36:00	\N	4	4	\N	1	4	\N	\N	f	2	f	\N
13	El Camino Amarillo	2400167162-2	2024-02-07 00:00:00	4494-2024	2024-02-08 00:00:00	4	2024-02-27 00:00:00	2	Mc Art 155 Kevin Eduardo Meneses Mundaca Clara Andrea Quintero Lopez \nJorge Manuel Torres Varas\nVerónica Lorena Garcia Zepeda\nC) La Firma Quincenal En Dependencias De La Fiscalía Local De La Serena.\nD) La Prohibición De Salir Del País.\n	2024-2-8875	t	f	-29.914445752634656, -71.22428084661519	t	t	\N	2024-02-08 02:00:00	7	1	1	1	1	2	1	\N	t	1	f	\N
102	DARK BOX (Homicidio Barrio Ingles)	2401526890-1	2024-12-07 00:00:00		2024-12-08 00:00:00	67	2024-12-11 00:00:00		RUC 2401512290-7 y  2401526890-1	2024-12-11759	t	f	 -29.948862074787957, -71.33642911911537	f	t	\N	2024-12-09 01:30:00	\N	1	2	1	1	4	2	\N	t	1	f	\N
74	Copec Socos Ruta 5	2401215056-K	2024-10-07 00:00:00		2024-10-09 00:00:00	53	\N			2024-10-11536	t	f		t	t	f	2024-10-08 03:00:00	\N	2	10	2	2	1	3	\N	f	4	f	\N
23	Cuatrimoto	2400385593-3	2024-04-04 00:00:00		\N	14	\N	0		2024-4-5097	f	f		f	t	\N	2024-04-04 17:50:00	8	1	1	6	4	1	4	\N	\N	1	f	\N
121	SECUESTRO KAMANGA	2500028907-0	2025-01-05 00:00:00		\N	1	2025-01-06 00:00:00		Victima SEBASTIAN ELADIO ESPINOZA ROJO	2025-1-7889	t	f	-29.949714271514672, -71.29584112995501	f	f	\N	2025-01-06 20:00:00	\N	4	1	\N	2	4	2	\N	\N	1	f	\N
151	OTRAS CAUSAS LEGADAS (solo para registro de actividades)	SN	2023-10-31 00:00:00	\N	\N	\N	\N	\N	\N	\N	f	t	\N	f	f	\N	2023-10-26 16:43:00	\N	\N	\N	\N	7	\N	\N	\N	\N	\N	f	\N
42	Homicio Via Publica Illapel	2400487448-6	2024-04-29 00:00:00	487-2024	\N	\N	\N	\N	\N	 2024-4-40052	f	f	-31.631232484199632, -71.16491856261085	t	\N	\N	\N	5	5	6	6	1	6	5	\N	\N	\N	f	\N
43	Salamanca Año Nuevo	2400005713-0	2024-01-02 00:00:00	1-2024	\N	\N	\N	\N	\N	S/N	f	f	-31.785005583411202, -70.96915725098108	t	\N	t	\N	14	5	6	6	1	6	5	\N	\N	\N	f	\N
62	Turbazos	 2400571267-6	2024-05-16 00:00:00	\N	\N	\N	\N	\N	\N	SN	f	t	\N	f	f	f	\N	7	4	2	7	6	4	11	\N	\N	\N	f	\N
64	Didier	 2201249797-4	2022-12-12 00:00:00	\N	\N	\N	\N	\N	\N	SN	f	t	\N	t	f	f	\N	7	3	5	2	1	3	1	\N	\N	\N	f	\N
48	El Carpintero Parque Coll	2400643704-0	2024-06-03 00:00:00	\N	2024-07-03 00:00:00	32	\N	\N	\N	2024-6-3360	t	f	-29.909042, -71.235159	t	t	f	\N	7	2	2	1	1	2	1	\N	\N	\N	f	\N
178	Homicidio Valladares 	2001208715-3	2020-11-28 00:00:00		\N		\N			\N	f	t		t	f	\N	2025-05-10 05:00:00	\N	3	1	\N	1	3	\N	\N	f	1	f	\N
76	Prehistoria	2400911411-0 	2024-10-04 00:00:00	\N	2024-10-04 00:00:00	42	2024-09-11 00:00:00	30	\N	2024-8-4147	t	f	\N	t	t	f	2024-10-04 09:00:00	\N	3	1	1	1	3	1	\N	\N	\N	f	\N
59	Retroexcavadora	 2300552624-8	2023-05-20 00:00:00		\N		\N			sn	f	t		t	f	f	2025-05-20 23:41:00	\N	4	4	6	1	2	11	\N	f	\N	f	\N
19	Rapido Y Furioso	2400318400-1 	2024-03-17 00:00:00	1836-2024	2024-03-18 00:00:00	10	2024-04-09 00:00:00	7		2024-3-22744	t	f	-29.907083065237387, -71.25712968226432	t	t	\N	2024-03-18 00:00:00	7	1	3	1	1	3	1	\N	f	\N	f	\N
31	Blue Rain 	2400478139-9	2024-04-25 00:00:00	2984-2024	\N		2024-05-10 00:00:00	13		2024-4-35494	t	f	-29.91236518953749, -71.25914165869527	t	t	\N	2024-04-25 20:00:00	7	1	4	1	1	2	2	\N	f	1	f	\N
3	El Galpon	2301320508-6	2023-11-29 00:00:00	6032-2023	2023-12-01 00:00:00	4	2023-01-03 00:00:00	4	Plazo De Investigación Vence El 07 De Septiembre 	SN	t	f	-29.956529269502706, -71.33916396062831	t	t	\N	2025-10-10 13:00:00	4	1	3	1	1	3	2	\N	f	3	f	\N
10	Craneo Las Animas	2400115315-K	2024-01-27 00:00:00	2971-2024	2024-01-28 00:00:00	1	\N	0	\N	s/n	f	f	\N	\N	\N	\N	\N	4	3	1	6	4	3	2	\N	\N	3	f	\N
132	El Tatuador	2500383613-7	2025-03-20 00:00:00		\N	12	\N			2025-3-38446	t	f	-29.88262858354313, -71.23049008693694	f	t	\N	2025-03-23 00:40:00	\N	3	11	7	1	4	\N	\N	\N	3	f	\N
61	Pantan	  2300468251-3	2022-12-19 00:00:00		\N		\N			SN	f	t		t	f	f	2022-12-19 20:00:00	8	1	4	4	7	3	11	\N	\N	\N	f	\N
22	Ruleta Rusa Ovalle	2400362167-3	2024-03-31 00:00:00	780-2024	\N	13	2024-04-26 00:00:00	9	Obs.	2024-3-42680	t	f	-30.585982049271426, -71.19954071524707	t	t	\N	2024-03-31 19:00:00	10	3	1	2	1	2	3	\N	f	1	f	\N
11	Suicidio Alfalfares	2400136612-9	2024-01-30 00:00:00	\N	2024-02-01 00:00:00	2	\N	0	\N	s/n	f	f	\N	\N	t	\N	\N	7	4	8	6	4	4	1	\N	\N	2	f	\N
35	Puerto Principal	2300605459-5	2023-06-03 00:00:00	2508-2023	\N	\N	\N	\N	\N	SN	f	t	-29.953861314058038, -71.33682071439725	t	\N	\N	\N	4	3	1	3	1	3	2	\N	\N	3	f	\N
2	River Lider	2301299336-6	2023-11-26 00:00:00	5929-2023	2023-11-27 00:00:00	3	2023-11-27 00:00:00	2	Plazo Vencido 11/09/2024	SN	t	f	-29.96183138648497, -71.26033025328815	f	t	\N	2023-11-27 04:09:00	4	1	3	1	1	3	2	\N	f	3	f	\N
7	El Chuma	2200078130-8	2023-01-22 00:00:00	143-2022	\N	0	\N	0	\N	S/N	f	t	\N	t	\N	\N	\N	10	4	5	3	1	4	3	\N	\N	3	f	\N
60	TDA	 2301049250-5	2023-09-25 00:00:00		\N		\N			sn	f	t		f	f	f	2024-09-26 08:00:00	8	4	2	3	2	4	10	\N	f	2	f	\N
38	Capitan Palta	2400638367-6	2024-06-04 00:00:00		2024-06-06 00:00:00	29	\N		Causa Archivada.	SN	t	f	-30.588382, -71.168617	f	t	\N	2024-06-04 17:00:00	10	2	3	2	1	3	3	\N	f	3	f	\N
44	Homicidio En Riña O Pelea Combarbala	2400141422-0	2024-02-03 00:00:00	86-2024	\N		\N			S/N	f	f	-30.957089834930613, -71.06964820915586	t	f	t	2024-02-03 16:00:00	3	5	9	6	1	7	6	\N	f	\N	f	\N
189	Secuestro CP Huachalalume	S/N	2025-08-08 00:00:00	\N	\N	\N	\N	\N	\N	\N	t	f	\N	f	f	\N	2025-08-08 15:16:00	\N	4	11	\N	2	2	\N	\N	f	2	f	\N
156	Yoyi, Disparos Injustificados	2500660458-K	2010-05-13 00:00:00		\N		\N			\N	f	f		f	f	\N	2025-05-14 01:10:00	\N	3	1	\N	6	3	\N	\N	f	3	f	\N
5	El Choclo	2300966740-7	2023-09-05 00:00:00	5788-2023	\N	0	\N	0		s/n	f	t	-29.887723242884427, -71.13545836444163	t	f	\N	2023-09-08 10:00:00	7	3	1	1	1	7	1	\N	f	1	f	\N
152	Homicidio Punta Mira	2500734223-6	2025-05-28 00:00:00		\N		\N			\N	t	f	-29.99333275315389, -71.32977080329442	t	t	\N	2025-05-28 22:00:00	\N	3	5	\N	1	2	\N	\N	f	1	f	\N
24	El Rito	2400401495-9	2024-04-07 00:00:00		2024-04-08 00:00:00	15	\N	0	No Corresponde A Ecoh	2024-4-12047	f	f		t	t	\N	2024-04-07 14:00:00	8	5	4	6	5	1	4	\N	f	\N	f	\N
18	Homicidio La Diva	2400310135-1 	2024-03-15 00:00:00	665-2024	2024-03-16 00:00:00	9	2024-04-08 00:00:00	6		2024-3-19622	t	f	-30.6018863,-71.2048707	t	t	\N	2024-03-15 17:00:00	10	1	3	2	1	3	3	\N	f	3	f	\N
79	Trafico De Armas	2400505286-2	2024-05-03 00:00:00		\N		\N			SN	f	t		t	f	f	2025-10-10 13:10:00	\N	1	3	7	6	3	11	\N	f	\N	f	\N
63	Maria Jose Zambra	 1900943146-5	2019-08-19 00:00:00		\N		\N			SN	f	t		t	f	f	2025-06-05 20:16:00	7	3	1	6	1	2	11	\N	f	\N	f	\N
57	La Cabaña	2000164821-8	2020-02-11 00:00:00		\N		\N			SN	f	t		t	f	f	2020-02-12 04:01:00	\N	3	1	6	1	2	11	\N	f	\N	f	\N
197	CAIMANES	2300255882-3	2023-03-06 00:00:00		\N		\N			\N	t	f	-32.029990, -71.19689	f	f	\N	2023-03-08 07:00:00	\N	2	10	2	1	1	3	\N	f	4	f	\N
202	LA CATALINA	2500477336-8	2025-04-09 00:00:00	\N	\N	\N	\N	\N	\N	\N	f	f	\N	f	f	\N	2025-04-09 16:46:00	\N	3	5	\N	10	2	\N	\N	f	1	f	\N
32	Fourteen Years	2400481752-0	2024-04-28 00:00:00	2304-2024	2024-04-29 00:00:00	21	2024-05-10 00:00:00	14	Fija Pp Día 30 De Julio De 2024, A Las 10:30 Horas.\n, Se Fija La Audiencia Del Día 13 De Agosto De\n2024, A Las 09:30 Horas, Para Los Efectos De Resolver La Solicitud Formulada Por El \nMinisterio Público.	2024-4-39038	t	f	-29.962807089146086 ,  -71.3336312658804	t	t	\N	\N	4	1	4	1	1	3	2	\N	\N	1	f	\N
40	Zig Zag	2400718295-K	2024-06-23 00:00:00	3605-2024	2024-06-24 00:00:00	31	\N	\N	\N	2024-6-29499	t	f	-29.940638,-71.338623	t	t	\N	\N	4	1	1	1	1	4	2	\N	t	1	f	\N
58	Infiernillo	2210014316-3	2022-03-17 00:00:00	\N	\N	\N	\N	\N	\N	sn	f	t	\N	t	t	f	\N	\N	2	4	3	1	2	5	\N	\N	\N	f	\N
68	Yerba Mala	2401114980-0	2024-09-17 00:00:00	\N	2024-09-17 00:00:00	47	\N	\N	\N	2024-09-25504	t	f	-30.602809644488076, -71.18605210827299	t	t	f	2024-09-17 06:00:00	\N	2	4	2	1	2	11	\N	\N	1	f	\N
55	Caso Avenida Brasil	2400896910-4	2024-07-30 00:00:00	\N	2024-08-02 00:00:00	40	\N	\N	\N	2024-7-42376	t	f	\N	f	t	f	\N	4	3	5	7	4	3	2	\N	\N	\N	f	\N
110	Queridos Vecinos	2401366546-6	2024-11-09 00:00:00	4561-2025	2024-11-09 00:00:00	62	\N		Victima JUAN CARLOS CAMPAÑA SILVA 18566477-5, homicidio frustrado Arma Blanca	2024-11-13798	t	f	-29.88423274182656, -71.21683164082205	f	t	\N	2024-11-09 22:09:00	\N	1	11	1	1	2	1	\N	\N	1	f	\N
88	Arista Causa Zigzag  	2401051803-9	2024-09-04 00:00:00	\N	\N	\N	\N	\N	\N	S/N	t	f	\N	f	f	f	\N	\N	1	4	6	6	4	11	\N	\N	1	f	\N
1	Descuartizado	2301259952-8	2023-11-16 00:00:00	5733-2023	2023-11-18 00:00:00	1	2023-11-28 00:00:00	1	Audiencia Apercibimiento Cierre Para El Día 25-10-24 A Las 1030	S/N	t	f	-29.952580680700397, -71.33547007704335	t	t	\N	2023-11-19 08:32:00	4	1	3	1	1	3	2	\N	\N	1	f	\N
157	BICI SPORT	2300392779-2	2023-04-09 00:00:00	\N	\N	\N	\N	\N	\N	\N	f	t	\N	f	f	\N	2024-12-10 15:00:00	\N	\N	11	\N	6	2	\N	\N	f	\N	f	\N
84	Blanche	2401241347-1	2024-10-14 00:00:00		\N	56	\N		Los hechos configuran un delito consumado de manejo en estado \nde ebriedad con resultado de lesiones graves gravísimas, contenido en el artículo 196 inc. \ntercero en relación con artículo 110 de la Ley del Tránsito N° 18.290, correspondiendo \nparticipación al imputado en calidad de autor conforme al art 15 N° 1 del Código Penal.	2024-10-21642	t	f	-29.932978402906283, -71.24951736765563	t	t	f	2024-10-14 14:30:00	\N	1	3	7	7	2	11	\N	f	1	f	\N
104	ARISTA CASO AMANECER	2401214022-K	2024-10-10 00:00:00		\N		\N		CAUSA ORIGINADA COMO ARISTA EN INVESTIGACION RUC 2400606321-3.	\N	t	f		f	f	\N	2024-10-10 14:12:00	\N	3	1	2	7	2	4	\N	f	1	f	\N
15	 Psje San Gregorio	2400200962-1	2024-02-15 00:00:00	962-2024	2024-02-16 00:00:00	6	\N	4		2024-2-20186	f	f	-29.967782779382713, -71.26186140017585	f	t	\N	2024-11-15 18:57:00	4	4	4	1	1	4	2	\N	f	\N	f	\N
180	Callejón Santa Elena 	2500944863-5	2025-07-09 00:00:00		\N		\N			\N	t	f	-30.0044490,-71.2562200	t	t	\N	2025-07-10 11:01:00	\N	3	5	\N	1	4	\N	\N	t	3	f	\N
53	Homicidio Tia Rica	2400874257-6	2024-07-29 00:00:00	5933-2024	2024-07-30 00:00:00	39	2024-08-09 00:00:00	28	\N	2024-7-38438	t	f	-29.905681147264783, -71.25021150196343	t	t	f	\N	7	3	5	2	1	3	1	\N	\N	3	f	\N
47	Homicidio Club Bellavista	2400795451-0	2024-07-10 00:00:00	2248-2024	2024-07-11 00:00:00	35	2024-07-26 00:00:00	25	\N	2024-7-11747	t	f	\N	t	t	f	\N	10	2	4	2	1	3	3	\N	\N	3	f	\N
179	ROBO CON INTIMIDACIÓN  CONTRA WASHINGTON ADEMAR CAIMANQUE TORRES	2500353765-2	2024-11-22 00:00:00	\N	\N	\N	\N	\N	\N	\N	f	t	\N	f	f	\N	2025-06-02 17:00:00	\N	\N	\N	\N	7	\N	\N	\N	f	\N	f	\N
41	Huachalalume S/N La Serena	2400201951-1	2024-02-15 00:00:00	4304-2024	\N		\N		Muerte En Recinto Penitenciario	s/n	f	f	-29.978487668411763, -71.21665791984894	t	f	\N	2024-02-15 18:00:00	7	1	1	1	1	3	1	\N	\N	\N	f	\N
113	PARRICIDIO CAIMANES	2401517837-6	2024-12-08 00:00:00		2024-12-10 00:00:00	66	\N		IMPUTADO\tIVÁN LUIS MENESES LEYTON\nVICTIMA  MARCIAL DEL CARMEN MENESES CASTRO	2024-12-13031	f	f	-31.92690, -71.13642	t	t	\N	2024-12-09 14:23:00	\N	4	\N	\N	1	2	5	\N	\N	\N	f	\N
86	Diamante Verde	2201180094-0	2022-08-18 00:00:00		\N		\N			S/N	f	t		f	f	f	2023-01-01 09:00:00	\N	1	4	5	7	1	11	\N	f	\N	t	\N
185	Robos Violentos conductores Aplicación	2500870276-7	2025-06-20 00:00:00	\N	\N	\N	\N	\N	\N	\N	f	f	\N	f	f	\N	2025-06-20 04:00:00	\N	4	4	\N	6	4	\N	\N	f	2	t	\N
182	Padre Amador	2500970200-0	2025-07-13 00:00:00		\N		\N			\N	t	f		t	t	\N	2025-07-16 03:30:00	\N	5	6	\N	1	1	\N	\N	f	4	f	\N
109	Arista Amenaza ZIG-ZAG	2400936534-2	2024-08-05 00:00:00		\N		\N		JOSE MANUEL DIAZ OGALDE, CÉDULA DE IDENTIDAD NRO. 18.317.321-9, maniefiesta: OY A VENIR EN PATOTA CON MIS AMIGOS Y TE VOY ,A DEJAR LA CAGA EN TU CASA FEA CULIA, YE VOY A REVENTAR TU CASA FEA CULIA	S/N	t	f		f	f	\N	2024-08-06 12:45:00	\N	3	1	\N	7	4	2	\N	f	1	f	\N
51	El Pipa	2400506928-5	2024-05-04 00:00:00		2024-05-04 00:00:00	24	\N			2024-5-4561	f	f		f	t	f	2024-05-04 17:00:00	4	3	1	7	4	2	2	\N	f	1	f	\N
181	Almirante Riveros	2500961723-2	2025-07-12 00:00:00	5532-2025	\N		\N			\N	t	f		f	f	\N	2025-07-14 16:30:00	\N	1	3	\N	2	2	1	\N	f	2	f	\N
101	VOY VUELVO	2401478411-6	2024-12-02 00:00:00		2024-12-02 00:00:00	64	\N			2024-11-50393	f	f	-29.988177289846007, -71.34130067413275	f	t	\N	2024-12-03 11:35:00	\N	1	3	\N	2	4	2	\N	f	\N	f	\N
93	Sasha, Arista Lavado	2400676896-9	2024-06-16 00:00:00		\N		\N		Causa Heredada De Ecoh 2 Limarí	S/N	t	f		f	f	f	2024-06-16 17:00:00	\N	3	1	3	6	3	1	\N	f	3	f	\N
30	Toma Los Changos 	2400457063-0	2024-04-21 00:00:00		2024-04-22 00:00:00	21	\N	0		2024-4-29775	f	f	-29.883097625415942, -71.23300087413627	f	t	\N	2024-04-23 03:45:00	4	1	3	6	3	4	11	\N	f	2	f	\N
190	Secuestro Rinconada	2501109763-7	2025-08-09 00:00:00		\N	39	\N			\N	t	f	-29.908666, -71.247135	f	f	\N	2025-08-09 15:38:00	\N	1	11	\N	2	2	\N	\N	f	2	f	\N
45	Homicidio Parque Urbano Cerro Grande	2400760588-5	2024-07-03 00:00:00	5012-2024	2024-07-04 00:00:00	33	2024-07-22 00:00:00	22	Se Amplía La Detención Hasta El Día 05 De Julio De 2024, A Las 11:00 Horas, Con El Fin De Realizar La Audiencia De Formalización. 	2024-2803	t	f		t	t	f	2025-10-10 13:10:00	7	1	3	1	1	3	1	\N	f	\N	f	\N
191	Godoy Plaza (sujeto interes)	2401114980-0	2024-09-17 00:00:00	\N	\N	\N	\N	\N	\N	\N	f	f	\N	t	f	\N	2024-09-17 15:00:00	\N	4	4	\N	1	4	\N	\N	f	\N	t	\N
107	Arista Los Tambores	2401113510-9	2024-09-17 00:00:00		\N		\N		Secuestro, ley 20.000 y Ley 17.798, no judicializada, reservada. 	SN	t	f		f	f	\N	2924-09-18 12:56:00	\N	1	11	\N	7	3	\N	\N	f	3	f	\N
115	EL CONQUISTADOR	2401590823-4	2024-12-23 00:00:00		2024-12-26 00:00:00	71	\N		VICTIMA Fernando Antonio Barraza García  16.848.324-4		t	f	-30.600338, -71.196492	t	t	\N	2024-12-23 21:08:00	\N	2	7	2	1	1	3	\N	f	4	f	\N
193	ALTIPLANO - ARISTA S-PRESSO	2500705261-0	2025-03-13 00:00:00	4454 – 2025	\N		\N		La presente investigación forma parte del foco “Altiplano”, destinado a la investigación de bandas criminales e imputados prolíficos, involucrados en el mercado delictual del robo de vehículos motorizados en la Región de Coquimbo, automóviles cuyo destino es el norte del país y/o Bolivia.	\N	f	f		f	f	\N	2025-03-14 18:33:00	\N	3	1	14	6	2	\N	\N	f	1	t	\N
100	BACHELET	2401449381-2	2024-11-26 00:00:00		2024-11-28 00:00:00	63	\N		Caso de feminicidio resultado de una relación de pareja de larga data con componentes de violencia de género.	2024-11-42112	t	f	-30.590562263175, -71.17570719622255	f	t	\N	2024-11-27 17:30:00	\N	2	7	2	1	1	3	\N	t	4	f	\N
174	Secuestro Punitaqui	2500699871-5	2025-05-20 00:00:00		\N		\N			\N	t	f		f	f	\N	2025-05-21 14:00:00	\N	2	10	\N	2	1	\N	\N	f	4	f	\N
198	Padre Amador	2500970200-0	2025-07-13 00:00:00		2025-07-18 00:00:00	36-2025	\N			\N	t	f	-32.11776 S, -71.48911	f	f	\N	2025-07-14 09:30:00	\N	2	12	2	1	1	3	\N	f	4	f	\N
98	Lesiones Graves Tahuinco	2401343200-3	2024-11-03 00:00:00	\N	2024-11-05 00:00:00	61	\N	\N	Lesiones Por Arma De Fuego En Via Publica, Localidad De Tahuinco	2024-11-3274	t	f	-31.789106,  -71.0595362	f	f	f	2024-11-02 22:20:00	\N	2	6	6	3	2	5	\N	\N	\N	f	\N
103	Las Orizas	2401537018-8	2024-12-11 00:00:00	7505-2024	2024-12-12 00:00:00	70	\N			2024-12-18261	t	f	-29.975227121141764, -71.34071677549956	f	t	\N	2024-12-12 07:00:00	\N	1	11	1	1	3	2	\N	\N	1	f	\N
122	HOMICIDIO FRUSTRADO LOURDES	2500041933-0	2025-01-06 00:00:00		\N		\N		Victima JUAN CARLOS TORREJON CARVAJAL	2025-1-8846	t	f	-29.96192370458542, -71.33531882822919	f	t	\N	2025-01-14 06:13:00	\N	\N	\N	\N	3	\N	2	\N	\N	1	f	\N
69	Petardos	2401116347-1	2024-09-18 00:00:00	\N	2024-09-19 00:00:00	48	\N	\N	Homicidio Frustrado	2024-9-27822	t	f	-29.881137407660297, -71.22593074860282	f	t	f	2024-09-18 15:40:00	\N	1	4	2	1	2	11	\N	\N	1	f	\N
124	LIMONES	2500151596-1	2025-01-31 00:00:00		2025-02-01 00:00:00	7	\N			2025-1-55412	t	f	-29.88331616397714, -71.14694073032933	t	t	\N	2025-01-01 15:00:00	\N	1	11	\N	1	2	1	\N	\N	1	f	\N
82	Plaza Barnes	2401233454-7	2024-10-12 00:00:00	\N	2024-10-13 00:00:00	55	\N	\N	\N	2024-10-18875	t	f	-30.26269453238632, -71.49241251293884	t	t	f	2024-10-12 03:30:00	\N	1	3	6	1	3	11	\N	t	1	f	\N
87	Secuestro Yeral	2401120911-0	2024-09-19 00:00:00		\N		\N			S/N	t	f	-29.960896305074534, -71.3494921089392	f	f	f	2024-09-19 22:00:00	\N	3	4	6	2	2	11	\N	f	1	f	\N
130	FEMICIDIO EN LAUTARO No. 951, LA SERENA	2500084816-9	2025-01-18 00:00:00		\N		\N		Caso no informado a ECOH		f	f	-29.90575542576788, -71.24415783999697	t	f	\N	2025-01-18 23:00:00	\N	\N	\N	\N	8	\N	\N	\N	\N	\N	f	\N
175	El Notario	2500801197-7	2025-06-09 00:00:00	\N	\N	\N	\N	\N	\N	\N	t	f	\N	f	f	\N	2025-06-09 12:35:00	\N	2	7	\N	6	1	\N	\N	f	4	f	\N
129	TIO TITO	2500144458-4	2025-01-29 00:00:00		2025-01-29 00:00:00	06-2025	\N		A la espera de informe BH para decidir posible término con fiscal.\nNO ES ECOH	2025-1-50280	f	f	-30.579380785012926, -71.40852592267734 	f	t	\N	2025-01-29 17:00:00	\N	2	\N	\N	4	1	\N	\N	\N	\N	f	\N
72	Calle Almagro	2401163102-5	2024-10-30 00:00:00	8224-2024	2024-10-01 00:00:00	51	2024-10-14 00:00:00	33		2024-09-44715 	t	f	-29.898873957204856, -71.24254781646408	t	t	f	2024-10-30 11:30:00	\N	3	1	1	1	3	1	\N	f	3	f	\N
158	Angelo Adaros 	2500441394-9	2025-03-30 00:00:00		\N		\N			\N	f	t		f	f	\N	2025-03-30 10:15:00	\N	1	3	\N	7	\N	\N	\N	f	\N	f	\N
186	La fiebre del Loco	2501095209-6	2025-08-06 00:00:00		2025-08-07 00:00:00	37	\N			\N	t	f		t	t	\N	2025-08-07 04:00:00	\N	3	1	\N	1	2	\N	\N	f	1	f	\N
95	Brothers	2401308796-9	2024-10-27 00:00:00	\N	2024-10-28 00:00:00	59	\N	\N	\N	2024_10_44394	t	f	-29.965932080636655, -71.2623657538494	f	t	f	2024-10-26 23:01:00	\N	3	1	7	3	3	2	\N	\N	3	f	\N
92	Atentado Contra Sasha Mendieta	2400987629-0	2024-08-18 00:00:00	\N	\N	\N	\N	\N	\t\tI	S/N	t	f	\N	f	f	f	\N	\N	4	1	3	6	3	1	\N	\N	3	f	\N
29	Los Alcatraces 	2400453182-1	2024-04-20 00:00:00	\N	2024-07-21 00:00:00	20	\N	0	\N	2024-4-29076	f	f	\N	\N	t	\N	\N	4	4	3	6	4	4	11	\N	\N	2	f	\N
8	El Sultan	2400263895-5	2020-12-22 00:00:00	\N	\N	0	\N	0	(Homicidios Atribuidos A Banda De Ivan Mendieta 2001215082-3 ; 2001292529-9 ; 2001224076-8 ; 2201249797-4 ; 2301061608-5 ; 2301299336-6 ; 2001239229-0) El Sultan	s/n	f	t	\N	\N	\N	\N	\N	7	4	1	3	6	3	11	\N	\N	3	f	\N
9	Asociacion Ilicita (Onur)	2301166765-1	2023-10-24 00:00:00	7203-2023	\N	0	\N	0	\N	S/N	f	t	\N	\N	\N	\N	\N	7	4	3	3	7	3	1	\N	\N	3	f	\N
94	Sasha, Narcofuneral	2400945768-9	2024-08-07 00:00:00	\N	\N	\N	\N	\N	\N	S/F	t	f	\N	f	f	f	\N	\N	4	1	3	6	3	1	\N	\N	3	f	\N
90	Secuestro La Garza	2401120474-7	2024-09-21 00:00:00		\N		\N			S/N	t	f	-29.965544308343368, -71.3208155692993	f	f	f	2024-09-22 04:00:00	\N	4	4	6	6	4	11	\N	f	\N	f	\N
70	Jote Veloz	2401116349-8	2024-09-18 00:00:00		2024-09-19 00:00:00	49	\N		Homicidio Frustrado	2024-9-27995	t	f	-29.872618789593552, -71.24918637564237	f	t	f	2024-09-18 23:00:00	\N	4	4	1	1	2	11	\N	f	1	f	\N
116	DEPARTAMENTOS ROJOS Cancha 	2401558202-9	2024-12-17 00:00:00		2024-12-18 00:00:00	73	\N		VICTIMA\t15166814-3\tSERGIO ALEJANDRO CASTRO CASTRO\tCHACABUCO No. 1683, POBLACION EL LIBERTADOR, LAS COMPAÑÍAS, LA SERENA\t/ 949911876\t20/03/2001\t24 AÑOS\tCHILE\t\t\n \nVICTIMA\t21366648-7\tFERNANDO EDUARDO MELLA BLAMEY	2024-12-26998	t	f	-29.882178703193674, -71.24253961095063	t	t	\N	2024-12-18 01:29:00	\N	4	2	1	1	4	1	\N	f	2	f	\N
184	asdsadsa	asdasd	2025-01-01 00:00:00	\N	\N	\N	\N	\N	\N	\N	f	f	\N	f	f	\N	2025-01-01 16:00:00	\N	\N	10	\N	8	\N	\N	\N	f	\N	f	\N
120	VA MALITO	2500084971-8	2025-01-19 00:00:00		\N		\N			2025-1-32583	t	f	-29.963020694090165, -71.3319088721105	t	t	\N	2025-01-20 03:45:00	\N	1	3	1	1	2	2	\N	f	3	f	\N
105	Quebrada Venavente	2400119572-3	2023-12-07 00:00:00		\N		\N		INVESTIGACIÓN POR POSIBLE DELITO DE TRÁFICO DE DROGA SY TENENCIA ILEGAL DE ARMAS DE FUEGO POR SUJETOS QUE MANTIENEN DOMICILIO EN QUBERADA DE BENAVENTE.\n\n	S/N	f	f		f	f	\N	2024-01-31 08:00:00	\N	1	3	\N	7	4	2	\N	f	2	f	\N
71	Caleta San Pedro	2401145550-2	2024-09-26 00:00:00		2024-09-27 00:00:00	50	\N			2024-09-39710	t	f	-29.888485654506702, -71.27275446064355	t	t	f	2024-09-27 04:20:00	\N	4	2	1	4	3	2	\N	f	3	f	\N
80	Disparos Injustificados	2400026284-2	2024-01-03 00:00:00		\N		\N			SN	f	t		f	f	f	2025-10-10 13:10:00	\N	1	3	7	6	3	1	\N	f	3	f	\N
192	TOYOTEROS	2500220922-8	2025-08-22 00:00:00	\N	\N	\N	\N	\N	\N	\N	f	f	\N	f	f	\N	2025-08-22 21:00:00	\N	\N	\N	\N	6	\N	\N	\N	f	\N	f	\N
96	Cejitas	2401249787-K	2024-10-15 00:00:00	3562	2024-10-16 00:00:00	57	\N		El imputado adolescente (15 años a la fecha de los hechos) estuvo sujeto a internación provisoria durante toda la tramitación de la causa. Ayer fue condenado en un P. Abreviado como autor de un homicidio simple frustrado y un delito de tenencia ilegal de arma de fuego y municiones; a la pena de 3 años de libertad asistida especial con seguimiento del Control del Servicio Nacional de Reinserción Social Juvenil, comiso del arma y las municiones, sin costas.\nEsta forma de término fue aprobada por el FR.\nSe fijó audiencia para efectos de aprobación de un plan de intervención para el 22/04/2025.\n \n	2024-10-24950	t	f	-30.5872524, -71.1839875	t	t	f	2024-10-16 22:30:00	\N	5	7	2	3	1	3	\N	f	\N	f	\N
128	Villa San Jorge	2500263025-K	2025-02-24 00:00:00		2025-02-25 00:00:00	11	\N			2025-2-42496	t	f	-30.58381658558801, -71.18532022051389	t	t	\N	2025-02-25 08:30:00	\N	2	7	2	1	1	3	\N	f	4	f	\N
97	Las Mulas	2401318113-2	2024-10-29 00:00:00	3707	2024-10-30 00:00:00	60	\N			2024-10-47861	t	f	-308655700. -70.9983060	t	t	f	2024-10-30 01:10:00	\N	2	7	2	1	1	3	\N	t	4	f	\N
73	El Molino 	2401214712-7	2024-10-07 00:00:00		2024-10-09 00:00:00	52	\N			2024-10-11461	t	f		f	t	f	2024-10-08 08:15:00	\N	2	10	2	1	1	3	\N	f	4	f	\N
126	Los Poetas	2500208221-K	2025-02-12 00:00:00		\N	9	\N			2025-1-21886	t	f	-30.58751, -71.18712	t	t	\N	2025-02-14 02:33:00	\N	2	7	\N	1	1	3	\N	f	4	f	\N
199	Disparos 2 temporada	2501066176-8	2025-07-29 00:00:00	\N	\N	\N	\N	\N	\N	\N	t	f	\N	f	f	\N	2025-07-29 20:30:00	\N	2	10	\N	7	1	\N	\N	f	4	f	\N
194	ROBOS CENTRO OVALLE	2300914833-7	2023-08-23 00:00:00	3157-2025	\N		\N			\N	f	t		f	f	\N	2025-08-19 06:26:00	\N	\N	11	\N	6	2	3	\N	f	\N	t	\N
203	Muy muy lejano	2501223243-0	2025-08-30 00:00:00		\N	40	\N			\N	t	f		t	t	\N	2025-08-31 16:00:00	\N	3	12	\N	1	4	\N	\N	f	3	f	\N
112	Arbol Huacho	2401510617-0	2024-12-06 00:00:00		2024-12-07 00:00:00	66	\N		Dos personas sexo masculino, ingresan a zona de recolección de machas, ambos se ahogan. VICTIMA\t\nJUAN PABLO VILCHES OPAZO\n20126954-7 \t\t\t \nEDWIN ALEXANDER BARRUETO BERNAL Colombiano, DNI 1022431484	SN	t	f	-30.285181296656226, -71.51382279397397	f	t	\N	2024-12-06 22:53:00	\N	1	2	\N	4	2	2	\N	\N	1	f	\N
34	Amanecer	2400606321-3	2024-05-28 00:00:00	615-2024	2024-05-29 00:00:00	26	\N		Se Realiza Primer Intento De Detencion Del Suejto, Este No Fue Encotnrado, El Sujeto Se Saca La Tobillera De Control Telematico, Victima En Estado Reservado Fuera De Riesgo Vital	2024-5-33753	t	f	-31.315369749246468, -71.3502919660111	t	t	\N	2025-03-29 03:09:00	2	1	11	2	1	2	4	\N	t	1	f	\N
14	Homicidio Blest Gana	2400175742-K	2024-02-08 00:00:00	602-2024	2024-02-10 00:00:00	5	2024-02-28 00:00:00	3		 2024-2-10380	t	f	-30.609202571431066, -71.20035706449339	t	t	\N	2024-02-09 04:00:00	10	1	11	2	1	2	3	\N	t	1	f	\N
49	Homicidio Dr.	2400795108-2	2024-07-11 00:00:00	5321-2024	2024-07-12 00:00:00	36	2024-07-29 00:00:00	26	 Audiencia De Prueba Anticipada, La Que Se Fija Para El Día 31 De Julio De 2024, A Las 10 00\nHoras.	2024-7-13677	t	f		t	t	f	2025-10-10 13:10:00	7	4	4	1	1	3	1	\N	f	3	f	\N
165	Enfermera 419	2500509056-6	2025-04-11 00:00:00		\N		\N			\N	t	f		f	f	\N	2025-04-12 05:00:00	\N	1	3	\N	4	4	\N	\N	f	3	f	\N
200	Lesionado Carlos	2501066153-9	2025-07-28 00:00:00		\N		\N			\N	t	f		f	f	\N	2025-07-29 10:15:00	\N	2	10	2	3	1	3	\N	f	4	f	\N
155	SECUESTRO ISLON	2500715271-2 	2025-05-22 00:00:00	\N	\N	\N	\N	\N	\N	\N	t	f	\N	f	f	\N	2025-05-22 22:00:00	\N	1	11	\N	2	3	\N	\N	f	1	f	\N
172	Quebrada Talca	2510003382-0	2024-12-08 00:00:00		\N		\N		2401512240-0	\N	t	f		f	f	\N	2024-12-08 20:00:00	\N	1	2	\N	4	2	\N	\N	t	1	f	\N
149	LA CONQUISTA	2500624819-8	2025-05-04 00:00:00		2025-05-05 00:00:00	N° 23-2025	\N			\N	t	f	-29.883880032195155, -71.24500907572023	f	t	\N	2025-05-06 02:30:00	\N	3	1	\N	1	3	\N	\N	f	1	f	\N
150	Jhon Guns (Juanito Pistola)	2500697261-9	2025-05-20 00:00:00		\N		\N			\N	t	f		t	t	\N	2025-05-21 09:00:00	\N	1	11	\N	1	2	1	\N	t	3	f	\N
125	SKATEPARK	2500186248-3	2025-02-09 00:00:00		2025-02-10 00:00:00	8	\N		VICTIMA ES HERIDA CON MULTIPLES DISPAROS POR ARMA DE FUEGO DENTRO DE UN VEHICULO Y ES LLEVADO POR AMIGOS A URGENCIA DE HOSPITAL DE COQUIMBO, DONDE FALLECE A LOS MINUTOS	2025-2-15015	t	f	-29.958886103649178, -71.3140136876281	t	t	\N	2025-02-10 21:30:00	\N	4	11	1	1	3	2	\N	t	1	f	\N
81	Trata De Personas	2200065681-3	2022-01-19 00:00:00	5001-2022	\N		\N			SN	f	t		t	f	f	2025-10-10 13:10:00	\N	1	3	7	7	3	1	\N	f	3	f	\N
78	La Bendicion	2400291853-2	2024-03-02 00:00:00	1936-2024	\N		\N			SN	f	t	-30.627093174676986, -71.66282091331993	t	f	f	2024-03-02 07:00:00	\N	1	3	7	2	3	3	\N	f	\N	f	\N
27	Secuestro El Delivery	2400417889-7	2024-04-08 00:00:00	3669-2024	2024-04-12 00:00:00	18	2024-05-02 00:00:00	10		2024-4-14893	t	f	-29.92472279876936, -71.25899316208688	f	t	\N	2024-04-08 16:00:00	7	4	4	1	2	2	1	\N	f	2	f	\N
89	Secuestro Reversa	2401016211-0	2024-08-28 00:00:00		\N	43	\N			SN	t	f	-29.906651504288273, -71.25169635557822	t	t	f	2024-08-29 01:00:00	\N	4	4	1	2	2	1	\N	f	2	f	\N
162	Robo de motocicletas	2500582595-7	2025-06-18 00:00:00		\N		\N			\N	f	t		f	f	\N	2025-05-24 22:20:00	\N	3	1	\N	6	\N	\N	\N	f	\N	f	\N
153	 I Love You	2500751265-4 	2025-05-29 00:00:00		2025-05-30 00:00:00	29	\N			\N	t	f		t	t	\N	2025-05-31 12:55:00	\N	1	3	\N	1	2	1	\N	f	2	f	\N
163	Villa el Tangue	2500857130-1	2025-06-22 00:00:00	\N	\N	\N	\N	\N	\N	\N	t	f	\N	f	t	\N	2025-06-22 16:30:00	\N	1	2	\N	4	3	\N	\N	f	1	f	\N
148	Secuestro Janequeo	2500582540-K	2025-04-28 00:00:00		2025-04-29 00:00:00	2025-20	\N			\N	t	f	-29.9453007212905, -71.34342513917159	f	t	\N	2025-04-29 12:00:00	\N	1	2	\N	2	3	\N	\N	f	2	f	\N
168	Drogas Montepatria	2500603543-7	2025-05-02 00:00:00	\N	\N	\N	\N	\N	\N	\N	t	f	\N	f	f	\N	2025-05-03 13:00:00	\N	2	7	\N	6	1	\N	\N	f	4	f	\N
170	El Pistolero de Punitaqui	2500672409-7	2025-05-14 00:00:00	\N	\N	\N	\N	\N	\N	\N	t	f	\N	f	f	\N	2025-05-14 20:00:00	\N	2	10	\N	6	1	\N	\N	t	4	f	\N
171	CAUSA ESNNA	2500788240-0	2025-06-08 00:00:00	\N	\N	\N	\N	\N	\N	\N	f	t	\N	f	f	\N	2025-06-08 15:32:00	\N	4	\N	\N	7	\N	\N	\N	f	\N	f	\N
176	Disparos 1º Temporada	2500759787-0	2025-05-30 00:00:00		\N		\N			\N	t	f	-30.610514, -71.198594	f	f	\N	2025-05-31 06:00:00	\N	2	10	2	3	1	3	\N	f	4	f	\N
169	Las migajas	2500615690-0	2025-05-06 00:00:00	\N	\N	\N	\N	\N	\N	\N	t	f	\N	f	f	\N	2025-05-06 05:10:00	\N	\N	\N	\N	6	\N	\N	\N	f	\N	f	\N
195	Receptacion vehiculo altp	2501027675-9	2025-07-25 00:00:00	\N	\N	\N	\N	\N	\N	\N	f	t	\N	f	f	\N	2025-08-27 14:00:00	\N	3	1	\N	7	2	\N	\N	f	\N	f	\N
66	El Maradona	2401033687-9	2024-08-31 00:00:00	7026-2024	2024-10-02 00:00:00	45	2024-10-14 00:00:00	32	\N	2024-8-42601	t	f	\N	t	t	f	2024-10-31 01:30:00	\N	3	5	1	1	3	1	\N	\N	3	f	\N
167	Secuestro Ovalle	2500537920-5	2025-04-17 00:00:00		\N		\N			\N	t	f		f	f	\N	2025-04-18 21:00:00	\N	2	10	\N	2	1	\N	\N	f	4	f	\N
187	Disparos en Enrique Molina Garmendia	2500943227-5	2025-07-08 00:00:00		\N		\N			\N	f	f	-29.929230845180026, -71.24062607586492	f	f	\N	2025-08-08 14:00:00	\N	1	3	\N	12	3	\N	\N	f	\N	t	\N
173	Secuestro 3 Pisos	2500701240-6	2025-05-17 00:00:00	\N	\N	\N	\N	\N	\N	\N	t	f	\N	f	f	\N	2025-05-21 19:00:00	\N	4	11	\N	2	2	\N	\N	t	2	f	\N
164	Secuestro El Palqui	2500691598-4	2025-05-19 00:00:00		\N		\N			\N	t	f		f	f	\N	2025-05-19 16:00:00	\N	2	7	\N	2	1	\N	\N	f	4	f	\N
166	Reto Sotaquí	2500407970-4	2025-03-26 00:00:00		\N		\N			\N	t	f		f	f	\N	2025-03-26 23:25:00	\N	2	10	\N	3	1	\N	\N	f	4	f	\N
4	Secuestro La Herradura	2301344616-4	2023-12-05 00:00:00	6101-2023	2023-12-07 00:00:00	5	2024-01-03 00:00:00	5	\N	S/N	t	f	-29.97311751876197, -71.3686963026747	\N	t	\N	\N	4	4	3	1	2	4	2	\N	\N	2	f	\N
67	La Calera	2401035420-6	2024-08-31 00:00:00	\N	2024-09-02 00:00:00	46	\N	\N	\N	2024-8-43192	t	f	\N	f	t	f	\N	\N	3	5	1	4	3	11	\N	\N	3	f	\N
52	Cariño Malo	2400873685-1	2024-07-27 00:00:00	\N	2024-07-30 00:00:00	38	2024-08-09 00:00:00	27	\N	2024-7-35984	t	f	-29.872185902852195, -71.23384535557469	t	t	f	\N	7	3	5	2	4	3	1	\N	\N	3	f	\N
54	Los Tambores	2400911606-7	2024-08-03 00:00:00	4400-2024	2024-08-05 00:00:00	41	2024-09-11 00:00:00	29	La Victima Se Encuentra En Recuperación En El Hospital De Coquimbo	2024-8-3644	t	f		f	t	f	2024-08-04 16:00:00	4	3	11	1	1	3	2	\N	\N	3	f	\N
159	Guanaqueros 2C yahir	2500643428-5	2025-05-11 00:00:00		\N		\N			\N	t	f		t	f	\N	2025-05-11 17:30:00	\N	3	1	\N	1	4	\N	\N	f	3	f	\N
21	Secuestro El Paseo	2400358806-4	2024-03-27 00:00:00	1636-2024	2024-03-29 00:00:00	12	2024-04-10 00:00:00	12	Martes 30 De Abril Audiencia De Revisión De Prisión Preventiva. \nViernes 03 De Mayo Audiencia De Revisión De Plazo De Investigación 	2024-3-37818	t	f	-29.961799027831596, -71.25595182960566	\N	t	\N	\N	4	4	1	1	2	4	2	\N	\N	2	f	\N
16	Homicidio Frustrado Vertedero	2400246746-8	2024-02-28 00:00:00	\N	\N	7	\N	0	No Corresponde A Ecoh	s/n	f	f	\N	f	t	\N	\N	4	4	1	6	1	4	2	\N	\N	2	f	\N
17	Homicidio El Caddie	2400283076-7	2024-03-11 00:00:00	1310-2024	2024-03-12 00:00:00	8	2024-04-08 00:00:00	5		2024-3-12550	t	f	-29.979544333528263, -71.28849316425519	t	t	\N	2024-03-11 07:30:00	4	4	2	1	1	4	2	\N	t	2	f	\N
6	El Pucho	2300191687-4	2023-02-18 00:00:00	741-2023	\N	0	\N	0		S/N	f	t		t	f	\N	2023-11-02 00:40:00	4	4	1	3	1	4	2	\N	\N	2	f	\N
39	Kamikaze	2400688944-8	2024-06-16 00:00:00	4443-2024	2024-06-17 00:00:00	30	2024-06-19 00:00:00	20	La Segunda Victima Corresponde A Alexander Rigoberto Pereira Maldonado. Rut: 21.450.371-9	2024-6-20293	t	f	-29.932962536752097, -71.28156611077749	t	t	\N	\N	7	4	2	1	1	4	1	\N	\N	2	f	\N
46	Homicidio Alfalfares	2400764779-0	2024-07-03 00:00:00	5026-2024	2024-07-04 00:00:00	34	\N	\N	\N	2024-7-2920	t	f	\N	t	t	f	\N	7	4	2	1	1	4	1	\N	\N	2	f	\N
85	Rescate En El Barrio Chino	2401283440-K	2024-10-23 00:00:00	8741-2024	2024-10-24 00:00:00	58	\N	\N	Otra Victima Weibin Ye Rut N° 21.335.055-2	 2024-10-37412	t	f	-30.022499, -71.256133	t	t	f	2024-10-22 23:16:00	\N	4	4	1	2	4	1	\N	\N	2	f	\N
75	Brasil 715	2401222264-1	2024-10-08 00:00:00		2024-10-10 00:00:00	54	\N			2024-10-13050	t	f		f	t	f	2024-10-09 03:00:00	\N	4	4	1	1	4	1	\N	\N	2	f	\N
83	La Nota	2401068872-4	2024-09-07 00:00:00	\N	2024-09-09 00:00:00	47	\N	\N	\N	2024-9-10402	t	f	\N	f	t	f	2024-09-07 12:25:00	\N	4	3	7	4	4	1	\N	\N	2	f	\N
111	SECUESTRO LOS GALGOS	2401484971-4	2024-12-02 00:00:00		2024-12-10 00:00:00	65	\N		VICTIMA FABIAN PATRICIO HEYER ARIAS Y  NICOLAS ALFONSO MACIAS MARIN 16.468.371-0, 15.909.557-6, AMBOS CHILENOS	2024-12-3020	t	f	-29.902984, -71.252451	f	t	\N	2024-12-03 05:41:00	\N	4	3	1	2	4	1	\N	\N	2	f	\N
117	CAJITA FELIZ (LESIONES GRAVES)	2401008147-1	2024-08-23 00:00:00		2024-09-04 00:00:00	44	\N		VICTIMA\t21831682-4\tALEXANDER MANUEL CANTILLANA FERNÁNDEZ\nABOGADO QUERELLANTE\t11823822-2\tMARCELO RAFAEL GALVEZ TORRES	2024-8-30670	t	f	-29.96830918226281, -71.307144667906	f	t	\N	2024-08-23 16:52:00	\N	4	2	1	3	4	2	\N	\N	2	f	\N
91	Los Chinos (Arista Los  Primos)	2401056625-4	2023-12-02 00:00:00	\N	\N	\N	\N	\N	\N	S/N	t	f	\N	f	f	f	\N	\N	4	4	6	7	2	11	\N	\N	2	f	\N
119	ARISTA LOS PRIMOS 2 SACFI ECOH IV REGIÓN\t	2401205766-7	2024-01-01 00:00:00		\N		\N			S/N	t	f		f	f	\N	2024-10-09 00:00:00	\N	4	1	\N	7	4	\N	\N	\N	2	f	\N
36	Los Salamanca Secuestro	2400627403-6	2024-06-01 00:00:00	1763-2024	2024-06-04 00:00:00	27	\N		Audiencia De Cautela De Garantías \nPara El Día 31 De Julio De 2024, A Las 10:30 Horas, A Fin De Debatir El Eventual Traslado Del Imputado Álvaro Alejandro Castillo Araya A Un Recinto Penitenciario Diverso	2024-6-2152	t	f	 -30.574055, -70.880010	f	t	\N	2024-06-02 09:00:00	13	1	2	2	2	4	3	\N	t	2	f	\N
108	MERCEDES	2401609236-K	2024-12-29 00:00:00		2024-12-30 00:00:00	72	\N		VICTIMAS. JOAQUÍN RODRIGO PUELLES CARRAZANA, RUN  20006271-K, Nacionalidad Chilena, quien ingresa 18:15 y IGNACIO ALEJANDRO ROBLEDO, RUN: 19207388-K, Nacionalidad Chilena, quien ingresa a 18:16.	2024-12-48634	t	f	-29.9694195854504, -71.32914874937038	t	t	\N	2024-12-30 16:30:00	\N	1	4	1	1	2	2	\N	\N	2	f	\N
146	CUATRO ESQUINAS	2500533481-3	2025-04-20 00:00:00		\N		\N			\N	t	f	-29.9311855,-71.2649015	t	t	\N	2024-04-21 13:00:00	\N	4	11	\N	1	2	\N	\N	\N	2	f	\N
161	Abuelita Algarrobito	2500112328-1	2025-01-23 00:00:00	\N	\N	\N	\N	\N	\N	\N	t	f	\N	f	f	\N	2025-01-23 15:00:00	\N	4	2	\N	4	2	\N	\N	f	2	f	\N
77	La Vendetta	2400315064-6	2024-03-18 00:00:00	697-2024	\N		\N			2024-3-23214	t	f		t	f	f	2024-03-18 20:30:00	\N	2	3	1	2	3	3	\N	\N	2	f	\N
37	Noche De Furia	2400638256-4	2024-06-04 00:00:00	4062-2024	2024-06-05 00:00:00	28	2024-06-14 00:00:00	19	Imputada Mariangela Del Carmen Gonzalez Carrasco, Formalizada 06-06-2024 Se Fija Un Plazo De Investigación De 105 Días.	2024-64187	t	f	-29.910005786914976, -71.2571304528157	t	t	\N	2024-12-04 06:00:00	7	4	2	1	1	4	1	\N	t	2	f	\N
28	El Pantano	2400421251-3	2024-04-11 00:00:00	2382-2024	2024-04-13 00:00:00	19	2024-05-03 00:00:00	12	\N	2024-4-17839	t	f	-29.963015777147724, -71.33175263163861	t	t	\N	\N	4	3	1	1	1	3	2	\N	t	3	f	\N
154	Villa Mar	2500782590-3	2025-06-06 00:00:00		2025-06-06 00:00:00	30-2025	\N			\N	t	f	-30.20046, -71.41676	f	t	\N	2025-06-07 14:00:00	\N	3	4	\N	4	4	\N	\N	\N	3	f	\N
177	Enjoy	2500822466-0	2025-06-13 00:00:00	\N	\N	\N	\N	\N	\N	\N	f	f	\N	f	f	\N	2025-06-13 05:27:00	\N	2	10	\N	6	1	\N	\N	f	4	f	\N
56	 Los Palos	2110027265-K	2021-06-23 00:00:00		\N		\N			SN	t	t		f	f	f	2023-11-01 18:53:00	\N	4	1	3	1	4	11	\N	f	2	f	\N
137	El Parcero	2500462072-3	2025-04-06 00:00:00		\N		\N			 2025-4-11598	t	f		t	t	\N	2025-04-08 05:00:00	\N	1	11	\N	1	3	\N	\N	f	3	f	\N
26	El Pacto	2400415743-1	2024-04-09 00:00:00	526-2024	2024-07-12 00:00:00	17	2024-05-02 00:00:00	11		2024-4-14606	t	f	-31.775866, -70.991556	t	t	\N	2024-04-11 09:50:00	8	4	4	2	1	4	1	\N	f	2	f	\N
123	Entrega Huamalata	2500113437-2	2025-01-23 00:00:00		2025-01-24 00:00:00	06-2025	\N			2025-1-41216	t	f	-30.546595196026807, -71.15536506960899	t	t	\N	2025-01-24 04:01:00	\N	1	2	\N	1	4	\N	\N	t	2	f	\N
147	La escalera	2500561752-1	2025-04-23 00:00:00		2025-04-25 00:00:00	19	\N			\N	t	f		t	t	\N	2025-04-24 01:40:00	\N	4	11	\N	1	2	\N	\N	t	2	f	\N
131	IN DOOR  (LOS LIRIOS ANTENA)	2500120025-1	2025-01-23 00:00:00		2025-02-23 00:00:00	2	\N		VICTIMA\t14159251-3\tLUIS ALBERTO HERRERA HERRERA	2025-1-39966	t	f	-29.908366977949733, -71.22722441191655	t	t	\N	2025-01-24 14:30:00	\N	1	3	\N	1	3	1	\N	t	2	f	\N
188	Plaza La Salud	2501108746-1	2025-08-08 00:00:00		\N		\N			\N	f	f	-30.598598, -71.199159	f	t	\N	2025-08-09 06:52:00	\N	2	10	\N	3	1	3	\N	f	4	f	\N
65	Habitación 4	2401018273-1	2024-08-27 00:00:00		2024-08-28 00:00:00	42	\N			2024-8-36429	t	f	-29.9483452, -71.2898534	f	t	f	2024-08-27 13:25:00	\N	3	1	1	4	4	2	\N	f	2	f	\N
118	AÑO NUEVO VICUÑA	2500001177-3	2025-01-01 00:00:00		\N		\N			2025-1-173	t	f	-30.03001804630685, -70.71872847945293	f	f	\N	2025-01-02 05:30:00	\N	4	4	\N	1	2	8	\N	f	2	f	\N
25	El Limpiaparabrisas	2400401487-8	2024-04-08 00:00:00	3172-2024	2024-04-09 00:00:00	16	\N	0		2024-4-12015	t	f	-29.912596425993183, -71.22270705596885	t	t	\N	2024-04-10 05:30:00	7	3	1	1	1	4	1	\N	f	2	f	\N
33	Los Primos	2301338343-K	2024-05-10 00:00:00		2024-05-10 00:00:00	25	\N		Agrupado A Ruc 2301338343-K	2024-5-9268	t	f	 -30.219930, -71.363011	f	t	\N	2025-01-16 23:00:00	4	3	1	1	4	4	2	\N	f	2	f	\N
127	HOMICIDIO HUMEDAL	2500236545-9	2025-02-18 00:00:00		2025-02-10 00:00:00	10	\N			2025-2-31263	t	f	-29.960710, -71.324055	t	t	\N	2025-02-19 20:00:00	\N	1	11	\N	1	4	2	\N	f	3	f	\N
50	Kilometro 512	2400812129-6	2024-07-13 00:00:00	5476-2024	2024-07-15 00:00:00	37	\N			2024-7-16541	t	f	-29.608625,-71.259354	t	t	f	2024-07-13 17:00:00	6	3	1	1	4	4	1	\N	f	2	f	\N
133	SALAMANCA HOMICIDIO	2400846903-9	2024-06-01 00:00:00		\N		\N				t	f		t	f	\N	2024-06-02 14:00:00	\N	4	2	\N	1	4	\N	\N	f	2	f	\N
196	JARDINERO	2500242992-9	2025-02-01 00:00:00	\N	\N	\N	\N	\N	\N	\N	f	f	\N	f	f	\N	2025-02-12 17:12:00	\N	3	5	\N	6	2	\N	\N	f	1	t	\N
201	HERMANOS PINTO CANELA	2500041588-2	2025-01-01 00:00:00	\N	\N	\N	\N	\N	\N	\N	f	f	\N	f	f	\N	2025-02-21 12:40:00	\N	3	5	\N	6	2	\N	\N	f	1	t	\N
\.


--
-- Data for Name: CausaOrganizacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CausaOrganizacion" (id, "organizacionId", "causaId", "fechaAsociacion", observacion, "createdAt", "updatedAt") FROM stdin;
1	12	36	2025-03-31 21:00:00-03	sujetos son relacionados segun declaración de un testigo reservado	2025-04-01 18:16:37.25-03	2025-04-01 18:16:37.25-03
2	6	86	2025-03-31 21:00:00-03	\N	2025-04-01 18:22:09.611-03	2025-04-01 18:22:09.611-03
3	7	118	2025-03-31 21:00:00-03	\N	2025-04-01 18:22:36.538-03	2025-04-01 18:22:36.538-03
4	12	123	2025-03-31 21:00:00-03	Sujeto de Interes, José Abreu	2025-04-01 20:20:06.657-03	2025-04-01 20:20:06.657-03
5	13	60	2025-04-15 20:00:00-04	\N	2025-04-16 15:16:58.741-04	2025-04-16 15:16:58.741-04
\.


--
-- Data for Name: CausasCrimenOrganizado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CausasCrimenOrganizado" ("causaId", "parametroId", estado) FROM stdin;
144	5	t
144	2	t
144	1	t
144	4	t
144	6	t
150	6	t
150	5	t
150	1	t
150	8	t
150	2	t
150	4	t
198	4	t
31	8	t
31	5	t
198	8	t
198	5	t
198	3	t
198	6	t
198	1	t
182	6	t
182	8	t
182	4	t
182	3	t
199	5	t
199	8	t
199	6	t
199	4	t
176	6	t
176	8	t
176	5	t
176	2	t
200	6	t
200	8	t
197	5	t
197	3	t
197	4	t
125	7	t
125	6	t
125	4	t
125	8	t
72	7	t
72	6	t
72	5	t
72	4	t
72	8	t
197	1	t
197	8	t
148	1	t
148	4	t
147	8	t
147	1	t
147	5	t
147	2	t
147	6	t
131	7	t
131	6	t
131	5	t
131	4	t
131	8	t
203	8	t
203	3	t
180	3	t
180	8	t
180	5	t
149	8	t
152	5	t
152	3	t
152	4	t
24	6	t
24	3	t
24	8	t
145	8	t
145	1	t
181	5	t
181	4	t
181	3	t
181	8	t
190	6	t
193	1	t
193	5	t
128	5	t
128	4	t
126	5	t
126	4	t
126	2	t
126	8	t
\.


--
-- Data for Name: CausasImputados; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CausasImputados" ("causaId", "imputadoId", "cautelarId", "fechaFormalizacion", formalizado, esimputado, "essujetoInteres", plazo) FROM stdin;
21	2	\N	2024-03-29 00:00:00	t	f	f	30
21	3	1	2024-03-30 00:00:00	t	t	f	90
1	4	1	2023-12-06 00:00:00	t	t	f	120
61	53	\N	\N	f	t	f	0
2	51	\N	\N	f	f	t	0
12	22	5	\N	f	t	f	0
13	21	1	2024-06-27 00:00:00	t	t	f	100
13	23	3	2024-06-27 00:00:00	t	t	f	100
17	20	1	2024-03-15 00:00:00	t	t	f	150
22	19	2	2024-04-04 00:00:00	t	t	f	90
24	40	1	2024-04-07 00:00:00	t	t	f	90
27	16	\N	\N	f	f	t	0
27	17	\N	\N	f	f	t	0
28	15	\N	2024-10-29 00:00:00	t	t	f	90
31	13	6	\N	t	t	f	120
31	14	6	\N	t	t	f	120
34	12	1	2024-09-08 00:00:00	t	t	f	120
35	11	\N	\N	f	f	t	0
36	10	1	2024-06-04 00:00:00	t	t	f	120
37	8	1	2024-06-06 00:00:00	t	t	f	90
37	9	\N	\N	f	f	t	0
35	55	\N	\N	f	f	t	0
39	7	1	2024-06-19 00:00:00	t	t	f	120
42	41	1	2024-08-02 00:00:00	t	t	f	90
43	35	1	2024-01-03 00:00:00	t	t	f	90
44	36	1	2024-02-03 00:00:00	t	t	f	90
46	28	1	2024-07-04 00:00:00	t	t	f	180
49	32	1	2024-07-13 00:00:00	t	t	f	120
49	33	1	2024-07-13 00:00:00	t	t	f	120
53	38	1	2024-07-29 00:00:00	t	t	f	50
53	39	1	2024-07-29 00:00:00	t	t	f	50
54	42	1	2024-08-08 00:00:00	t	t	f	160
54	43	1	2024-08-08 00:00:00	t	t	f	160
54	56	\N	2024-08-08 00:00:00	t	t	f	160
65	44	\N	\N	f	f	t	0
66	45	1	2024-08-31 00:00:00	t	t	f	100
85	48	1	2024-10-23 00:00:00	t	t	f	120
96	49	2	2024-10-17 00:00:00	t	t	f	60
97	50	1	2024-10-30 00:00:00	t	t	f	90
100	57	1	2024-11-26 00:00:00	t	t	f	120
102	66	1	2024-12-11 00:00:00	t	t	f	90
54	70	1	2024-12-19 00:00:00	t	t	f	90
86	60	\N	\N	f	t	f	0
86	71	\N	\N	f	t	f	0
86	72	\N	\N	f	t	f	0
86	58	\N	\N	f	t	f	0
86	59	\N	\N	f	t	f	0
86	73	\N	\N	f	t	f	0
86	74	\N	\N	f	t	f	0
86	75	\N	\N	f	t	f	0
86	76	\N	\N	f	t	f	0
86	77	\N	\N	f	t	f	0
86	78	\N	\N	f	f	t	0
86	79	\N	\N	f	t	f	0
86	80	\N	\N	f	t	f	0
86	81	\N	\N	f	t	f	0
86	82	\N	\N	f	t	f	0
86	83	1	\N	t	t	f	0
86	84	1	\N	t	t	f	0
86	85	1	\N	t	t	f	0
86	86	1	\N	t	t	f	0
86	87	1	\N	t	t	f	0
86	88	1	\N	t	t	f	0
86	89	1	\N	t	t	f	0
86	90	1	\N	t	t	f	0
148	163	1	2025-04-29 00:00:00	t	t	f	90
132	130	1	2025-04-22 04:00:00	t	t	f	60
128	126	1	2025-02-26 00:00:00	t	t	f	90
108	94	1	2025-01-09 00:00:00	t	t	f	90
108	91	1	2025-01-09 00:00:00	t	t	f	90
123	122	1	2025-05-06 04:00:00	t	f	t	90
40	30	1	2025-03-07 00:00:00	t	t	f	50
130	128	1	2025-01-20 00:00:00	t	t	f	0
125	129	\N	\N	f	f	t	0
36	140	\N	\N	f	f	t	0
36	141	\N	\N	f	f	t	0
36	142	\N	\N	f	f	t	0
123	140	6	\N	f	f	t	0
117	93	1	2025-04-02 03:00:00	t	t	f	60
60	151	1	2024-04-17 00:00:00	t	t	f	150
145	143	6	\N	t	t	f	0
145	144	1	2025-04-10 00:00:00	t	t	f	0
145	145	1	2025-04-10 00:00:00	t	t	f	0
3	6	3	2024-03-23 00:00:00	t	t	f	90
103	68	3	2024-12-26 00:00:00	t	t	f	90
103	69	1	2024-12-26 00:00:00	t	t	f	90
14	100	1	2025-01-01 00:00:00	t	t	f	80
26	101	\N	\N	f	f	t	0
14	54	1	2025-01-06 00:00:00	t	t	f	80
2	5	1	2024-08-02 00:00:00	t	t	f	40
34	102	1	2025-01-08 00:00:00	t	t	f	180
31	103	\N	\N	f	f	t	0
118	95	\N	\N	f	f	t	0
60	147	1	2024-04-17 00:00:00	t	t	f	150
60	155	1	2024-04-17 00:00:00	t	t	f	150
131	161	1	2025-04-16 00:00:00	t	t	f	150
102	67	6	2024-12-09 00:00:00	t	t	f	0
133	140	1	2025-04-04 00:00:00	t	t	f	150
32	1	2	2024-05-01 00:00:00	t	f	f	60
76	37	5	2024-10-04 00:00:00	t	t	f	0
131	162	1	2025-04-16 00:00:00	t	t	f	150
82	106	1	2025-01-15 00:00:00	t	t	f	90
47	109	1	2024-09-12 00:00:00	t	t	f	90
111	104	1	2024-12-03 00:00:00	t	t	f	90
120	111	1	2025-01-21 00:00:00	t	t	f	95
120	112	1	2025-01-21 00:00:00	t	t	f	95
45	29	1	2024-11-08 00:00:00	t	t	f	90
123	123	\N	\N	f	f	t	0
78	158	1	2024-10-18 00:00:00	t	t	f	150
147	164	\N	\N	f	f	t	0
72	46	1	2024-10-11 00:00:00	t	t	f	150
82	47	5	2025-01-13 00:00:00	t	t	f	150
82	127	\N	2025-03-12 00:00:00	t	t	f	150
82	159	6	2025-01-31 00:00:00	t	t	f	0
82	160	1	2024-12-04 00:00:00	t	t	f	150
115	92	\N	2024-12-27 03:00:00	t	t	f	150
137	165	1	2025-04-07 00:00:00	t	t	f	90
146	166	4	2025-05-20 00:00:00	t	t	f	120
150	168	\N	\N	f	f	t	0
5	177	7	2024-10-05 03:00:00	t	t	f	0
150	167	1	2025-06-02 04:00:00	t	t	f	90
150	170	\N	\N	f	f	t	0
110	172	\N	\N	f	t	f	0
110	173	\N	\N	f	t	f	0
84	174	\N	\N	f	t	f	0
152	175	1	2025-05-29 04:00:00	t	t	f	90
6	176	4	2025-02-13 03:00:00	t	t	f	90
5	178	7	\N	t	t	f	0
5	179	\N	\N	f	t	f	0
5	180	6	\N	t	t	f	0
5	181	7	\N	t	t	f	0
156	182	\N	\N	f	t	f	0
159	183	5	\N	t	t	f	0
148	195	1	2025-06-24 04:00:00	t	t	f	90
164	196	1	2025-05-20 04:00:00	t	t	f	0
149	167	\N	\N	f	f	t	0
149	170	\N	\N	f	f	t	0
85	199	\N	\N	f	f	t	0
85	200	\N	\N	f	f	t	0
155	198	1	2025-07-03 04:00:00	t	t	f	60
180	201	\N	\N	f	f	t	0
156	202	\N	\N	f	f	t	0
124	125	1	2025-07-15 04:00:00	t	t	f	90
124	124	1	2025-07-15 04:00:00	t	t	f	90
181	207	1	2025-07-17 04:00:00	t	t	f	50
181	208	1	2025-07-17 04:00:00	t	t	f	50
181	209	1	2025-07-17 04:00:00	t	t	f	50
181	210	1	2025-07-17 04:00:00	t	t	f	50
181	211	1	2025-07-17 04:00:00	t	t	f	50
148	203	1	2025-08-19 04:00:00	t	t	f	90
186	213	\N	\N	f	f	t	0
187	214	\N	\N	f	t	f	0
186	212	1	2025-08-07 04:00:00	t	t	f	0
186	215	1	2025-08-13 04:00:00	t	t	f	120
193	216	\N	\N	f	t	f	0
193	217	\N	\N	f	t	f	0
193	218	\N	\N	f	t	f	0
194	219	\N	\N	f	t	f	0
113	220	\N	\N	f	t	f	0
168	221	\N	\N	f	t	f	0
198	101	\N	\N	f	f	t	0
198	223	\N	\N	f	f	t	0
196	224	\N	\N	f	t	f	0
202	225	\N	\N	f	t	f	0
203	226	1	2025-09-01 04:00:00	t	t	f	0
203	227	1	2025-09-01 04:00:00	t	t	f	0
\.


--
-- Data for Name: CausasRelacionadas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CausasRelacionadas" (id, "causaMadreId", "causaAristaId", "fechaRelacion", observacion, "tipoRelacion") FROM stdin;
6	4	105	2024-12-20 19:19:53.646	Investigación por posible delito de tráfico de droga sy tenencia ilegal de armas de fuego por sujetos que mantienen domicilio en quberada de benavente.\n\n	\N
7	77	78	2024-12-20 19:23:34.78	RIT 1936-2024. JG de Ovalle “La Bendición”, Fiscal FS ECOH 3, Robo con violencia, porte de partes o piezas de arma de fuego, receptación, porte de municiones. Judicializada, formalizada imputado en PP, plazo vigente.	\N
8	8	93	2024-12-20 20:39:44.721	RIT 9061-2024 JG La Serena “Caso sultán arista lavado de activos” ECOH3 Judicializada, no formalizada, reservada	\N
9	8	94	2024-12-20 20:40:37.626	NarcoFuneral Pareja hijo	\N
10	8	92	2024-12-20 20:40:55.824	Atentado a Sasha Mendieta	\N
11	54	107	2024-12-20 20:43:37.554	POR FEMICIDIO JAMIE ALFARO HERRERA ECOH-SACFI IV REGION COQUIMBO  \t	\N
12	40	109	2024-12-30 19:37:16.169	Amenzasas en contra de la testigo	\N
13	40	88	2024-12-30 19:37:46.231	Causa por porte de arma de fuego	\N
14	33	91	2025-01-16 17:58:53.73	Arista armas y drogas	\N
15	33	119	2025-01-16 18:08:33.043	Arista arma y drogas los primos 	\N
\.


--
-- Data for Name: CausasVictimas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CausasVictimas" ("causaId", "victimaId") FROM stdin;
152	1
150	2
6	3
27	6
73	7
74	8
74	9
97	10
97	11
115	16
100	15
100	14
113	13
115	17
115	18
128	19
128	20
126	21
126	22
166	23
167	24
169	25
169	26
164	27
174	28
175	29
175	30
176	31
176	32
60	33
19	34
146	35
63	10
173	36
125	37
181	39
181	38
127	5
186	53
190	54
17	4
25	56
26	57
56	58
37	59
39	62
39	63
197	64
197	12
113	65
198	66
200	67
133	60
133	61
117	68
89	69
75	70
85	71
85	72
90	73
108	74
108	75
118	76
118	77
145	78
123	79
131	80
147	81
148	83
203	84
203	85
\.


--
-- Data for Name: Cautelar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Cautelar" (id, nombre) FROM stdin;
1	Prisión preventiva
2	Internación provisoria
3	Privación de libertad domiciliaria
4	Solicitud de extradición\n
5	Otras
6	Orden de Detención
7	Sentencia Condenatoria
\.


--
-- Data for Name: Comuna; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Comuna" (id, nombre) FROM stdin;
1	Andacollo
2	Canela
3	Combarbalá
4	Coquimbo
5	Illapel
6	La Higuera
7	La Serena
8	Los Vilos
9	Monte Patria
10	Ovalle
11	Paihuano
12	Punitaqui
13	Río Hurtado
14	Salamanca
15	Vicuña
\.


--
-- Data for Name: CorrelativoTipoActividad; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CorrelativoTipoActividad" (id, numero, sigla, "tipoActividad", usuario, "createdAt") FROM stdin;
2	1	ITA	24	1	\N
3	1	ITA	24	1	\N
1	31	ITA	24	1	2025-06-23 17:21:45.16
5	1	RM	3	1	2025-06-23 20:04:09.345
6	1	RA	5	4	2025-06-23 20:44:10.609
7	2	RA	5	4	2025-06-23 20:44:13.292
8	1	IPA	9	1	2025-06-26 13:27:30.402
9	2	IPA	9	1	2025-06-26 13:27:33.915
10	3	IPA	9	1	2025-06-26 13:27:38.554
11	15	IEAED	25	1	2025-06-26 13:29:29.525
12	11	GA\n	1	1	2025-06-30 20:04:19.822
13	12	GA\n	1	3	2025-06-30 20:10:32.477
14	16	IEAED	25	1	2025-07-01 14:07:46.243
15	17	IEAED	25	1	2025-07-01 14:20:01.118
16	1	IEED	2	1	2025-07-07 21:04:18.088
17	2	IEED	2	1	2025-07-07 21:04:19.817
18	3	IEED	2	1	2025-07-07 21:04:21.264
19	4	IEED	2	1	2025-07-07 21:04:23.191
20	2	RM	3	1	2025-07-09 20:45:57.311
21	18	IEAED	25	1	2025-07-11 15:44:52.715
22	32	ITA	24	1	2025-07-14 19:00:39.738
23	33	ITA	24	1	2025-07-14 19:00:42.882
24	34	ITA	24	1	2025-07-17 14:30:40.055
25	35	ITA	24	1	2025-07-17 14:30:59.004
26	4	IPA	9	1	2025-07-18 16:11:15.35
27	36	ITA	24	1	2025-07-21 13:15:45.769
28	3	RA	5	1	2025-07-23 21:26:59.449
29	19	IEAED	25	1	2025-07-24 12:51:38.524
31	1	ICGD	26	4	2025-07-25 19:10:26.284
32	2	ICGD	26	4	2025-07-25 19:10:29.165
33	13	GA\n	1	4	2025-07-28 21:59:21.852
34	1	AI	27	2	2025-07-29 17:13:14.849
35	20	IEAED	25	2	2025-07-31 23:44:42.909
36	37	ITA	24	4	2025-08-07 09:42:06.683
37	38	ITA	24	3	2025-08-11 14:19:26.051
38	39	ITA	24	3	2025-08-11 14:19:30.76
39	1	IAED	23	2	2025-08-11 21:33:41.538
40	21	IEAED	25	2	2025-08-11 21:33:55.723
41	22	IEAED	25	2	2025-08-17 02:43:45.234
42	23	IEAED	25	2	2025-08-17 02:43:48.954
43	4	RA	5	4	2025-08-19 16:02:14.675
44	24	IEAED	25	2	2025-08-20 16:31:36.443
45	2	IAED	23	2	2025-08-27 22:11:33.18
46	25	IEAED	25	2	2025-08-27 22:11:47.034
47	3	ICGD	26	2	2025-08-27 22:47:06.567
48	3	IAED	23	4	2025-08-29 14:29:59.564
49	40	ITA	24	4	2025-08-31 19:32:51.924
50	41	ITA	24	4	2025-09-01 16:11:02.455
\.


--
-- Data for Name: CrimenOrganizadoParams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CrimenOrganizadoParams" (value, label, descripcion) FROM stdin;
7	Capacidad de Adaptación\n	Habilidad para modificar operaciones según presión policial Renovación de miembros y roles Diversificación de métodos y rutas
6	Métodos de Control\n	Uso sistematico de violencia o amenazas Sistemas de disciplina interna Mecanismos de proteccion contra infiltracion Control territorial o sectorial\n
5	Relaciones y Conexiones	Vinculos con otros grupos criminales Conexiones con funcionarios publicos o autoridades Redes de proteccion o complicidad Infiltracion en estructuras legales o empresariales\n
4	Aspectos Económicos	Volumen de las ganancias ilicitas Mecanismos de lavado de dinero Inversiones en negocios legitimos como fachada Control de mercados o territorios\n
3	Alcance y Complejidad	Extension geografica de las operaciones Diversificacion de actividades delictivas Capacidad logistica y recursos empleados Uso de tecnologia y metodos sofisticados\n
2	Permanencia Temporal	Duracion sostenida de la actividad criminal Continuidad operativa mas alla de un solo acto delictivo Patrones recurrentes de actividad\n
1	Estructura y Jerarquía	Existencia de roles definidos y niveles jerarquicos dentro del grupo Sistema de toma de decisiones y cadena de mando identificable Division especializada de tareas y funciones entre miembros\n
8	Impacto Social	Afectación a la seguridad publica Influencia en la comunidad local Capacidad de corrupción institucional\n
\.


--
-- Data for Name: Delito; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Delito" (id, nombre) FROM stdin;
1	Homicidio
2	Secuestro
3	Lesiones Graves
4	Hallazgo de Cadaver\n
5	Parricidio
6	Varios Delitos
7	No Definido
8	Femicidio
9	Parricidio
10	Trafico de Drogas
11	Tenencia de municiones
12	Tenencia de Armas\n
13	Robo en lugar habitado
14	Receptación
15	Robo con intimidación
\.


--
-- Data for Name: Fiscal; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Fiscal" (id, nombre) FROM stdin;
1	Eduardo Yañez Muñoz
2	Carlos Vidal Mercado
3	Freddy Salinas Salinas
4	Nicolás Nicoreanu Rodrigo
5	Ricardo Soto Molina
6	Andrés Villalobos Squella
7	Herbert Rodhe
8	Juan Pablo Torrejón  Silva
9	Rocío Valdivia Delgado
10	Rodrigo Gomez del Pino
11	Nicolás Zolezzi
12	Lady Dubó
\.


--
-- Data for Name: Foco; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Foco" (id, nombre) FROM stdin;
1	ECOH Elqui
2	ECOH Limarí/Choapa
3	Calles Peligrosas
4	PANTAN
5	Diamante Verde
6	No Aplica
7	No definido
8	MOTOCHORROS
9	ECOH 2025
10	NOVELA TURCA
11	BUENOS MUCHACHOS
12	PRIMERA TEMPORADA
13	Huachalalume
14	Altiplano
\.


--
-- Data for Name: Fotografia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Fotografia" (id, url, filename, "esPrincipal", "createdAt", "updatedAt", "imputadoId") FROM stdin;
12	/uploads/60dc4282-a04b-4f53-8e8d-011fb6194eeb.jpg	Matias_Contreras.jpg	t	2024-12-18 15:05:10.799	2024-12-18 15:05:10.799	68
13	/uploads/c2b902ff-4b3d-4888-8f81-a1105b03a32d.jpg	brandon cortes.jpg	t	2024-12-18 15:09:25.114	2024-12-18 15:09:25.114	69
14	/uploads/c1654352-13cf-4820-96bd-470379dd50ad.JPG	GABRIEL PEREZ ARANDA 18986492-2.JPG	t	2024-12-19 20:35:35.555	2024-12-19 20:35:35.555	60
15	/uploads/81fc78c7-ef92-48c4-a3a2-44f6279e9302.jpg	Ricardo Guzman Rojas Araya 14.429.167-0.jpg	t	2024-12-19 20:36:54.5	2024-12-19 20:36:54.5	71
16	/uploads/7244658f-d843-4e3f-b931-b54ad9191b39.JPG	MATIAS RAUL ROJAS ARANDA.JPG	t	2024-12-19 20:37:37.148	2024-12-19 20:37:37.148	72
17	/uploads/52b58287-93c3-4593-a835-d04a82efa785.jpg	johan Ariel perez guerra.jpg	t	2024-12-19 20:38:27.197	2024-12-19 20:38:27.197	58
18	/uploads/15721779-cc66-40a4-b4c9-fc3334f2cb41.JPG	JUAN PIZARRRO PIZARRO 13.360.306-9.JPG	t	2024-12-19 20:38:45.606	2024-12-19 20:38:45.606	59
19	/uploads/2312ad6a-27fb-4164-9700-cf55f82e93e2.JPG	JAVIERA ESTEFANIA MARCELA ALFARO ANDRADE 20091133-4.JPG	t	2024-12-19 20:39:40.417	2024-12-19 20:39:40.417	73
20	/uploads/6a717dd0-8ad3-474d-ba0f-31401c20cb48.JPG	PATRICIA JACQUELINE ARANDA GALLEGUILLOS 15044133-1.JPG	t	2024-12-19 20:40:41.588	2024-12-19 20:40:41.588	74
21	/uploads/1600339b-69c6-4bc5-92b0-28f7a0ce179b.JPG	MARINA ISABEL ARANDA GALLEGUILLOS 12098280-K.JPG	t	2024-12-19 20:41:13.569	2024-12-19 20:41:13.569	75
22	/uploads/bde3bde3-d221-4137-b765-1abf991ab10b.jpg	PEDRO ABEL ARANDA GALLEGUILLOS.jpg	t	2024-12-19 20:41:45.153	2024-12-19 20:41:45.153	76
23	/uploads/1a28dd56-8027-45b9-b28f-236bf98fcfbe.jpg	12098285-0.jpg	t	2024-12-19 20:42:51.179	2024-12-19 20:42:51.179	77
24	/uploads/40e5352a-2b8a-429e-84a4-0e6aafd3edf8.jpg	nelson pizarro pizarro.jpg	t	2024-12-19 20:43:32.273	2024-12-19 20:43:32.273	78
25	/uploads/183f3a3e-7801-46c8-8f15-e7fdeaee9a9a.JPG	CECILIA SOLEDAD PIZARRO PIZARRO.JPG	t	2024-12-19 20:45:09.083	2024-12-19 20:45:09.083	79
26	/uploads/21a3073a-4cc2-4eb8-815e-ba98d81f2d64.JPG	MERCEDES LUISA PIZARRO PIZARRO.JPG	t	2024-12-19 20:45:57.1	2024-12-19 20:45:57.1	80
27	/uploads/52c6a248-15cc-46ca-bf98-b49fcdcea75f.jpg	tyare muñoz aranda 20.092.441-K.jpg	t	2024-12-19 20:46:29.197	2024-12-19 20:46:29.197	81
28	/uploads/927458e7-ba69-45f2-ac46-2c6034e16428.jpg	diana muñoz aranda 19.944.832-3.jpg	t	2024-12-19 20:47:03.302	2024-12-19 20:47:03.302	82
29	/uploads/68507759-ebdb-4de5-88f0-23da2b088a77.jpg	freddy antonio zepeda gomez.jpg	t	2024-12-19 20:47:45.255	2024-12-19 20:47:45.255	83
30	/uploads/eee73f48-e608-41c0-b782-7b2f3551fad9.JPG	ALVARO ZEPEDA GOMEZ.JPG	t	2024-12-19 20:49:03.271	2024-12-19 20:49:03.271	84
31	/uploads/b18957d7-5649-4c87-a05e-725c15b0a455.JPG	SANDRA CAROLINA GOMEZ ALFARO.JPG	t	2024-12-19 20:49:51.027	2024-12-19 20:49:51.027	85
32	/uploads/823a84ae-c4c9-4cb1-8279-79c5471b82b6.JPG	RAQUE ROJAZ DIAZ.JPG	t	2024-12-19 20:50:50.844	2024-12-19 20:50:50.844	86
34	/uploads/6a9e7743-dca6-4a4d-ba38-836d43e38a68.jpg	diego 20193475-3.jpg	t	2024-12-19 20:53:19.264	2024-12-19 20:53:19.264	87
35	/uploads/0eafec75-a783-44c3-a028-b1af5b584625.jpg	CRIST CRISTOPHER BALCAZAR JOFRE 17656092-4.jpg	t	2024-12-19 20:54:40.997	2024-12-19 20:54:40.997	88
36	/uploads/f4fe0833-0bd9-4871-a506-d6edd778af5e.jpg	ivan gonzalez 18986172-9.jpg	t	2024-12-19 20:56:01.833	2024-12-19 20:56:01.833	89
37	/uploads/7062973b-9cae-4546-b9f6-99ad5b2513f9.jpg	luis alfonso espindola.jpg	t	2024-12-19 20:57:13.445	2024-12-19 20:57:13.445	90
38	/uploads/9fdd60bc-adfd-4592-8d3b-834d18215ab9.jpg	pasten navea.jpg	t	2024-12-24 13:14:53.294	2024-12-24 13:14:53.294	4
39	/uploads/77af5695-7b09-44c9-97d4-6a86eb309276.jpg	enzo.jpg	t	2024-12-30 14:57:23.952	2024-12-30 14:57:23.952	91
40	/uploads/6f7e3ece-2642-49b3-bb09-0f3b6a6ed64e.jpg	aladino.jpg	t	2024-12-31 14:41:02.251	2024-12-31 14:41:02.251	92
41	/uploads/653370a0-6215-4f98-8cd7-0326d3ba0a40.jpg	dilan.jpg	t	2024-12-31 14:58:26.774	2024-12-31 14:58:26.774	93
42	/uploads/63b09e14-92a2-4ea5-8dd8-010177669ac9.jpg	daniel salfate.jpg	t	2024-12-31 16:25:01.522	2024-12-31 16:25:01.522	94
43	/uploads/4029dcc9-fdc8-4266-8545-f5d1be9d3a52.jpg	elpita.jpg	t	2025-01-01 14:43:46.315	2025-01-01 14:43:46.315	95
44	/uploads/59887fbd-c423-42d8-9b59-79449f459e19.jpg	otro.jpg	t	2025-01-01 14:44:03.835	2025-01-01 14:44:03.835	96
45	/uploads/b95e7c1d-8c25-4cf9-af09-60aba35a0c44.jpg	carlos gonzalez.jpg	t	2025-01-01 14:46:23.36	2025-01-01 14:46:23.36	97
46	/uploads/c3c07ab7-1972-4385-8aaf-9a896a7f0a5a.jpg	diego rojas.jpg	t	2025-01-01 14:50:12.752	2025-01-01 14:50:12.752	98
47	/uploads/0669d9de-d905-45f0-ad14-473edc0df1bd.JPG	FRANCO ALEJANDRO.JPG	t	2025-01-01 15:02:26.027	2025-01-01 15:02:26.027	99
48	/uploads/e4d5a276-106a-4928-a50b-8456f63662d2.jpg	Paul Michea.jpg	t	2025-01-02 14:13:16.848	2025-01-02 14:13:16.848	100
49	/uploads/a3a98be3-b17c-480e-9432-09dc0ef052c8.jpg	46492248_106166727074355_5951916243723223040_n.jpg	f	2025-01-02 14:13:52.783	2025-01-02 14:13:52.783	100
50	/uploads/99be6576-a159-4aaa-9cea-d1dfa7edce00.jpg	46511246_112512369773124_2292956174590410752_n.jpg	f	2025-01-02 14:13:55.861	2025-01-02 14:13:55.861	100
51	/uploads/a3e80ee3-f3d6-49be-8057-b6690e3b6fef.JPG	21118618-6.JPG	t	2025-01-02 19:04:37.736	2025-01-02 19:04:37.736	101
52	/uploads/e8a7cfa6-459a-4c43-906f-2f5c95e5f223.jpg	20840292-7.jpg	t	2025-01-02 20:19:07.75	2025-01-02 20:19:07.75	102
53	/uploads/8fb20231-6d36-4675-bf75-6d18875c6333.JPG	JAVIER ISIDRO MARQUEZ.JPG	t	2025-01-03 13:53:49.29	2025-01-03 13:53:49.29	50
54	/uploads/e2083759-5793-4bb3-8685-19ee8f29a5c6.jpg	lucas.jpg	t	2025-01-06 19:24:19.645	2025-01-06 19:24:19.645	54
55	/uploads/af8f4989-f283-445f-aa6e-490603515ce7.jpg	2fa159ad-1fa9-4a17-9b92-9584f3578f58.jpg	f	2025-01-06 19:26:04.493	2025-01-06 19:26:04.493	54
56	/uploads/407c85d7-2c38-4207-94fa-fbe5dfebfd73.jpg	3e273f36-482a-4c24-8da1-860a50a5b788.jpg	f	2025-01-06 19:26:04.54	2025-01-06 19:26:04.54	54
57	/uploads/3a0cbf9f-6fec-44ac-a9fa-f15628455b7e.jpg	9b5794f6-80cc-452a-b6fd-c26e0c67cd3d.jpg	f	2025-01-06 19:26:04.588	2025-01-06 19:26:04.588	54
58	/uploads/3292967d-7eb0-40db-b8d4-9df3d5bd8c32.jpg	JORFAN JOSE RUIZ SANCHEZ.jpg	t	2025-01-07 19:52:23.907	2025-01-07 19:52:23.907	67
59	/uploads/77b9f06a-aabe-4842-8740-14560afda5cb.jpg	francisco javier.jpg	t	2025-01-08 13:01:03.973	2025-01-08 13:01:03.973	12
60	/uploads/6e1c51a3-1659-44d4-80fc-0252cbe89ddb.jpg	Marlon.jpg	f	2025-01-09 17:37:02.573	2025-01-09 17:59:58.62	13
63	/uploads/e55bfd2f-ebd5-4510-a493-07e34b911139.png	Harol.png	t	2025-01-09 18:10:02.661	2025-01-09 18:10:02.661	103
62	/uploads/3f3fb8a5-2301-4e6f-a424-086dcd22a70b.png	marlon.png	t	2025-01-09 17:59:56.537	2025-01-09 17:59:58.624	13
64	/uploads/6d4cc815-434d-4f93-866d-40f82cfe2b98.png	blas.png	t	2025-01-09 18:10:36.14	2025-01-09 18:10:36.14	14
65	/uploads/c9d66f74-7960-444f-8546-28133a015476.jpg	franco bravo vigorena.jpg	f	2025-01-13 22:05:18.055	2025-01-13 22:05:18.055	99
66	/uploads/1e6fe080-1d9f-4325-af8c-bd1de9e6988f.jpg	ricardo ruiz.jpg	t	2025-01-15 15:18:28.862	2025-01-15 15:18:28.862	105
68	/uploads/7e48d660-1e99-4dda-b708-12d0d06f9dd7.jpg	Franco Reyes.jpg	t	2025-01-15 15:35:19.646	2025-01-15 15:35:25.006	106
67	/uploads/2726da79-76bd-47cb-a0fc-bc05e1cb3892.jpg	franco reyes Facebook.jpg	f	2025-01-15 15:35:19.508	2025-01-15 15:35:25.005	106
69	/uploads/4f619da6-d3b0-46d1-835e-3610d08d6737.JPG	GIANCARLO ALVAREZ MILLA.JPG	t	2025-01-15 20:00:14.936	2025-01-15 20:00:14.936	107
70	/uploads/2f4120f2-7fdc-47b6-a17a-f3a220e1bbf0.jpg	JESUS MOLINA.jpg	t	2025-01-15 20:24:10.947	2025-01-15 20:24:10.947	108
71	/uploads/6ecd9cf7-a043-476a-bd8f-704ec403b7c4.jpg	50026192_240104340213517_698016787865796608_n.jpg	f	2025-01-16 12:48:35.911	2025-01-16 12:48:35.911	95
72	/uploads/4f83e9e1-180f-48da-892b-3559bcf7f595.jpg	64286957_328772504680033_5979614367556042752_n.jpg	f	2025-01-16 12:48:44.207	2025-01-16 12:48:44.207	95
73	/uploads/a5c112e5-c09d-456f-86be-b37b485c859d.jpg	64913102_332103467680270_2436782092323913728_n.jpg	f	2025-01-16 12:48:47.323	2025-01-16 12:48:47.323	95
74	/uploads/16a5f13d-d634-4735-9d15-aaf9c9657752.jpg	vhcarreno.jpg	t	2025-01-21 12:27:35.096	2025-01-21 12:27:35.096	111
75	/uploads/eaad7c70-f345-499e-9025-302041b9f019.jpg	claudio lazcano.jpg	t	2025-01-21 12:29:44.112	2025-01-21 12:29:44.112	112
76	/uploads/0bb5fb0a-4f01-44fe-97b2-bc23da1a0753.jpg	Hugo Perez.jpg	t	2025-01-21 14:55:39.724	2025-01-21 14:55:39.724	113
77	/uploads/1b0ee53f-f6e8-4b92-bbe4-5963ba5049ab.jpg	298833161_115972634538469_2727191804694300346_n.jpg	f	2025-01-21 14:57:14.246	2025-01-21 14:57:14.246	113
78	/uploads/85b4a0d1-c9e0-4417-90b4-6e459719b0fe.jpg	383466378_292229430246121_2451925934206409547_n.jpg	f	2025-01-21 14:57:35.542	2025-01-21 14:57:35.542	113
79	/uploads/205d03c4-1f72-458f-915e-9285dad32cb9.jpg	469680045_1258013962107343_6531121551176684669_n.jpg	f	2025-01-21 14:59:28.84	2025-01-21 14:59:33.053	114
80	/uploads/79a1062d-8111-42ef-b827-acdb2feba505.jpg	Karin.jpg	t	2025-01-21 14:59:28.914	2025-01-21 14:59:33.059	114
81	/uploads/15efae09-ea37-4d68-9212-602ceed956f4.jpg	134364251_407856223789792_6351875947363401215_n.jpg	f	2025-01-21 15:00:19.915	2025-01-21 15:00:19.915	114
82	/uploads/ffcddb87-be37-429e-904a-69678603b40f.jpg	CESAR.jpg	t	2025-01-21 15:02:50.027	2025-01-21 15:02:50.027	115
83	/uploads/d8cc513b-b2c7-47e7-bacd-36fb385de2d0.jpg	464953820_8838826359494335_7155049218314371206_n.jpg	f	2025-01-21 15:03:55.539	2025-01-21 15:03:55.539	115
84	/uploads/36685f44-f4c9-44b1-81e7-a72af92cea13.jpg	464957266_8837726896270948_3783714380505710861_n.jpg	f	2025-01-21 15:03:55.607	2025-01-21 15:03:55.607	115
85	/uploads/d799b94a-7976-41ba-bf37-5368b9f890d8.jpg	Fernanda Oordenes.jpg	t	2025-01-21 15:04:31.561	2025-01-21 15:04:31.561	116
86	/uploads/eeca2def-8c0b-475c-ad4f-82c27ad94207.png	Captura de pantalla 2025-01-20 172222.png	f	2025-01-21 15:34:07.484	2025-01-21 15:34:13.059	117
87	/uploads/4e53eb7c-f22c-4f19-91ea-fe60740e1af9.jpg	Imagen2.jpg	t	2025-01-21 15:34:07.554	2025-01-21 15:34:13.061	117
88	/uploads/3f79880a-62dd-4e9a-8cc7-9a590e02717c.JPG	GREGORIO.JPG	t	2025-01-21 15:35:46.899	2025-01-21 15:35:46.899	118
89	/uploads/7464ac6a-e1c9-4f2f-8842-55d1c833c46c.JPG	JUAN ANTONIO PINTO LOPEZ.JPG	t	2025-01-21 15:38:16.11	2025-01-21 15:38:16.11	119
90	/uploads/6d6a8264-e096-48f3-a60b-3088c5d73362.jpg	68667417_2516613075057341_7369061915881897984_n.jpg	f	2025-01-21 15:59:49.093	2025-01-21 16:03:22.098	121
91	/uploads/cf364f99-a888-4152-9dfa-37b7565a4eea.png	Captura de pantalla 2025-01-20 172110.png	f	2025-01-21 15:59:49.163	2025-01-21 16:03:22.098	121
92	/uploads/a63c7297-c3db-403f-a462-536e44dd9847.png	marilyn.png	t	2025-01-21 15:59:49.226	2025-01-21 16:03:22.101	121
93	/uploads/4b801e7e-7596-4cf9-939b-2d93b5681dd5.jpg	18381207-6.jpg	t	2025-01-30 12:28:03.074	2025-01-30 12:28:03.074	123
94	/uploads/5fd2f28a-d003-4c1f-adf7-f276da637ac3.jpg	26107347-1.jpg	t	2025-01-30 12:28:26.313	2025-01-30 12:28:26.313	122
95	/uploads/4ef1e724-a4d6-4b0b-bc75-3b580b70d77f.jpg	emanuelfb1.jpg	f	2025-01-30 12:29:54.661	2025-01-30 12:29:54.661	122
96	/uploads/20275f95-46fd-41a3-9e2e-e55a06b94ad9.jpg	emanuelfb2.jpg	f	2025-01-30 12:29:54.72	2025-01-30 12:29:54.72	122
97	/uploads/208db626-f22f-41fc-b995-abc08a79fd16.JPG	23646762-7.JPG	t	2025-02-03 12:44:25.817	2025-02-03 12:44:25.817	125
98	/uploads/6e9c14b5-c8ba-4eb2-bbcb-51a008913328.JPG	20098486-2.JPG	t	2025-02-03 12:45:28.976	2025-02-03 12:45:28.976	124
99	/uploads/c7cf7471-adf7-4887-80e9-c73d77166205.jpg	17712493-1.jpg	t	2025-02-28 17:59:50.664	2025-02-28 17:59:50.664	126
100	/uploads/ea40b661-4289-4a6c-8ddb-3b190ad5bb03.JPG	20406242-0.JPG	t	2025-03-04 15:27:12.528	2025-03-04 15:27:12.528	127
101	/uploads/7b0158f4-ba79-479e-8d83-dd8cb2abfa74.jpg	19771110-8.jpg	t	2025-03-19 18:11:06.543	2025-03-19 18:11:06.543	129
102	/uploads/2695a1fc-1be4-46c8-b4cf-5c6f1a23c2be.jpg	esteban villegas.jpg	t	2025-03-20 20:12:27.432	2025-03-20 20:12:27.432	130
103	/uploads/da208497-7649-47e5-9e61-86c8d5139aca.jpg	Fmb.jpg	t	2025-03-22 18:21:11.856	2025-03-22 18:21:11.856	131
104	/uploads/dd0648c5-775d-4b36-b87b-4d3b07b62127.jpg	464618959_8665675856860458_3331941513368230169_n.jpg	f	2025-03-22 18:22:27.073	2025-03-22 18:22:27.073	131
105	/uploads/3428a6a7-8ba2-4bec-bb6c-e3d95cf818f8.jpg	34638444_1770298493064930_1785404045087735808_n.jpg	f	2025-03-22 18:22:31.564	2025-03-22 18:22:31.564	131
106	/uploads/d02077c7-6a34-45a0-a442-48162c21fc0b.jpg	19948892-9.jpg	t	2025-03-22 18:24:55.915	2025-03-22 18:24:55.915	132
107	/uploads/8aa55153-7bf4-4e25-9667-fa2fb82949b5.jpg	19450254-0.jpg	t	2025-03-22 18:27:36.121	2025-03-22 18:27:36.121	134
108	/uploads/f628eed5-758e-4a89-a3ff-63fe2c2cc06a.jpg	458209247_8042556469176145_5771164961886927922_n.jpg	f	2025-03-22 18:29:13.983	2025-03-22 18:29:13.983	134
109	/uploads/837173b7-86e4-4b69-9eda-360cca225c62.jpg	21064999-9.jpg	t	2025-03-22 18:33:34.413	2025-03-22 18:33:34.413	135
110	/uploads/c3f7164c-6b50-4da0-b7e5-359a6512a07d.jpg	19.947.659-9.jpg	t	2025-03-22 18:49:04.747	2025-03-22 18:49:04.747	138
111	/uploads/a1047310-3321-47e5-a8d6-12ab915ea0d8.jpg	21788533-7.jpg	t	2025-03-22 18:49:31.552	2025-03-22 18:49:31.552	137
112	/uploads/6369319e-453b-4578-8449-eb390bef3dc1.jpg	21750203-9.jpg	t	2025-03-22 19:19:42.224	2025-03-22 19:19:42.224	139
125	/uploads/f1915203-ae53-4aa1-bc76-bef63b587d95.JPG	17628905-8.JPG	t	2025-04-10 14:48:24.202	2025-04-10 14:48:24.202	145
118	/uploads/474f4756-252e-4d7e-9d87-610bd458c754.jpg	18353552-8.jpg	t	2025-04-01 15:53:33.734	2025-04-01 15:53:33.734	10
121	/uploads/10acef92-ef33-4b98-a021-4fffcb7b3328.jpg	tulio1.jpg	t	2025-04-01 18:24:06.755	2025-04-01 18:24:06.755	142
122	/uploads/131350ff-0e96-47e5-8a51-a241fd2bdb03.jpg	tulio22.jpg	f	2025-04-01 18:24:50.43	2025-04-01 18:24:50.43	142
123	/uploads/6fc4824a-afc6-487d-8595-0199990cc1d6.JPG	11742507-K.JPG	t	2025-04-10 14:45:23.634	2025-04-10 14:45:23.634	143
124	/uploads/0e65f931-9a98-4551-aadb-5157ac47bbde.JPG	FRANCO JULIANO MELLA VELAZCO.JPG	t	2025-04-10 14:46:47.861	2025-04-10 14:46:47.861	144
126	/uploads/fcc1c04f-0bac-4fba-b1da-dc5b2e3e3dc6.jpg	20092389-8.jpg	t	2025-04-16 19:52:37.301	2025-04-16 19:52:37.301	158
127	/uploads/38a30217-3945-49bb-97c1-c4e231f72511.jpg	diego dacosta.jpg	t	2025-04-16 20:07:22.915	2025-04-16 20:07:22.915	159
128	/uploads/f9f31349-6997-43b3-bece-ddc966993e0c.JPG	16443736-1.JPG	t	2025-04-16 20:24:36.848	2025-04-16 20:24:36.848	161
129	/uploads/1e503bbb-120a-4f23-923a-7e19bc9500c3.JPG	JUAN RODRIGO HERRERA.JPG	t	2025-04-16 20:26:52.684	2025-04-16 20:26:52.684	162
130	/uploads/57626f8f-8ef8-4895-b494-490955447cd3.jpg	26953355-2.jpg	t	2025-04-16 23:34:47.528	2025-04-16 23:34:47.528	151
131	/uploads/ee4dd04c-7698-494e-bbfe-dec32e4d52c8.jpg	FRANYOFERID JOSE TORRES TORRES.jpg	t	2025-04-16 23:35:49.451	2025-04-16 23:35:49.451	147
132	/uploads/0c970c46-6e4a-40ec-88ac-0871acc95ce3.jpg	descarga.jpg	t	2025-04-29 14:18:38.541	2025-04-29 14:18:38.541	163
133	/uploads/e9b33162-6fb7-4e31-900d-fa9a38f99e69.jpg	20250227_185047.jpg	f	2025-04-29 14:20:42.957	2025-04-29 14:20:42.957	163
134	/uploads/4dc61f40-df1d-4f2c-8d69-225babaf5f6e.jpg	20250211_161708.jpg	f	2025-04-29 14:22:17.889	2025-04-29 14:22:17.889	163
135	/uploads/71b08ed7-6199-4359-9699-347d6b0307ec.png	12030297-3.png	t	2025-05-21 22:34:23.408	2025-05-21 22:34:23.408	164
136	/uploads/18598306-5a1a-4f86-b477-b6cfea6ebdf2.jpg	27923776-5.jpg	t	2025-05-21 22:40:49.846	2025-05-21 22:40:49.846	166
137	/uploads/48b512b1-5157-44b6-ac00-fc7f43bf7b89.jpg	mazzolotti.jpg	t	2025-05-22 13:31:12.148	2025-05-22 13:31:12.148	167
138	/uploads/0c578896-f8ef-48ab-877b-b4dd6d8fdb4a.jpg	136627273_1379059405788389_6225695063477742300_n.jpg	f	2025-05-22 13:32:25.69	2025-05-22 13:32:25.69	167
139	/uploads/f7f2ade8-6edb-44e5-b634-d3438df5d596.jpg	cheo.jpg	t	2025-05-22 13:33:21.114	2025-05-22 13:33:21.114	168
116	/uploads/00a193a8-4f89-4da9-974d-deab0bba2c9f.jpg	36832152_2123972501212978_7187564745505898496_n.jpg	f	2025-04-01 15:17:23.737	2025-06-04 16:16:26.721	140
117	/uploads/48b5884d-eb77-4b15-a962-081b5878d72f.jpg	463378833_3853311854945692_5333647916869708247_n.jpg	f	2025-04-01 15:18:07.481	2025-06-04 16:16:26.721	140
114	/uploads/d29b5d32-acb3-4666-8b53-9978a13cbb44.jpg	100008007451960.jpg	f	2025-04-01 15:16:51.124	2025-06-04 16:16:26.721	140
113	/uploads/e30bd64a-839d-4856-8ed8-7fef7addb291.jpg	Josevera9273 instagram.jpg	t	2025-04-01 14:59:41.39	2025-06-04 16:16:26.739	140
141	/uploads/ac268e58-7c33-450a-9341-6ef086a89893.jpg	angel.jpg	t	2025-06-04 16:25:12.271	2025-06-04 16:25:12.271	169
143	/uploads/8bdbad79-9d9e-400b-b89b-b053aebac570.jpg	yamir.jpg	t	2025-06-05 17:31:28.515	2025-06-05 17:31:28.515	30
147	/api/uploads/bfdc2ef2-57d7-4603-899a-9e9dccfdda77.jpg	EUGENIO ALEJANDRO ALVARADO DÍAZ.jpg	t	2025-06-10 14:34:11.978	2025-06-10 14:34:11.978	174
148	/api/uploads/fa9bc284-3ada-4e33-a463-7991e5e03895.png	teofilo.png	t	2025-06-10 15:04:48.106	2025-06-10 15:04:48.106	175
149	/api/uploads/32257e8c-a01b-4eb0-8542-9a69d37e8e3b.jpg	TAMARA SOLANGE PEÑA AROS.jpg	t	2025-06-10 18:37:43.051	2025-06-10 18:37:43.051	177
151	/api/uploads/bc4a342a-c81f-4c6a-b46e-1ab792b55c7a.jpg	nolfa.jpg	t	2025-06-10 18:41:43.4	2025-06-10 18:41:43.4	178
152	/api/uploads/dad16fbb-d70c-4a00-a1a2-35c3946e71de.jpg	Rigoberto.jpg	t	2025-06-10 18:42:38.07	2025-06-10 18:42:38.07	179
153	/api/uploads/a4c15d52-6bd6-4a76-afa0-7fb1a115511b.jpg	20740724-0.jpg	t	2025-06-10 18:44:40.828	2025-06-10 18:44:40.828	180
155	/api/uploads/5b860c1b-c15e-419a-a678-d930972a6094.jpg	Jorge Giovanni Miranda.jpg	t	2025-06-10 18:47:03.929	2025-06-10 18:47:03.929	181
156	/api/uploads/7fa955a5-26be-4dc8-a8d2-86d0d1fb56f8.jpg	leandrocortes.jpg	t	2025-06-16 19:23:31.826	2025-06-16 19:23:31.826	183
157	/api/uploads/ffda8b50-4762-4a14-961a-e2c7a643f270.jpg	Cristbal Ingnacio Marambio Aliaga.jpg	t	2025-06-19 13:04:43.346	2025-06-19 13:04:43.346	192
158	/api/uploads/813fe30a-a609-4158-9bb1-2daadfcfa137.jpg	Rodrigo Cabrera Ortiz.jpg	t	2025-06-19 13:05:11.387	2025-06-19 13:05:11.387	182
159	/api/uploads/8bc8c816-2aea-4289-8951-ac4645ab5f40.jpg	Daniel Fernando Chacana Piñones.jpg	t	2025-06-19 13:05:33.397	2025-06-19 13:05:33.397	184
160	/api/uploads/18ff0f1e-4c1d-4045-b38d-5914f834f1b6.jpg	Fernando Favia Segovia Veliz.jpg	t	2025-06-19 13:05:58.322	2025-06-19 13:05:58.322	188
161	/api/uploads/563ca73b-d5bb-4b7f-85b4-eab61f4bbe4e.jpg	Paul Jeremi Opazo Milla.jpg	t	2025-06-19 13:06:17.147	2025-06-19 13:06:17.147	185
162	/api/uploads/6f376c4f-2def-4c45-8f2b-ba35c9b7d3ff.jpg	Brayan Cliff Carmona Carmona.jpg	t	2025-06-19 13:06:40.806	2025-06-19 13:06:40.806	187
163	/api/uploads/07723b22-9162-46ff-811c-6dda117a17c2.jpg	Alan Sebastian Huerta Barraza.jpg	t	2025-06-19 13:14:34.186	2025-06-19 13:14:34.186	193
164	/api/uploads/f95afb40-48db-4466-8c16-7d3d2c93875f.jpg	21733252-4.jpg	t	2025-06-24 17:39:11.995	2025-06-24 17:39:11.995	195
165	/api/uploads/21bc8c4e-c22f-4347-991d-36fa92334f4a.jpg	201272041.jpg	t	2025-06-25 16:31:04.709	2025-06-25 16:31:04.709	48
166	/api/uploads/f3f05fdc-0dea-41f5-b6e5-cfe2a0a5ed21.jpg	totano.jpg	t	2025-06-27 17:21:09.444	2025-06-27 17:21:09.444	197
167	/api/uploads/c8d09ef6-cd1d-4196-820e-4f8f57b2bb1c.jpg	17294544-9.jpg	t	2025-07-03 15:56:17.089	2025-07-03 15:56:17.089	198
168	/api/uploads/388a9112-e8b3-4dd0-8dec-b1d2c0cd69cd.JPG	Captura_PAUL TABILO.JPG	t	2025-07-04 13:37:24.974	2025-07-04 13:37:24.974	199
169	/api/uploads/1a8fe468-429e-4c80-8dee-8738e14090c9.JPG	Captura_ROBERT OYANEDEL.JPG	t	2025-07-04 13:41:24.311	2025-07-04 13:41:24.311	200
146	/api/uploads/86d03247-bb01-4774-a3a5-ad273241303e.jpg	maximiliano.jpg	f	2025-06-06 13:37:07.015	2025-07-09 13:42:00.516	170
186	/api/uploads/f6a1a91a-9ac6-4ea4-9e6f-ab8d8f8c4bac.JPG	samuel.JPG	t	2025-08-14 16:17:43.984	2025-08-14 16:17:43.984	215
171	/api/uploads/241adc06-c680-4773-af99-f432a62fe877.jpeg	sebastian 2.jpeg	f	2025-07-09 13:41:54.283	2025-07-09 13:42:00.516	170
170	/api/uploads/079fed74-b0da-4bcc-94d7-2668869d8876.jpeg	sebastian 11.jpeg	t	2025-07-09 13:40:29.495	2025-07-09 13:42:00.629	170
172	/api/uploads/abe0ff5b-5836-4849-a78e-56f7151dc50b.jpg	PATRICIO ANDRÉS PINTO ÁVILA.jpg	t	2025-07-10 22:01:53.963	2025-07-10 22:01:53.963	201
173	/api/uploads/6abb060a-12b2-4339-b4c8-06b181fd0b5f.jpg	mikki.jpg	t	2025-07-11 14:33:09.896	2025-07-11 14:33:09.896	202
174	/api/uploads/af42b32d-404d-44ae-a340-2c7b6eb8c305.jpg	20740633-3.jpg	t	2025-07-14 14:16:43.746	2025-07-14 14:16:43.746	203
175	/api/uploads/57160881-1031-4854-85ef-f4a6cd3b0738.jpg	20718939-1.jpg	t	2025-07-17 19:36:26.98	2025-07-17 19:36:26.98	204
176	/api/uploads/beeb996a-218c-4aa0-9c3a-30ab448880d5.jpg	19507147-0.jpg	t	2025-07-17 19:38:01.268	2025-07-17 19:38:01.268	205
177	/api/uploads/496cd1d1-9c45-48f3-820e-8f92fbd2d2d2.jpg	18179453-4.jpg	t	2025-07-17 19:45:08.815	2025-07-17 19:45:08.815	189
119	/uploads/1e9337f9-9056-458c-9d79-dc76fc45eba4.jpg	79373694_601393960669810_6077376206989164544_n.jpg	f	2025-04-01 18:21:55.978	2025-07-21 13:43:42.906	141
178	/api/uploads/f60a6538-1155-4e1b-ac30-c651cd0c207a.png	ronald Vera Facebook.png	f	2025-07-21 13:43:29.62	2025-07-21 13:43:42.906	141
120	/uploads/48595ef9-55dc-4ff1-9fde-b55b3bf8c635.jpg	Rondal Vera.jpg	t	2025-04-01 18:21:59.913	2025-07-21 13:43:42.918	141
179	/api/uploads/d10252dd-d45f-4f7e-83a8-a27c00bc4bf4.png	Franklin Zenteno Pinto.png	t	2025-07-23 15:49:09.716	2025-07-23 15:49:09.716	207
180	/api/uploads/a37192d2-ded4-4653-a630-99f7881aae10.jpeg	ROBERT DAVID CENTENO PINTO.jpeg	t	2025-07-23 15:58:06.022	2025-07-23 15:58:06.022	208
181	/api/uploads/4b670189-00fb-43a6-987a-3f6b47ec5e22.jpeg	JOSE GREGORIO RODRIGUEZ MARCELO.jpeg	t	2025-07-23 16:00:18.584	2025-07-23 16:00:18.584	209
182	/api/uploads/b3b21f60-63a9-4d9f-8d0f-a3f57a508b9d.png	Eduardo Santana Parra.png	t	2025-07-23 16:14:11.934	2025-07-23 16:14:11.934	210
183	/api/uploads/b0fba886-95c7-4564-9b70-f859ecfd13e5.png	Emilio Daniel Salcedo Arroyo.png	t	2025-07-23 16:19:06.236	2025-07-23 16:19:06.236	211
184	/api/uploads/bc41c3e6-765d-4006-851e-7fd846b707c0.jpg	bb7d9d7d2130d70011d213d06d6b7274.jpg	t	2025-08-07 16:19:20.488	2025-08-07 16:19:20.488	214
185	/api/uploads/ab2a7d07-2aee-453b-86d9-c1111fcf359b.jpg	diegoveliz.jpg	f	2025-08-07 16:19:20.508	2025-08-07 16:19:20.508	214
187	/api/uploads/8d5540a4-2937-475b-bbac-fd35b1d4ea36.png	parce.png	t	2025-08-25 19:05:44.43	2025-08-25 19:05:44.43	165
188	/api/uploads/4fd7f799-b476-4782-815e-f7ff8bea3faa.jpg	29ac434108cc6ddaaa3f934501080e9b.jpg	f	2025-08-25 19:06:23.826	2025-08-25 19:06:23.826	165
189	/api/uploads/47538482-9392-42d5-a2b1-d143ca4c3aac.jpg	EhlsiSFXYAAIIjZ.jpg	f	2025-08-25 19:08:19.993	2025-08-25 19:08:19.993	165
190	/api/uploads/737ef68a-627a-4950-9bbc-2ce49cca518d.jpeg	yahir sujeto de interes.jpeg	t	2025-09-01 13:21:00.905	2025-09-01 13:21:00.905	227
\.


--
-- Data for Name: Genograma; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Genograma" (id, "rucCausa", personas, relaciones, "mermaidCode", "createdAt", "updatedAt", "causaId") FROM stdin;
1	2300528039-7	[{"id": "16455658-1", "genero": "masculino", "nombre": "SIMON", "apellido": "HURTADO HERRERA  ", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "SIMON HURTADO HERRERA  ", "fechaNacimiento": "04/12/1986", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "17015136-4", "genero": "masculino", "nombre": "VANESSA", "apellido": "MADRID GUERRA", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "VANESSA MADRID GUERRA", "fechaNacimiento": "06/12/1986", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "17277400-8", "genero": "masculino", "nombre": "ALFONSO", "apellido": "OLIVARES ROBLES  ", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "ALFONSO OLIVARES ROBLES  ", "fechaNacimiento": "07/12/1986", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "19660743-9", "genero": "masculino", "nombre": "Manuel", "apellido": "albero Rocha Miano", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Manuel albero Rocha Miano", "fechaNacimiento": "09/12/1986", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "15550808-6", "genero": "masculino", "nombre": "ARMIN", "apellido": "STAUB SUAZO  ", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "ARMIN STAUB SUAZO  ", "fechaNacimiento": "21/07/1985", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "14605244-4", "genero": "masculino", "nombre": "PAMELA", "apellido": "CONTRERAS ROJAS", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "PAMELA CONTRERAS ROJAS", "fechaNacimiento": "23/10/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "12721909-5", "genero": "masculino", "nombre": "Rodrigo", "apellido": "Gomez Del Pino", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Rodrigo Gomez Del Pino", "fechaNacimiento": "24/10/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "17624417-8", "genero": "masculino", "nombre": "Cristian", "apellido": "Arcos", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Cristian Arcos", "fechaNacimiento": "25/10/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "10316075-8", "genero": "masculino", "nombre": "CLAUDIA", "apellido": "CARDENAS OLMOS", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "CLAUDIA CARDENAS OLMOS", "fechaNacimiento": "26/10/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "13537346-K", "genero": "masculino", "nombre": "PRISCILA", "apellido": "JOFRE ASTUDILLO", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "PRISCILA JOFRE ASTUDILLO", "fechaNacimiento": "27/10/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "11520568-4", "genero": "masculino", "nombre": "Pedro", "apellido": "Montiel Bordones", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Pedro Montiel Bordones", "fechaNacimiento": "29/10/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "10130104-4", "genero": "masculino", "nombre": "Juan", "apellido": "Marambio Olivares", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Juan Marambio Olivares", "fechaNacimiento": "30/10/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "10252352-0", "genero": "masculino", "nombre": "Marcela", "apellido": "Rojas Veliz", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Marcela Rojas Veliz", "fechaNacimiento": "31/10/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "13330293-K", "genero": "masculino", "nombre": "Rocio", "apellido": "Olmos Palacios", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Rocio Olmos Palacios", "fechaNacimiento": "01/11/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "18449989-4", "genero": "masculino", "nombre": "Josefa", "apellido": "Pérez Pinto", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Josefa Pérez Pinto", "fechaNacimiento": "02/11/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "18397587-0", "genero": "masculino", "nombre": "Romina", "apellido": "Varas Rodriguez", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Romina Varas Rodriguez", "fechaNacimiento": "03/11/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "14105765-0", "genero": "masculino", "nombre": "Katherine", "apellido": "Rojas Chambe", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Katherine Rojas Chambe", "fechaNacimiento": "04/11/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "12806233-5", "genero": "masculino", "nombre": "Carlos", "apellido": "Jimenez Villalobos", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Carlos Jimenez Villalobos", "fechaNacimiento": "05/11/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "11160168-2", "genero": "masculino", "nombre": "TATIANA", "apellido": "CUADRA SEPULVEDA", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "TATIANA CUADRA SEPULVEDA", "fechaNacimiento": "06/11/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "15053111-K", "genero": "masculino", "nombre": "RICARDO", "apellido": "SOTO MOLINA", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "RICARDO SOTO MOLINA", "fechaNacimiento": "07/11/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "14044927-K", "genero": "masculino", "nombre": "Roberto", "apellido": "Vergara Bermejo", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Roberto Vergara Bermejo", "fechaNacimiento": "08/11/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "13028399-3", "genero": "masculino", "nombre": "Angela", "apellido": "Gonzalez Coquelet", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Angela Gonzalez Coquelet", "fechaNacimiento": "09/11/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "14473799-7", "genero": "masculino", "nombre": "ENZO", "apellido": "ARANCIBIA PIZARRO", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "ENZO ARANCIBIA PIZARRO", "fechaNacimiento": "10/11/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "12613085-6", "genero": "masculino", "nombre": "Ana", "apellido": "Acevedo Acevedo ", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Ana Acevedo Acevedo ", "fechaNacimiento": "11/11/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "13974472-1", "genero": "masculino", "nombre": "Lady", "apellido": "Dubó Sunkel", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Lady Dubó Sunkel", "fechaNacimiento": "12/11/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "17866036-5", "genero": "masculino", "nombre": "Daniela", "apellido": "Latorre", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Daniela Latorre", "fechaNacimiento": "13/11/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "19542708-9", "genero": "masculino", "nombre": "Andrea", "apellido": "Ollarzu Vega", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Andrea Ollarzu Vega", "fechaNacimiento": "14/11/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "13365648-0", "genero": "masculino", "nombre": "Fabian", "apellido": "Fernandez Cataldo", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Fabian Fernandez Cataldo", "fechaNacimiento": "16/11/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "17934391-6", "genero": "masculino", "nombre": "Camila", "apellido": "Fernandez Rojas ", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Camila Fernandez Rojas ", "fechaNacimiento": "19/11/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "12575709-K", "genero": "masculino", "nombre": "Lizette", "apellido": "Aurelia Bravo Jofre", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Lizette Aurelia Bravo Jofre", "fechaNacimiento": "23/11/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "10033696-0", "genero": "masculino", "nombre": "BARBARA", "apellido": "LEON MANRIQUEZ", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "BARBARA LEON MANRIQUEZ", "fechaNacimiento": "24/11/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "18922686-1", "genero": "masculino", "nombre": "JAVIER", "apellido": "HIDALGO ALFARO", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "JAVIER HIDALGO ALFARO", "fechaNacimiento": "25/11/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "12160352-7", "genero": "masculino", "nombre": "MARCO", "apellido": "CACERES MENDEZ", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "MARCO CACERES MENDEZ", "fechaNacimiento": "26/11/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "13695486-5", "genero": "masculino", "nombre": "MARIA", "apellido": "VERONICA CASTRO RAMIREZ", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "MARIA VERONICA CASTRO RAMIREZ", "fechaNacimiento": "27/11/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "17267805-K", "genero": "masculino", "nombre": "Mario", "apellido": "Aravena Cortés", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Mario Aravena Cortés", "fechaNacimiento": "28/11/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "13975837-4", "genero": "masculino", "nombre": "PILAR", "apellido": "VERGARA GUZMAN", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "PILAR VERGARA GUZMAN", "fechaNacimiento": "29/11/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "10497525-9", "genero": "masculino", "nombre": "Patricio", "apellido": "Cooper Monti", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Patricio Cooper Monti", "fechaNacimiento": "30/11/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "10581922-6", "genero": "masculino", "nombre": "Mario", "apellido": "Larrain Alemparte", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Mario Larrain Alemparte", "fechaNacimiento": "01/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "11625520-0", "genero": "masculino", "nombre": "CARMEN", "apellido": "GLORIA MORALES", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "CARMEN GLORIA MORALES", "fechaNacimiento": "02/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "18078910-3", "genero": "masculino", "nombre": "KARLA", "apellido": "VELIZ MUu00d1OZ", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "KARLA VELIZ MUu00d1OZ", "fechaNacimiento": "03/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "18518218-5", "genero": "masculino", "nombre": "Eduardo", "apellido": "Hernandez Pizarro", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Eduardo Hernandez Pizarro", "fechaNacimiento": "04/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "19155305-5", "genero": "masculino", "nombre": "Rosario", "apellido": "Alegria Adaros", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Rosario Alegria Adaros", "fechaNacimiento": "05/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "16313750-K", "genero": "masculino", "nombre": "DAYANA", "apellido": "GONZALEZ DIAZ ", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "DAYANA GONZALEZ DIAZ ", "fechaNacimiento": "06/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "14030224-4", "genero": "masculino", "nombre": "Cristian", "apellido": "Francisco Sanhueza Novoa", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Cristian Francisco Sanhueza Novoa", "fechaNacimiento": "08/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "16791397-0", "genero": "masculino", "nombre": "Cristobal", "apellido": "Andoni Manzano Otaiza", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Cristobal Andoni Manzano Otaiza", "fechaNacimiento": "09/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "17020569-3", "genero": "masculino", "nombre": "Joselin", "apellido": "Taborga Miranda", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Joselin Taborga Miranda", "fechaNacimiento": "10/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "12345678-1", "genero": "masculino", "nombre": "CENTRALIZADO", "apellido": "VIGENTE OVALLE", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "CENTRALIZADO VIGENTE OVALLE", "fechaNacimiento": "11/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "12595722-6", "genero": "masculino", "nombre": "Manuel", "apellido": "Constancio Baez ", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Manuel Constancio Baez ", "fechaNacimiento": "12/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "19040315-7", "genero": "masculino", "nombre": "Daniela", "apellido": "Olivares Perez", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Daniela Olivares Perez", "fechaNacimiento": "13/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "17045022-1", "genero": "masculino", "nombre": "CARLOS", "apellido": "MARTINEZ OROSTICA", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "CARLOS MARTINEZ OROSTICA", "fechaNacimiento": "14/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "17092782-6", "genero": "masculino", "nombre": "Karina", "apellido": "Diaz Ramos", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Karina Diaz Ramos", "fechaNacimiento": "15/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "18754491-2", "genero": "masculino", "nombre": "Gabriela", "apellido": "Hernandez Troncoso", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Gabriela Hernandez Troncoso", "fechaNacimiento": "16/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "18783145-8", "genero": "masculino", "nombre": "Gabriel", "apellido": "Gonzalez Perez", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Gabriel Gonzalez Perez", "fechaNacimiento": "17/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "16482915-4", "genero": "masculino", "nombre": "Viviana", "apellido": "Rojas Peralta", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Viviana Rojas Peralta", "fechaNacimiento": "18/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "17453482-9", "genero": "masculino", "nombre": "Carolina", "apellido": "Campos Galleguillos", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Carolina Campos Galleguillos", "fechaNacimiento": "19/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "19889174-6", "genero": "masculino", "nombre": "Patricio", "apellido": "Delgado", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Patricio Delgado", "fechaNacimiento": "20/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "17734568-7", "genero": "masculino", "nombre": "Paul", "apellido": "Arias Souza", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Paul Arias Souza", "fechaNacimiento": "21/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "13018573-8", "genero": "masculino", "nombre": "HARRY", "apellido": "DIAZ", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "HARRY DIAZ", "fechaNacimiento": "23/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "17193418-4", "genero": "masculino", "nombre": "CARLAS", "apellido": "CORTES ROJAS", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "CARLAS CORTES ROJAS", "fechaNacimiento": "24/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "14483780-0", "genero": "masculino", "nombre": "FRANCISCO", "apellido": "BARRERA VEGA", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "FRANCISCO BARRERA VEGA", "fechaNacimiento": "25/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "19155225-3", "genero": "masculino", "nombre": "YEISI", "apellido": "MARAMBIO ALVAREZ", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "YEISI MARAMBIO ALVAREZ", "fechaNacimiento": "26/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "13973534-K", "genero": "masculino", "nombre": "PATRICIO", "apellido": "LOPEZ DIAZ", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "PATRICIO LOPEZ DIAZ", "fechaNacimiento": "27/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "18889411-9", "genero": "masculino", "nombre": "Alejandro", "apellido": "Godoy Guerra ", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Alejandro Godoy Guerra ", "fechaNacimiento": "29/12/1981", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "15514275-8", "genero": "masculino", "nombre": "FERNANDO", "apellido": "MUNIZAGA ZAMBRANO", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "FERNANDO MUNIZAGA ZAMBRANO", "fechaNacimiento": "02/01/1982", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "13602154-0", "genero": "masculino", "nombre": "Roberto", "apellido": "Alarcu00f3n Hernu00e1ndez", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Roberto Alarcu00f3n Hernu00e1ndez", "fechaNacimiento": "03/01/1982", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "11666295-7", "genero": "masculino", "nombre": "Ivonne", "apellido": "Alfarez Contreras", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Ivonne Alfarez Contreras", "fechaNacimiento": "04/01/1982", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "10382649-7", "genero": "masculino", "nombre": "Roxana", "apellido": "Cornejo Henriquez", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Roxana Cornejo Henriquez", "fechaNacimiento": "05/01/1982", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "10349916-K", "genero": "masculino", "nombre": "usuario", "apellido": "prueba", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "usuario prueba", "fechaNacimiento": "06/01/1982", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "18823906-4", "genero": "masculino", "nombre": "Fabian", "apellido": "Diaz Concha", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Fabian Diaz Concha", "fechaNacimiento": "08/01/1982", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "10683422-9", "genero": "masculino", "nombre": "Waldo", "apellido": "Collao Carrillo", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Waldo Collao Carrillo", "fechaNacimiento": "16/01/1982", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "10134330-8", "genero": "masculino", "nombre": "Jorge", "apellido": "Salfate Leyton", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Jorge Salfate Leyton", "fechaNacimiento": "17/01/1982", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "10409619-0", "genero": "masculino", "nombre": "Silvia", "apellido": "Cuello Villarroel", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Silvia Cuello Villarroel", "fechaNacimiento": "18/01/1982", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "10411647-7", "genero": "masculino", "nombre": "Alexis", "apellido": "Nuñez Espinosa", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Alexis Nuñez Espinosa", "fechaNacimiento": "19/01/1982", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "10575088-9", "genero": "masculino", "nombre": "Herbert", "apellido": "Rohde Iturra", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Herbert Rohde Iturra", "fechaNacimiento": "20/01/1982", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "13020796-0", "genero": "masculino", "nombre": "CLAUDIO", "apellido": "SOBARZO TASSARA", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "CLAUDIO SOBARZO TASSARA", "fechaNacimiento": "23/01/1982", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "19257185-5", "genero": "masculino", "nombre": "Paola", "apellido": "Valenzuela Gonzalez", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Paola Valenzuela Gonzalez", "fechaNacimiento": "25/01/1982", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "18126484-5", "genero": "masculino", "nombre": "Camila", "apellido": "Campos Toro", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Camila Campos Toro", "fechaNacimiento": "27/01/1982", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "18179717-7", "genero": "masculino", "nombre": "CAROLINA", "apellido": "JAVIERA ROJAS APABLAZA", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "CAROLINA JAVIERA ROJAS APABLAZA", "fechaNacimiento": "29/01/1982", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "10738413-8", "genero": "masculino", "nombre": "Lucia", "apellido": "Navarrete Hernandez", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Lucia Navarrete Hernandez", "fechaNacimiento": "30/01/1982", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "11259926-6", "genero": "masculino", "nombre": "Hilda", "apellido": "Gallardo Flores", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Hilda Gallardo Flores", "fechaNacimiento": "31/01/1982", "segundoApellido": "", "fechaFallecimiento": ""}]	[{"tipo": "matrimonio", "idOrigen": "17015136-4", "idDestino": "16455658-1", "descripcion": ""}, {"tipo": "padres", "idOrigen": "17015136-4", "idDestino": "17277400-8", "descripcion": ""}, {"tipo": "primos", "idOrigen": "17624417-8", "idDestino": "10316075-8", "descripcion": ""}, {"tipo": "padres", "idOrigen": "17015136-4", "idDestino": "10316075-8", "descripcion": ""}, {"tipo": "otro", "idOrigen": "11520568-4", "idDestino": "17277400-8", "descripcion": "Tio"}, {"tipo": "padres", "idOrigen": "11520568-4", "idDestino": "18449989-4", "descripcion": ""}, {"tipo": "primos", "idOrigen": "17277400-8", "idDestino": "18449989-4", "descripcion": ""}, {"tipo": "padres", "idOrigen": "10252352-0", "idDestino": "17277400-8", "descripcion": ""}, {"tipo": "hermanos", "idOrigen": "19660743-9", "idDestino": "17624417-8", "descripcion": ""}, {"tipo": "hermanos", "idOrigen": "19660743-9", "idDestino": "15550808-6", "descripcion": ""}, {"tipo": "primos", "idOrigen": "19660743-9", "idDestino": "11520568-4", "descripcion": ""}, {"tipo": "divorcio", "idOrigen": "19660743-9", "idDestino": "17015136-4", "descripcion": ""}, {"tipo": "otro", "idOrigen": "11520568-4", "idDestino": "13537346-K", "descripcion": "tutor"}, {"tipo": "otro", "idOrigen": "11520568-4", "idDestino": "17277400-8", "descripcion": "compañeros"}, {"tipo": "divorcio", "idOrigen": "14605244-4", "idDestino": "12721909-5", "descripcion": ""}]	flowchart TD\n  %% Configuración del tema bosque\n  linkColor: #2F4F4F\n  background: #F5F5F5\n  fontFamily: "Open Sans, sans-serif"\n\n  %% Definición de estilos base\n  classDef hombre fill:#78A5A3,stroke:#2F4F4F,stroke-width:2px,color:white,font-weight:bold\n  classDef mujer fill:#E1B16A,stroke:#8B6914,stroke-width:2px,color:white,font-weight:bold\n  classDef fallecido fill:#A9A9A9,stroke:#333,stroke-width:2px,stroke-dasharray:5 5,color:white,font-weight:bold\n  classDef victima fill:#CE5A57,stroke:#8B0000,stroke-width:4px,color:white,font-weight:bold\n  classDef imputado fill:#F4E76E,stroke:#8B8000,stroke-width:4px,color:black,font-weight:bold\n  %% Estilos para ramas familiares\n  classDef ramaPrincipal fill:#8FB996,stroke:#1B4332,stroke-width:2px,color:white,font-weight:bold\n  classDef ramaPaterna fill:#9EC1CF,stroke:#2A4D69,stroke-width:2px,color:white,font-weight:bold\n  classDef ramaMaterna fill:#F9C5BD,stroke:#884A39,stroke-width:2px,color:white,font-weight:bold\n  classDef ramaPolitica fill:#F9E79F,stroke:#9A7D0A,stroke-width:2px,color:black,font-weight:bold\n  16455658-1[SIMON HURTADO HERRERA  ]:::hombre\n  17015136-4[VANESSA MADRID GUERRA]:::hombre\n  17277400-8[ALFONSO OLIVARES ROBLES  ]:::hombre\n  19660743-9[Manuel albero Rocha Miano]:::hombre\n  15550808-6[ARMIN STAUB SUAZO  ]:::hombre\n  14605244-4[PAMELA CONTRERAS ROJAS]:::hombre\n  12721909-5[Rodrigo Gomez Del Pino]:::hombre\n  17624417-8[Cristian Arcos]:::hombre\n  10316075-8[CLAUDIA CARDENAS OLMOS]:::hombre\n  13537346-K[PRISCILA JOFRE ASTUDILLO]:::hombre\n  11520568-4[Pedro Montiel Bordones]:::hombre\n  10252352-0[Marcela Rojas Veliz]:::hombre\n  18449989-4[Josefa Pérez Pinto]:::hombre\n  %% Estilos para relaciones\n  linkStyle default stroke:#2F4F4F,stroke-width:2px\n  17015136-4 ---|"Matrimonio"| 16455658-1\n  17015136-4 -->|"Padres"| 17277400-8\n  linkStyle 2 stroke:#E1B16A,stroke-width:2px,stroke-dasharray:1 5\n  17624417-8 -.->|"Primos"| 10316075-8\n  17015136-4 -->|"Padres"| 10316075-8\n  11520568-4 ---|"Tio"| 17277400-8\n  11520568-4 -->|"Padres"| 18449989-4\n  linkStyle 6 stroke:#E1B16A,stroke-width:2px,stroke-dasharray:1 5\n  17277400-8 -.->|"Primos"| 18449989-4\n  10252352-0 -->|"Padres"| 17277400-8\n  linkStyle 8 stroke:#78A5A3,stroke-width:2px\n  19660743-9 -.->|"Hermanos"| 17624417-8\n  linkStyle 9 stroke:#78A5A3,stroke-width:2px\n  19660743-9 -.->|"Hermanos"| 15550808-6\n  linkStyle 10 stroke:#E1B16A,stroke-width:2px,stroke-dasharray:1 5\n  19660743-9 -.->|"Primos"| 11520568-4\n  linkStyle 11 stroke:#CE5A57,stroke-width:2px,stroke-dasharray:5 5\n  19660743-9 -.-|"Divorcio"| 17015136-4\n  11520568-4 ---|"tutor"| 13537346-K\n  11520568-4 ---|"compañeros"| 17277400-8\n  linkStyle 14 stroke:#CE5A57,stroke-width:2px,stroke-dasharray:5 5\n  14605244-4 -.-|"Divorcio"| 12721909-5\n\n  %% Nota: 67 personas no se muestran porque no tienen relaciones\n	2025-03-05 22:04:08.17	2025-03-05 23:12:14.741	\N
2	2401233454-7	[{"id": "18.589.357-K", "genero": "femenino", "nombre": "Arlette", "apellido": "Nicole Marín Da Costa", "colorRama": "#ffffff", "nombreRama": "", "esFallecido": false, "rolEspecial": "victima", "ramaFamiliar": "principal", "segundoNombre": "", "nombreCompleto": "Arlette Nicole Marín Da Costa", "fechaNacimiento": "1994-04-25", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "10.596.704-7", "genero": "masculino", "nombre": "Andrés", "apellido": "Belisario Marín Antiquera", "colorRama": "#ffffff", "nombreRama": "", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Andrés Belisario Marín Antiquera", "fechaNacimiento": "1974-08-23", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "15.393.172-0", "genero": "femenino", "nombre": "Arlette", "apellido": "Johana Da Costa Padilla", "colorRama": "#ffffff", "nombreRama": "", "esFallecido": true, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Arlette Johana Da Costa Padilla", "fechaNacimiento": "1979-07-15", "segundoApellido": "", "fechaFallecimiento": "2011-09-19"}, {"id": "15.390.864-8", "genero": "masculino", "nombre": "Adolfo", "apellido": "Antonio Da Costa Padilla", "colorRama": "#ffffff", "nombreRama": "", "esFallecido": false, "rolEspecial": "imputado", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Adolfo Antonio Da Costa Padilla", "fechaNacimiento": "1977-06-18", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "20.406.242-0", "genero": "masculino", "nombre": "Adolfo", "apellido": "Andrés Da Costa Parra", "colorRama": "#ffffff", "nombreRama": "", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "materna", "segundoNombre": "", "nombreCompleto": "Adolfo Andrés Da Costa Parra", "fechaNacimiento": "2000-03-15", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "21.696.509-4", "genero": "masculino", "nombre": "Jeremmy", "apellido": "Andrés Marín León", "colorRama": "#ffffff", "nombreRama": "", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Jeremmy Andrés Marín León", "fechaNacimiento": "2004-10-31", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "22.408.954-6", "genero": "femenino", "nombre": "Sol", "apellido": "Danae Marín León", "colorRama": "#ffffff", "nombreRama": "", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "paterna", "segundoNombre": "", "nombreCompleto": "Sol Danae Marín León", "fechaNacimiento": "2007-05-29", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "23.510.869-0", "genero": "masculino", "nombre": "Adolfo", "apellido": "Antonio Silva Da costa", "colorRama": "#ffffff", "nombreRama": "", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "materna", "segundoNombre": "", "nombreCompleto": "Adolfo Antonio Silva Da costa", "fechaNacimiento": "", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "21.540.453-6", "genero": "masculino", "nombre": "Diego", "apellido": "Rodrigo Amado Barraza Da costa", "colorRama": "#ffffff", "nombreRama": "", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "materna", "segundoNombre": "", "nombreCompleto": "Diego Rodrigo Amado Barraza Da costa", "fechaNacimiento": "2004-02-14", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "21.864.503-8", "genero": "masculino", "nombre": "Yovanka", "apellido": "Arlette Eduarda Barraza Da costa, ", "colorRama": "#ffffff", "nombreRama": "", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "materna", "segundoNombre": "", "nombreCompleto": "Yovanka Arlette Eduarda Barraza Da costa, ", "fechaNacimiento": "2005-05-02", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "21.949.320-7", "genero": "femenino", "nombre": "Dairhis", "apellido": "Constanza Graciela Da Costa Parra", "colorRama": "#ffffff", "nombreRama": "", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Dairhis Constanza Graciela Da Costa Parra", "fechaNacimiento": "2005-10-05", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "22.193.797-K", "genero": "femenino", "nombre": "Nazareth", "apellido": "Graciela Nayath Da Costa Navea", "colorRama": "#ffffff", "nombreRama": "", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Nazareth Graciela Nayath Da Costa Navea", "fechaNacimiento": "2006-07-20", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "24.289.488-K", "genero": "masculino", "nombre": "Antonhy", "apellido": "Gael Da Costa Navea", "colorRama": "#ffffff", "nombreRama": "", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Antonhy Gael Da Costa Navea", "fechaNacimiento": "", "segundoApellido": "", "fechaFallecimiento": ""}, {"id": "28.332.316-1 ", "genero": "masculino", "nombre": "Ángel", "apellido": "Salvador Rojas Marín", "colorRama": "#ffffff", "nombreRama": "", "esFallecido": false, "rolEspecial": "ninguno", "ramaFamiliar": "ninguna", "segundoNombre": "", "nombreCompleto": "Ángel Salvador Rojas Marín", "fechaNacimiento": "", "segundoApellido": "", "fechaFallecimiento": ""}]	[{"tipo": "otro", "idOrigen": "15.390.864-8", "idDestino": "18.589.357-K", "descripcion": "Tio Materno"}, {"tipo": "primos", "idOrigen": "20.406.242-0", "idDestino": "18.589.357-K", "descripcion": "Primo Linea materna"}, {"tipo": "hermanos", "idOrigen": "21.696.509-4", "idDestino": "18.589.357-K", "descripcion": "Hermanos linea materna"}, {"tipo": "hermanos", "idOrigen": "22.408.954-6", "idDestino": "18.589.357-K", "descripcion": "Hermana linea materna"}, {"tipo": "hermanos", "idOrigen": "21.540.453-6", "idDestino": "18.589.357-K", "descripcion": ""}, {"tipo": "hermanos", "idOrigen": "21.864.503-8", "idDestino": "18.589.357-K", "descripcion": ""}, {"tipo": "hermanos", "idOrigen": "23.510.869-0", "idDestino": "18.589.357-K", "descripcion": ""}, {"tipo": "padres", "idOrigen": "15.393.172-0", "idDestino": "18.589.357-K", "descripcion": "Madre"}, {"tipo": "padres", "idOrigen": "15.393.172-0", "idDestino": "21.864.503-8", "descripcion": "Madre"}, {"tipo": "padres", "idOrigen": "15.393.172-0", "idDestino": "23.510.869-0", "descripcion": "Madre"}, {"tipo": "padres", "idOrigen": "10.596.704-7", "idDestino": "18.589.357-K", "descripcion": "Padre"}, {"tipo": "padres", "idOrigen": "15.390.864-8", "idDestino": "20.406.242-0", "descripcion": "Padre"}, {"tipo": "padres", "idOrigen": "15.390.864-8", "idDestino": "21.949.320-7", "descripcion": "Padre"}, {"tipo": "matrimonio", "idOrigen": "21.949.320-7", "idDestino": "20.406.242-0", "descripcion": ""}, {"tipo": "padres", "idOrigen": "15.390.864-8", "idDestino": "22.193.797-K", "descripcion": "Padre"}, {"tipo": "hermanos", "idOrigen": "22.193.797-K", "idDestino": "20.406.242-0", "descripcion": ""}, {"tipo": "padres", "idOrigen": "15.390.864-8", "idDestino": "24.289.488-K", "descripcion": "Padre"}, {"tipo": "hermanos", "idOrigen": "20.406.242-0", "idDestino": "24.289.488-K", "descripcion": ""}]	flowchart TD\n  classDef hombre fill:#ee6c4d ,stroke:#293241,stroke-width:2px\n  classDef mujer fill:#E1B16A,stroke:#8B6914,stroke-width:2px\n  classDef fallecido fill:#A9A9A9,stroke:#F6FAFF,stroke-width:2px,stroke-dasharray:5 5\n  classDef victima fill:#CE5A57,stroke:#8B0000,stroke-width:4px\n  classDef imputado fill:#F4E76E,stroke:#8B8000,stroke-width:4px\n  classDef ramaPrincipal fill:#8FB996,stroke:#1B4332,stroke-width:2px\n  classDef ramaPaterna fill:#9EC1CF,stroke:#2A4D69,stroke-width:2px\n  classDef ramaMaterna fill:#F9C5BD,stroke:#884A39,stroke-width:2px\n  classDef ramaPolitica fill:#F9E79F,stroke:#9A7D0A,stroke-width:2px\n  18.589.357-K(Arlette Nicole Marín Da Costa<br>VICTIMA):::mujer&ramaPrincipal&victima\n  10.596.704-7[Andrés Belisario Marín Antiquera]:::hombre\n  15.393.172-0(Arlette Johana Da Costa Padilla †):::mujer&fallecido\n  15.390.864-8[Adolfo Antonio Da Costa Padilla<br>IMPUTADO]:::hombre&imputado\n  20.406.242-0[Adolfo Andrés Da Costa Parra]:::hombre&ramaMaterna\n  21.696.509-4[Jeremmy Andrés Marín León]:::hombre\n  22.408.954-6(Sol Danae Marín León):::mujer&ramaPaterna\n  23.510.869-0[Adolfo Antonio Silva Da costa]:::hombre&ramaMaterna\n  21.540.453-6[Diego Rodrigo Amado Barraza Da costa]:::hombre&ramaMaterna\n  21.864.503-8[Yovanka Arlette Eduarda Barraza Da costa, ]:::hombre&ramaMaterna\n  21.949.320-7(Dairhis Constanza Graciela Da Costa Parra):::mujer\n  22.193.797-K(Nazareth Graciela Nayath Da Costa Navea):::mujer\n  24.289.488-K[Antonhy Gael Da Costa Navea]:::hombre\n  15.390.864-8 ---|"Tio Materno"| 18.589.357-K\n  20.406.242-0 -.->|"Primos"| 18.589.357-K\n  21.696.509-4 -.->|"Hermanos"| 18.589.357-K\n  22.408.954-6 -.->|"Hermanos"| 18.589.357-K\n  21.540.453-6 -.->|"Hermanos"| 18.589.357-K\n  21.864.503-8 -.->|"Hermanos"| 18.589.357-K\n  23.510.869-0 -.->|"Hermanos"| 18.589.357-K\n  15.393.172-0 -->|"Padres"| 18.589.357-K\n  15.393.172-0 -->|"Padres"| 21.864.503-8\n  15.393.172-0 -->|"Padres"| 23.510.869-0\n  10.596.704-7 -->|"Padres"| 18.589.357-K\n  15.390.864-8 -->|"Padres"| 20.406.242-0\n  15.390.864-8 -->|"Padres"| 21.949.320-7\n  21.949.320-7 ---|"Matrimonio"| 20.406.242-0\n  15.390.864-8 -->|"Padres"| 22.193.797-K\n  22.193.797-K -.->|"Hermanos"| 20.406.242-0\n  15.390.864-8 -->|"Padres"| 24.289.488-K\n  20.406.242-0 -.->|"Hermanos"| 24.289.488-K\n\n  %% Nota: 1 personas no se muestran porque no tienen relaciones\n	2025-04-03 13:54:25.571	2025-04-03 14:11:32.159	82
\.


--
-- Data for Name: Imputado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Imputado" (id, "nombreSujeto", "docId", "nacionalidadId", "createdAt", "updatedAt", "fotoPrincipal", alias, caracterisiticas) FROM stdin;
5	Santiago Uribe Perez	25310804-5	45	2024-11-19 17:32:50.451	\N	\N	\N	\N
6	Francisco Javier Rodriguez Rodriguez	14891494-K	240	2024-11-19 17:32:50.451	\N	\N	\N	\N
7	Daniel Eduardo Lueiza Gonzalez	11524518-K	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
8	Mariangela Del Carmen González Carrasco	14953471-7	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
9	Luis Alejandro Rojas Gonzalez	20446001	240	2024-11-19 17:32:50.451	\N	\N	\N	\N
11	Johany Andres Lopetegui Godoy\t	13177361-7	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
15	Miguel Antonio Montes Chaparro	20004863	240	2024-11-19 17:32:50.451	\N	\N	\N	\N
16	Esteban Aaron Herrera Moreno	19443143-0	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
17	Fernando Alexis Santana Barrientos	15781675-6	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
18	Dilan Scot Valdez Ramirez	23367365-K	45	2024-11-19 17:32:50.451	\N	\N	\N	\N
19	Luis Matias Pizarro Veliz	22198613-K\t	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
20	Jhonathan Eloy Sanders Araya	17453099-8	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
21	Juan Fernando Romero Quintero	20864388-6	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
22	Jesus Alveiro Santander Moreno	26311914	240	2024-11-19 17:32:50.451	\N	\N	\N	\N
23	Matias Isaac Romero Quintero	21738426-5	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
24	Kevin Eduardo Meneses Mundaca	19040639-3	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
25	Clara Andrea Quintero Lopez	13649208-K	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
26	Jorge Manuel Torres Varas	10219221-4	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
27	Veronica Lorena Garcia Zepeda	11347015-1	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
28	Francisco Javier Novoa Ibaceta	15897993-4	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
29	Luis Ignacio Cerda Vega	18889439-9	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
32	Crysthofer Tomas Arraiz Lopez	28484957-4	240	2024-11-19 17:32:50.451	\N	\N	\N	\N
33	Omar Arriaza Herrera	11111111-1	240	2024-11-19 17:32:50.451	\N	\N	\N	\N
35	Jose Cleonorbo Cuesta Martinez 	24682718-4 	45	2024-11-19 17:32:50.451	\N	\N	\N	\N
36	Carlos Matias Alfaro Castillo	17711149-K	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
37	Alejandro Manuel Herrera Vargas	18968097-K	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
38	Jimmy Angel Gallardo Villanueva	16053564-4	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
39	Cristopher Henry Vega Villanueva	15673287-7 	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
40	Carla Belen Olivares Miranda	17486166-8	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
41	Felix Alberto Montiilla Galue	14893396-0	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
42	Maximiliano Jose Castex Ortiz	19769946-9	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
43	Francisco Javier Zurita Camacho	16864221-0	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
44	Hector Cortes Ferreira	17451985-4	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
45	Nicolas Alejandro Araya Guerrero	19041978-9	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
46	Marcelo Jesús Vera Huilcaleo,	20110545-5	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
47	Boris Yordans Carrasco Veliz	19770060-2	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
49	Matías Felipe Astudillo Villalobos	23084584-0	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
51	Bruno Raul Ignadio Aguilera Collao	21981387-2	41	2024-11-19 17:32:50.451	\N	\N	\N	\N
1	Gabriel Maximiliano Maturana Aracena	23304933-6	41	2024-11-19 17:32:50.451	2024-11-22 01:45:53.666	/uploads/12847081-4895-43a5-a0e2-16c9dc25c7c2_Imagen1.jpg	\N	\N
2	Luis Francisco Beltre Rondon	26545641-3	188	2024-11-19 17:32:50.451	2024-11-24 03:14:35.672	/uploads/ae6a05d6-0bf7-4ac2-9e1f-66e3451c0fdb.jpg	\N	\N
3	Emmanel Alejandro  Uceta	26962245-8	188	2024-11-19 17:32:50.451	2024-11-24 13:58:09.196	/uploads/29a5f0fa-1f38-42a5-b3fe-aa443db26b5b.jpg	\N	\N
53	GIAN FRANCO STELLON BONCHELLI	20183725-1	41	2024-12-02 19:56:13.029	2024-12-02 19:56:13.029	\N	\N	\N
55	FERNANDO ANDRES VALDES LY	10958068-6	41	2024-12-03 20:41:50.661	2024-12-03 20:41:50.661	\N	\N	\N
56	FRANCISCO JESUS FLORES SANTIBAÑEZ	15820788-5	41	2024-12-03 21:00:10.314	2024-12-03 21:00:10.314	\N	\N	\N
57	JUAN ENRIQUE CASTRO BERGER	18010853-K	41	2024-12-03 21:13:28.71	2024-12-03 21:13:28.71	\N	\N	\N
61	CLAUDIO ALEXANDER FORNES VICUÑA	17804740-K	41	2024-12-03 21:41:47.118	2024-12-03 21:41:47.118	\N	\N	\N
62	BRAYAN ANTONIO PIZARRO ESPINOZA	18914447-4	41	2024-12-03 21:42:13.585	2024-12-03 21:42:13.585	\N	\N	\N
63	BENJAMÍN IGNACIO BARRÍA MUJICA	21281741-4	41	2024-12-03 21:42:34.177	2024-12-03 21:42:34.177	\N	\N	\N
64	BRAYAN ANTONIO PIZARRO ESPINOZA	18914447-4	41	2024-12-03 21:42:52.871	2024-12-03 21:42:52.871	\N	\N	\N
65	DARWIN ALEJANDRO JACOBS RIQUELME	17159997-0	41	2024-12-03 21:43:20.52	2024-12-03 21:43:20.52	\N	\N	\N
66	ALEXIS ANTONIO SIERRA CASTRILLON	24730246-8	45	2024-12-11 20:39:07.182	2024-12-11 20:45:53.882	/uploads/28513cb1-68bf-4e65-9950-c498e5f33f81.jpg	\N	\N
68	MATHIAS GIOVANNI CONTRERAS D'ARCANGELI	21307864-K	41	2024-12-18 15:02:00.163	2024-12-18 15:05:10.802	/uploads/60dc4282-a04b-4f53-8e8d-011fb6194eeb.jpg	\N	\N
71	RICARDO GUZMAN ROJAS ARAYA	14429167-0	41	2024-12-19 20:36:45.822	2024-12-19 20:36:54.502	/uploads/81fc78c7-ef92-48c4-a3a2-44f6279e9302.jpg	\N	\N
69	BRANDON ROBERTO CORTÉS CORTÉS	21158287-1	41	2024-12-18 15:07:34.084	2024-12-18 15:09:25.117	/uploads/c2b902ff-4b3d-4888-8f81-a1105b03a32d.jpg	\N	\N
60	DARIO PEREZ GABRIELARANDA	18986492-2	41	2024-12-03 21:40:26.098	2024-12-19 20:35:35.558	/uploads/c1654352-13cf-4820-96bd-470379dd50ad.JPG	\N	\N
72	MATIAS RAUL ROJAS ARANDA	20797270-3	41	2024-12-19 20:37:20.399	2024-12-19 20:37:37.149	/uploads/7244658f-d843-4e3f-b931-b54ad9191b39.JPG	\N	\N
58	JOHAN ARIEL PEREZ GUERRA	15923594-7	41	2024-12-03 21:39:43.974	2024-12-19 20:38:27.199	/uploads/52b58287-93c3-4593-a835-d04a82efa785.jpg	\N	\N
59	JUAN ADAN PIZARRO PIZARRO	13360306-9	41	2024-12-03 21:40:05.304	2024-12-19 20:38:45.607	/uploads/15721779-cc66-40a4-b4c9-fc3334f2cb41.JPG	\N	\N
73	JAVIERA ESTEPHANIA ALDARO ANDRADE	20091133-4	41	2024-12-19 20:39:26.21	2024-12-19 20:39:40.418	/uploads/2312ad6a-27fb-4164-9700-cf55f82e93e2.JPG	\N	\N
74	PATRICIA JACQUELINE ARANDA GALLEGUILLOS	15044133-1	41	2024-12-19 20:40:31.057	2024-12-19 20:40:41.59	/uploads/6a717dd0-8ad3-474d-ba0f-31401c20cb48.JPG	\N	\N
75	MARINA ISABEL ARANDA GALLEGUILLOS	12098280-K	41	2024-12-19 20:41:06.781	2024-12-19 20:41:13.57	/uploads/1600339b-69c6-4bc5-92b0-28f7a0ce179b.JPG	\N	\N
76	PEDRO ABEL ARANDA GALLEGUILLOS	10144145-8	41	2024-12-19 20:41:34.866	2024-12-19 20:41:45.155	/uploads/bde3bde3-d221-4137-b765-1abf991ab10b.jpg	\N	\N
77	JUAN CARLOS ARANDA GALLEGUILLOS	12098285-0	41	2024-12-19 20:42:12.535	2024-12-19 20:42:51.181	/uploads/1a28dd56-8027-45b9-b28f-236bf98fcfbe.jpg	\N	\N
50	Javier Isidro Marquez Ardiles	9525734-8	41	2024-11-19 17:32:50.451	2025-01-03 13:53:49.301	/uploads/8fb20231-6d36-4675-bf75-6d18875c6333.JPG	\N	\N
70	Jorge Gonzalez Oyanadel	18757406-4	41	2024-12-19 20:23:25.131	2024-12-26 18:15:41.076	\N	El Colate	\N
10	Alvaro Alejandro Castillo Araya\t	18353552-8	41	2024-11-19 17:32:50.451	2025-04-01 15:53:33.748	/uploads/474f4756-252e-4d7e-9d87-610bd458c754.jpg	\N	\N
12	Francisco Javier Rojas Bustamante	19569013-8	41	2024-11-19 17:32:50.451	2025-01-08 13:01:03.975	/uploads/77b9f06a-aabe-4842-8740-14560afda5cb.jpg	\N	\N
14	Blas De Jesus Rivera Contreras	1031164662	45	2024-11-19 17:32:50.451	2025-01-09 18:10:36.142	/uploads/6d4cc815-434d-4f93-866d-40f82cfe2b98.png	\N	\N
30	Yamir Alexander Yosue Rojas Antiquera	20407328-7	41	2024-11-19 17:32:50.451	2025-06-05 17:31:28.621	/uploads/8bdbad79-9d9e-400b-b89b-b053aebac570.jpg	\N	\N
78	NELSON ENRIQUE PIZARRO PIZARRO	15571682-7	41	2024-12-19 20:43:23.014	2024-12-19 20:43:32.274	/uploads/40e5352a-2b8a-429e-84a4-0e6aafd3edf8.jpg	\N	\N
79	CECILIA SOLEDAD PIZARRO PIZARRO	13976672-5	41	2024-12-19 20:45:00.514	2024-12-19 20:45:09.085	/uploads/183f3a3e-7801-46c8-8f15-e7fdeaee9a9a.JPG	\N	\N
80	MERCEDES LUISA PIZARRO PIZARRO	13181579-4	41	2024-12-19 20:45:43.841	2024-12-19 20:45:57.101	/uploads/21a3073a-4cc2-4eb8-815e-ba98d81f2d64.JPG	\N	\N
81	TYARE IGNACIA MUÑOZ GALLEGUILLOS	20092441-K	41	2024-12-19 20:46:22.101	2024-12-19 20:46:29.198	/uploads/52c6a248-15cc-46ca-bf98-b49fcdcea75f.jpg	\N	\N
82	DIANA FRANCISCA MUÑOZ ARANDA	19944832-3	41	2024-12-19 20:46:50.337	2024-12-19 20:47:03.303	/uploads/927458e7-ba69-45f2-ac46-2c6034e16428.jpg	\N	\N
83	FREDDY ANTONIO ZEPEDA GOMEZ	13330092-9	41	2024-12-19 20:47:35.181	2024-12-19 20:47:45.256	/uploads/68507759-ebdb-4de5-88f0-23da2b088a77.jpg	\N	\N
84	ALVARO IGNACIO ZEPEDA GOMEZ	20310170-8	41	2024-12-19 20:48:45.905	2024-12-19 20:49:03.272	/uploads/eee73f48-e608-41c0-b782-7b2f3551fad9.JPG	\N	\N
85	SANDRA CAROLINA GOMEZ ALFARO	15573364-0	41	2024-12-19 20:49:39.476	2024-12-19 20:49:51.028	/uploads/b18957d7-5649-4c87-a05e-725c15b0a455.JPG	\N	\N
86	RAQUEL YAMILET  ROJAS DIAZ	13536417-7	41	2024-12-19 20:50:36.07	2024-12-19 20:50:50.845	/uploads/823a84ae-c4c9-4cb1-8279-79c5471b82b6.JPG	\N	\N
13	Marlon Stick Duke Garzon	1021667965	45	2024-11-19 17:32:50.451	2025-01-09 17:59:58.626	/uploads/3f3fb8a5-2301-4e6f-a424-086dcd22a70b.png	\N	\N
87	DIEGO ARMANDO CUEVAS SALAZAR	20193475-3	41	2024-12-19 20:51:30.512	2024-12-19 20:53:19.266	/uploads/6a9e7743-dca6-4a4d-ba38-836d43e38a68.jpg	\N	\N
88	CRIST CRISTOPHER BALCAZAR JOFRE	17656092-4	41	2024-12-19 20:53:48.654	2024-12-19 20:54:41	/uploads/0eafec75-a783-44c3-a028-b1af5b584625.jpg	\N	\N
89	IVAN DANIEL GONZALEZ CORTES	18986172-9	41	2024-12-19 20:55:09.508	2024-12-19 20:56:01.834	/uploads/f4fe0833-0bd9-4871-a506-d6edd778af5e.jpg	\N	\N
90	LUIS ALFONSO ESPINOLA JULIO 	20308946-5	41	2024-12-19 20:56:29.336	2024-12-19 20:57:13.446	/uploads/7062973b-9cae-4546-b9f6-99ad5b2513f9.jpg	\N	\N
4	Juan Miguel Pasten Navea	14386098-1	41	2024-11-19 17:32:50.451	2024-12-24 13:14:53.312	/uploads/9fdd60bc-adfd-4592-8d3b-834d18215ab9.jpg	\N	\N
91	ENZO EMILIANO  CORTÉS ALFRED	19154719-5	41	2024-12-30 14:55:48.054	2024-12-30 14:57:23.954	/uploads/77af5695-7b09-44c9-97d4-6a86eb309276.jpg	\N	\N
92	ALADINO JOEL TORO CONTRERAS	15732015-7	41	2024-12-31 14:40:53.798	2024-12-31 14:41:02.253	/uploads/6f7e3ece-2642-49b3-bb09-0f3b6a6ed64e.jpg	\N	\N
93	DYLAN YHUSEPH COVARRUBIAS MARTINEZ\t	22175790-4	41	2024-12-31 14:56:25.419	2024-12-31 14:58:26.777	/uploads/653370a0-6215-4f98-8cd7-0326d3ba0a40.jpg	\N	\N
94	DANIEL ANDRÉS SALFATE ARAYA	20006076-8	41	2024-12-31 16:13:33.49	2024-12-31 16:30:30.535	/uploads/63b09e14-92a2-4ea5-8dd8-010177669ac9.jpg	salfa	\N
116	FERNANDA ADASKA ORDENES MARTINEZ	17722040-K	41	2025-01-21 15:02:41.049	2025-01-21 15:04:31.563	/uploads/d799b94a-7976-41ba-bf37-5368b9f890d8.jpg	\N	\N
96	CRISTIAN CAMILO CORTES LARA	18477943-9	41	2025-01-01 14:41:16.691	2025-01-01 14:44:03.836	/uploads/59887fbd-c423-42d8-9b59-79449f459e19.jpg	\N	\N
97	CARLOS ALBERTO GONZÁLEZ PIZARRO	16527199-8	41	2025-01-01 14:46:12.899	2025-01-01 14:46:23.361	/uploads/b95e7c1d-8c25-4cf9-af09-60aba35a0c44.jpg	\N	\N
98	DIEGO ANDRÉS ROJAS PIZARRO	17827720-0	41	2025-01-01 14:49:39.496	2025-01-01 14:50:12.754	/uploads/c3c07ab7-1972-4385-8aaf-9a896a7f0a5a.jpg	\N	\N
99	FRANCO ALEJANDRO BRAVO VIGORENA	15037750-1	41	2025-01-01 15:01:46.996	2025-01-01 15:02:26.028	/uploads/0669d9de-d905-45f0-ad14-473edc0df1bd.JPG	\N	\N
100	PAUL WILLIAMS MICHEA LARA	19944700-9	41	2025-01-02 14:10:11.637	2025-01-02 14:13:16.85	/uploads/e4d5a276-106a-4928-a50b-8456f63662d2.jpg	\N	\N
101	DAVID NEHEMIAS ARAVENA OLIVAREZ	21118618-6	41	2025-01-02 19:02:27.298	2025-01-02 19:04:37.738	/uploads/a3e80ee3-f3d6-49be-8057-b6690e3b6fef.JPG	\N	\N
103	HAROLD QUINTERO	103116466	45	2025-01-09 18:07:33.36	2025-01-09 18:10:02.663	/uploads/e55bfd2f-ebd5-4510-a493-07e34b911139.png	\N	\N
54	LUCAS SIMON PANAYOTOPULO OJEDA	21448240-1	41	2024-12-03 20:17:41.922	2025-01-06 19:24:19.647	/uploads/e2083759-5793-4bb3-8685-19ee8f29a5c6.jpg	\N	\N
67	JORFAN JOSE RUIZ SANCHEZ	26742528-0	188	2024-12-12 00:48:55.227	2025-01-13 13:44:11.007	/uploads/3292967d-7eb0-40db-b8d4-9df3d5bd8c32.jpg	Dimunuto	\N
102	SEBASTIÁN IGNACIO GODOY VILCHES	20840292-7	41	2025-01-02 20:18:50.213	2025-01-08 22:14:56.76	/uploads/e8a7cfa6-459a-4c43-906f-2f5c95e5f223.jpg	El rubio	\N
104	WILSON ANTONIO ARANDA CASANOVA	19256488-3	41	2025-01-13 20:33:58.628	2025-01-13 20:33:58.628	\N	\N	\N
112	CLAUDIO FERNANDO LAZCANO MOLINA	16053623-3	41	2025-01-21 12:29:23.198	2025-01-21 12:31:55.808	/uploads/eaad7c70-f345-499e-9025-302041b9f019.jpg	Cabeza de Agua, chiu chiu	\N
113	HUGO ANDRES PEREZ PEREZ	16053158-4	41	2025-01-21 14:52:18.162	2025-01-21 14:55:39.726	/uploads/0bb5fb0a-4f01-44fe-97b2-bc23da1a0753.jpg	\N	\N
106	FRANCO RICHARD REYES SALGADO	12886451-2	41	2025-01-15 15:35:00.598	2025-01-15 15:35:25.007	/uploads/7e48d660-1e99-4dda-b708-12d0d06f9dd7.jpg	\N	\N
107	GIANCARLO IVÁN ÁLVAREZ MILLA	16527259-5	41	2025-01-15 19:59:57.387	2025-01-15 20:00:14.937	/uploads/4f619da6-d3b0-46d1-835e-3610d08d6737.JPG	\N	\N
108	JESÚS SALVADOR MOLINA ORELLANA	17409743-7	41	2025-01-15 20:22:10.831	2025-01-15 20:24:10.948	/uploads/2f4120f2-7fdc-47b6-a17a-f3a220e1bbf0.jpg	\N	\N
95	CLAUDIO EDUARDO BRAVO VIGORENA	17409877-8	41	2025-01-01 14:39:46.548	2025-01-16 12:50:15.301	/uploads/4029dcc9-fdc8-4266-8545-f5d1be9d3a52.jpg	PITA	\N
109	JONATHAN IVÁN CARVAJAL MILLA	15968487-3	41	2025-01-19 15:48:26.027	2025-01-19 15:48:26.027	\N	\N	\N
110	WILSON ELIAS VEGA ORTEGA	17655603-K	41	2025-01-20 11:44:37.107	2025-01-20 11:44:37.107	\N	\N	\N
105	RICARDO ANTONIO RUIZ BASTÍAS	17410068-3	41	2025-01-15 15:18:14.924	2025-01-20 14:02:40.298	/uploads/1e6fe080-1d9f-4325-af8c-bd1de9e6988f.jpg	EL JETA	\N
114	KARIN JOHANNA AHUMADA AHUMADA	15056272-4	41	2025-01-21 14:59:09.455	2025-01-21 14:59:33.061	/uploads/79a1062d-8111-42ef-b827-acdb2feba505.jpg	\N	\N
115	CESAR ANTONIO MONDACA GALLARDO	16189203-3	41	2025-01-21 15:01:19.054	2025-01-21 15:02:50.028	/uploads/ffcddb87-be37-429e-904a-69678603b40f.jpg	\N	\N
118	GREGORIO SERGIO MUÑOZ GALLARDO	13224071-K	41	2025-01-21 15:35:30.954	2025-01-21 15:36:10.89	/uploads/3f79880a-62dd-4e9a-8cc7-9a590e02717c.JPG	 	\N
117	CARLOS MAURICIO GUERRERO YAÑEZ	12843186-1	41	2025-01-21 15:33:51.909	2025-01-21 15:34:43.861	/uploads/4e53eb7c-f22c-4f19-91ea-fe60740e1af9.jpg	 	\N
119	JUAN ANTONIO PINTO LOPEZ	10264265-1	41	2025-01-21 15:37:20.442	2025-01-21 15:38:16.111	/uploads/7464ac6a-e1c9-4f2f-8842-55d1c833c46c.JPG	\N	\N
120	NICOLÁS ESTEBAN BARRERA TAPIA	17847130-9	41	2025-01-21 15:58:39.429	2025-01-21 15:58:39.429	\N	\N	\N
111	VÍCTOR HUGO CARREÑO JORQUERA	15617865-9	41	2025-01-21 12:27:12.662	2025-01-21 21:07:31.697	/uploads/16a5f13d-d634-4735-9d15-aaf9c9657752.jpg	stuart	\N
121	MARYLIN ISABEL ROJAS GUERRERO	18494966-0	41	2025-01-21 15:59:21.733	2025-01-21 16:03:22.102	/uploads/a63c7297-c3db-403f-a462-536e44dd9847.png	\N	\N
123	Gerald Alexis ÁGUILA MALDONADO	18381207-6	41	2025-01-30 12:27:02.405	2025-01-30 12:28:03.078	/uploads/4b801e7e-7596-4cf9-939b-2d93b5681dd5.jpg	\N	\N
122	EMANUEL ALFONSO MANCERA	26107347-1	45	2025-01-30 12:26:38.946	2025-01-30 12:28:26.314	/uploads/5fd2f28a-d003-4c1f-adf7-f276da637ac3.jpg	\N	\N
125	GERALD MAURICIO VALDERRAMA SOTO	23646762-7	41	2025-02-03 12:27:13.166	2025-02-03 12:44:25.82	/uploads/208db626-f22f-41fc-b995-abc08a79fd16.JPG	\N	\N
124	BRAYHAN DANIEL MONTES OYARZUN	20098486-2	41	2025-02-03 12:26:35.533	2025-02-03 12:45:28.979	/uploads/6e9c14b5-c8ba-4eb2-bbcb-51a008913328.JPG	\N	\N
126	Orlando Javier Silva Araya	17712493-1	41	2025-02-28 17:59:34.807	2025-02-28 17:59:50.669	/uploads/c7cf7471-adf7-4887-80e9-c73d77166205.jpg	\N	\N
127	ADOLFO ANDRES DA COSTA PARRA	20406242-0	41	2025-03-04 15:26:57.172	2025-03-04 15:27:12.531	/uploads/ea40b661-4289-4a6c-8ddb-3b190ad5bb03.JPG	\N	\N
128	JAIME MAURICIO MARTINEZ BARRAZA	15050783-9	41	2025-03-10 13:10:27.402	2025-03-10 13:10:27.402	\N	\N	\N
129	NICOLAS ALBERTO TRIPAINAO SALAS	19771110-8	41	2025-03-19 18:10:02.329	2025-03-19 18:11:06.547	/uploads/7b0158f4-ba79-479e-8d83-dd8cb2abfa74.jpg	\N	\N
130	ALEXANDER ESTEBAN VILLEGAS CONCHA	21715354-9	41	2025-03-20 20:07:27.598	2025-03-20 20:12:27.435	/uploads/2695a1fc-1be4-46c8-b4cf-5c6f1a23c2be.jpg	\N	\N
131	FERNANDO EDUARDO MELLA BLAMEY	21366648-7	41	2025-03-22 18:20:35.388	2025-03-22 18:21:11.859	/uploads/da208497-7649-47e5-9e61-86c8d5139aca.jpg	\N	\N
132	FRANCISCO ANTONIO ROJAS SAAVEDRA	19948892-9	41	2025-03-22 18:23:49.815	2025-03-22 18:24:55.919	/uploads/d02077c7-6a34-45a0-a442-48162c21fc0b.jpg	\N	\N
133	JOAQUÍN IGNACIO GARCÍA JIMÉNEZ	21389209-6	41	2025-03-22 18:26:43.293	2025-03-22 18:26:43.293	\N	\N	\N
161	FRANCISCO RUBÉN HERRERA AGUIRRE	16443736-1	41	2025-04-16 20:23:57.813	2025-04-16 20:24:36.851	/uploads/f9f31349-6997-43b3-bece-ddc966993e0c.JPG	\N	\N
134	JHON CLAUDIO ARAYA CASTRO	19450254-0	41	2025-03-22 18:27:20.811	2025-03-22 18:30:00.328	/uploads/8aa55153-7bf4-4e25-9667-fa2fb82949b5.jpg	 	\N
135	BENJAMÍN MATÍAS GONZÁLEZ TAPIA	21064999-9	41	2025-03-22 18:33:21.531	2025-03-22 18:33:34.415	/uploads/837173b7-86e4-4b69-9eda-360cca225c62.jpg	\N	\N
136	VICENTE VARGAS SILVA	20457059-0	41	2025-03-22 18:37:24.175	2025-03-22 18:37:24.175	\N	\N	\N
138	LUIS DIEGO CASTRO MENESES	19947659-9	41	2025-03-22 18:48:57.778	2025-03-22 18:49:04.751	/uploads/c3f7164c-6b50-4da0-b7e5-359a6512a07d.jpg	\N	\N
137	MAXIMILIANO JESÚS AMÉSTICA CORDONES	21788533-7	41	2025-03-22 18:48:43.498	2025-03-22 18:49:31.553	/uploads/a1047310-3321-47e5-a8d6-12ab915ea0d8.jpg	\N	\N
139	ALEJANDRO HUMBERTO CASTRO VILLEGAS	21750203-9	41	2025-03-22 19:19:15.124	2025-03-22 19:19:42.232	/uploads/6369319e-453b-4578-8449-eb390bef3dc1.jpg	\N	\N
142	Tulio Abreu 	22222222-2	240	2025-04-01 18:22:56.329	2025-04-01 18:24:06.758	/uploads/10acef92-ef33-4b98-a021-4fffcb7b3328.jpg	\N	\N
143	JULIANO MIRLENKO MELLA FLORES	11742507-K	41	2025-04-10 14:44:05.857	2025-04-10 14:45:23.638	/uploads/6fc4824a-afc6-487d-8595-0199990cc1d6.JPG	\N	\N
144	FRANCO JULIANO MELLA VELAZCO	19949620-4	41	2025-04-10 14:46:28.481	2025-04-10 14:46:47.862	/uploads/0e65f931-9a98-4551-aadb-5157ac47bbde.JPG	\N	\N
145	DARWIN EDGARDO CARMONA VELAZCO	17628905-8	41	2025-04-10 14:48:08.963	2025-04-10 14:48:24.203	/uploads/f1915203-ae53-4aa1-bc76-bef63b587d95.JPG	\N	\N
148	JORDAN JOSE SALAS RODRIGUEZ	14898287-2	240	2025-04-16 19:06:03.993	2025-04-16 19:06:03.993	\N	\N	\N
149	ENDER ALEXIS ROJAS MONTANA	14952572-6	41	2025-04-16 19:07:07.43	2025-04-16 19:07:07.43	\N	\N	\N
150	LUIS ENRIQUE RANGEL	14950461-3	41	2025-04-16 19:07:55.339	2025-04-16 19:07:55.339	\N	\N	\N
153	MIGUEL ARTURO DOMINGUEZ SANCHEZ	26387729-2	240	2025-04-16 19:09:34.578	2025-04-16 19:09:34.578	\N	\N	\N
154	LARRY AMAURY ALVAREZ NUÑEZ	27032844-K	240	2025-04-16 19:09:59.337	2025-04-16 19:09:59.337	\N	\N	\N
155	DONOVAN ALLISON TELLERIA TORRES	14899751-9	240	2025-04-16 19:10:24.631	2025-04-16 19:10:24.631	\N	\N	\N
156	JOSE RAFAEL RUIZ LIAS	28198329-6	240	2025-04-16 19:11:32.241	2025-04-16 19:11:32.241	\N	\N	\N
157	PABLO JOSE LEON FLORES	28232775-9	240	2025-04-16 19:12:13.103	2025-04-16 19:12:13.103	\N	\N	\N
158	JONATHAN ALFREDO JIMENEZ TORREJÓN	20092389-8	41	2025-04-16 19:51:21.718	2025-04-16 19:52:37.306	/uploads/fcc1c04f-0bac-4fba-b1da-dc5b2e3e3dc6.jpg	\N	\N
159	DIEGO RODRIGO AMADO BARRAZA DA COSTA	21540453-6	41	2025-04-16 20:06:31.345	2025-04-16 20:07:22.918	/uploads/38a30217-3945-49bb-97c1-c4e231f72511.jpg	\N	\N
160	JOSÉ PABLO PÉREZ CAMPOS	21636050-8	41	2025-04-16 20:09:23.336	2025-04-16 20:09:23.336	\N	\N	\N
162	JUAN RODRIGO HERRERA AGUIRRE	17293762-4	41	2025-04-16 20:26:34	2025-04-16 20:26:52.685	/uploads/1e503bbb-120a-4f23-923a-7e19bc9500c3.JPG	\N	\N
151	JAIMIR USUGA ROJAS	26953355-2	41	2025-04-16 19:08:35.48	2025-04-16 23:34:47.546	/uploads/57626f8f-8ef8-4895-b494-490955447cd3.jpg	\N	\N
147	FRANYOFERID JOSE TORRES TORRES	27165834-6	240	2025-04-16 19:04:55.31	2025-04-16 23:35:49.455	/uploads/ee4dd04c-7698-494e-bbfe-dec32e4d52c8.jpg	\N	\N
163	VICENTE BENJAMÍN GUERRERO GUERRERO	20718745-3	41	2025-04-29 14:17:34.522	2025-04-29 14:18:38.547	/uploads/0c970c46-6e4a-40ec-88ac-0871acc95ce3.jpg	\N	\N
164	IVAN SACHA MENDIETA RIVERA	12030297-3	41	2025-05-21 22:26:23.265	2025-05-21 22:34:23.412	/uploads/71b08ed7-6199-4359-9699-347d6b0307ec.png	\N	\N
166	JOSE ALEJANDRO MEDINA LADERA	27923776-5	240	2025-05-21 22:40:36.515	2025-05-21 22:40:49.848	/uploads/18598306-5a1a-4f86-b477-b6cfea6ebdf2.jpg	\N	\N
172	GIPSY ALEJANDRA ARQUEROS VERGARA	19948075-8	41	2025-06-10 14:10:04.952	2025-06-10 14:10:04.952	\N	\N	\N
168	SILVIO MANUEL MOLINA ÁVILA	17014873-8	41	2025-05-22 13:33:04.13	2025-05-22 13:33:21.117	/uploads/f7f2ade8-6edb-44e5-b634-d3438df5d596.jpg	\N	\N
167	DAVID ALEJANDRO MAZZOLOTTI CANTO	17014873-8	41	2025-05-22 13:30:00.983	2025-05-22 13:34:18.461	/uploads/48b512b1-5157-44b6-ac00-fc7f43bf7b89.jpg	Cabeza de Perro	\N
173	ALEJANDRO RENÉ ARQUEROS TAPIA	13018392-1	41	2025-06-10 14:14:05.284	2025-06-10 14:14:05.284	\N	\N	\N
140	JOSE ANTONIO\tABREU HERNANDEZ	28247385-2	240	2025-04-01 14:23:33.024	2025-06-04 16:16:26.756	/uploads/e30bd64a-839d-4856-8ed8-7fef7addb291.jpg	\N	\N
174	EUGENIO ALEJANDRO ALVARADO DÍAZ	11328151-0	41	2025-06-10 14:33:58.912	2025-06-10 14:34:12.033	/api/uploads/bfdc2ef2-57d7-4603-899a-9e9dccfdda77.jpg	\N	\N
169	ANGELO EDUARDO ADAROS VERGARA	17016691-4	41	2025-06-04 16:22:09.584	2025-06-04 16:25:12.275	/uploads/ac268e58-7c33-450a-9341-6ef086a89893.jpg	\N	\N
175	TEOFILO MIRANDA CARDENAS	24570815-7	28	2025-06-10 15:02:15.206	2025-06-10 15:04:48.11	/api/uploads/fa9bc284-3ada-4e33-a463-7991e5e03895.png	\N	\N
176	YONAIKER SEQUERA OLIVERA	28126318-8	240	2025-06-10 15:29:55.56	2025-06-10 15:29:55.56	\N	\N	\N
177	TAMARA SOLANGE PEÑA AROS	17979319-9	41	2025-06-10 18:37:33.665	2025-06-10 18:37:43.056	/api/uploads/32257e8c-a01b-4eb0-8542-9a69d37e8e3b.jpg	\N	\N
178	NOLFA ANTONIA REVECO CATALDO	17761364-9	41	2025-06-10 18:40:26.177	2025-06-10 18:41:43.401	/api/uploads/bc4a342a-c81f-4c6a-b46e-1ab792b55c7a.jpg	\N	\N
179	RIGOBERTO DANILO ESCOBAR VALDIVIA	17878606-7	41	2025-06-10 18:42:19.098	2025-06-10 18:42:38.072	/api/uploads/dad16fbb-d70c-4a00-a1a2-35c3946e71de.jpg	\N	\N
180	PATRICK FERNANDO ZAMBRA FERNANDEZ	20740724-0	41	2025-06-10 18:44:04.188	2025-06-10 18:44:40.831	/api/uploads/a4c15d52-6bd6-4a76-afa0-7fb1a115511b.jpg	\N	\N
181	JORGE GIOVANNI MIRANDA PIZARRO	17772247-2	41	2025-06-10 18:45:42.738	2025-06-10 18:47:03.931	/api/uploads/5b860c1b-c15e-419a-a678-d930972a6094.jpg	\N	\N
183	Leandro Gonzalo Cortés Morata	15595345-4	41	2025-06-16 19:22:40.333	2025-06-16 19:23:31.849	/api/uploads/7fa955a5-26be-4dc8-a8d2-86d0d1fb56f8.jpg	\N	\N
141	Ronald Vera	11111111-1	240	2025-04-01 18:15:31.911	2025-07-21 13:43:42.922	/uploads/48595ef9-55dc-4ff1-9fde-b55b3bf8c635.jpg	\N	\N
165	JUAN CARLOS OLLARVES MATHEUS	28434306-9	240	2025-05-21 22:37:22.586	2025-08-25 19:08:55.193	/api/uploads/8d5540a4-2937-475b-bbac-fd35b1d4ea36.png	PARCE, CATALEYA	\N
186	Alejandro Segisfredo Castro Acosta 	13424031-8	41	2025-06-19 12:58:24.111	2025-06-19 12:58:24.111	\N	\N	\N
190	Osvalo Javier Torrejon Baquedano	17015497-5	41	2025-06-19 13:00:16.032	2025-06-19 13:00:16.032	\N	\N	\N
191	PATRICIO JAVIER ALVAREZ ORDENES 	21449869-3	41	2025-06-19 13:00:34.349	2025-06-19 13:00:34.349	\N	\N	\N
192	Cristobal Ignacio Marambio Aliaga	19507057-1	41	2025-06-19 13:01:29.661	2025-06-19 13:04:43.353	/api/uploads/ffda8b50-4762-4a14-961a-e2c7a643f270.jpg	\N	\N
182	Rodrigo Alejandro Cabrera Ortiz	12843249-3	41	2025-06-16 13:03:35.5	2025-06-19 13:05:11.39	/api/uploads/813fe30a-a609-4158-9bb1-2daadfcfa137.jpg	\N	\N
184	Daniel Fernando Chacana Piñones	16110641-0	41	2025-06-19 12:56:36.453	2025-06-19 13:05:33.399	/api/uploads/8bc8c816-2aea-4289-8951-ac4645ab5f40.jpg	\N	\N
188	FERNANDO FABIAN SEGOVIA VELIZ\t	20406755-4	41	2025-06-19 12:59:24.228	2025-06-19 13:05:58.325	/api/uploads/18ff0f1e-4c1d-4045-b38d-5914f834f1b6.jpg	\N	\N
185	Paul Jeremy Opazo	19507147-0	41	2025-06-19 12:57:39.047	2025-06-19 13:06:17.149	/api/uploads/563ca73b-d5bb-4b7f-85b4-eab61f4bbe4e.jpg	\N	\N
187	Brayan Cliff Carmona Carmona	16687862-4	41	2025-06-19 12:58:55.399	2025-06-19 13:06:40.809	/api/uploads/6f376c4f-2def-4c45-8f2b-ba35c9b7d3ff.jpg	\N	\N
193	Alan Sebastian Huerta Barraza	21145885-2	41	2025-06-19 13:14:21.97	2025-06-19 13:14:34.189	/api/uploads/07723b22-9162-46ff-811c-6dda117a17c2.jpg	\N	\N
194	BORIS YORDANYS CARRASCO VELIZ	19770060-2	41	2025-06-24 17:35:51.836	2025-06-24 17:35:51.836	\N	\N	\N
195	MARCOS EZEQUIEL CASTILLO ESCUDERO	21733252-4	41	2025-06-24 17:38:52.143	2025-06-24 17:39:12.004	/api/uploads/f95afb40-48db-4466-8c16-7d3d2c93875f.jpg	\N	\N
48	Brian Anthonie Lopetegui Vicuña	20127204-1	41	2024-11-19 17:32:50.451	2025-06-25 16:31:04.732	/api/uploads/21bc8c4e-c22f-4347-991d-36fa92334f4a.jpg	\N	\N
196	LUIS ALEJANDRO MORA CARVAJAL	13359350-0	41	2025-06-25 19:51:31.314	2025-06-25 19:51:31.314	\N	\N	\N
198	CRISTIAN IGNACIO CARVAJAL ACEVEDO	17294544-9	41	2025-07-03 15:56:08.481	2025-07-03 15:56:17.094	/api/uploads/c8d09ef6-cd1d-4196-820e-4f8f57b2bb1c.jpg	\N	\N
212	RUBEN ALEXIS BUGUEÑO CORTES	16893338-K	41	2025-08-07 13:03:05.493	2025-08-07 13:03:05.493	\N	\N	\N
199	Paul Tabilo Navarro 	20950556-8	41	2025-07-04 13:30:47.056	2025-07-04 13:37:32.462	/api/uploads/388a9112-e8b3-4dd0-8dec-b1d2c0cd69cd.JPG		\N
200	ROBERT WILLIAMS OYANEDEL GUERRERO	17978948-5	41	2025-07-04 13:40:15.959	2025-07-04 13:41:24.314	/api/uploads/1a8fe468-429e-4c80-8dee-8738e14090c9.JPG	\N	\N
170	Sebastián Maximiliano Bolados Llancapichun	18178826-7	41	2025-06-06 13:32:25.648	2025-07-09 13:42:00.908	/api/uploads/079fed74-b0da-4bcc-94d7-2668869d8876.jpeg	\N	\N
201	PATRICIO ANDRÉS PINTO ÁVILA	17253950-5	41	2025-07-10 22:01:44.139	2025-07-10 22:01:53.978	/api/uploads/abe0ff5b-5836-4849-a78e-56f7151dc50b.jpg	\N	\N
202	CLAUDIO ENRIQUE CORTÉS CORTÉS	12447032-3	41	2025-07-11 14:32:47.836	2025-07-11 14:33:09.901	/api/uploads/6abb060a-12b2-4339-b4c8-06b181fd0b5f.jpg	\N	\N
203	BASTIÁN NICOLÁS MUÑOZ PÉREZ	20740633-3	41	2025-07-14 14:16:37.958	2025-07-14 14:16:43.748	/api/uploads/af42b32d-404d-44ae-a340-2c7b6eb8c305.jpg	\N	\N
204	CARLOS ROBERTO OSSANDON ARAYA	20718939-1	41	2025-07-17 19:35:40.48	2025-07-17 19:36:26.989	/api/uploads/57160881-1031-4854-85ef-f4a6cd3b0738.jpg	\N	\N
205	PAUL JEREMY OPAZO MILLA	19507147-0	41	2025-07-17 19:37:14.803	2025-07-17 19:38:01.271	/api/uploads/beeb996a-218c-4aa0-9c3a-30ab448880d5.jpg	\N	\N
189	SEBASTIAN ANDRES LARA ORTIZ 	18179453-4	41	2025-06-19 12:59:42.804	2025-07-17 19:45:08.818	/api/uploads/496cd1d1-9c45-48f3-820e-8f92fbd2d2d2.jpg	\N	\N
207	FRANKLIN JAVIER ZENTENO PINTO	28922903-5	240	2025-07-23 15:45:04.181	2025-07-23 15:49:09.729	/api/uploads/d10252dd-d45f-4f7e-83a8-a27c00bc4bf4.png	\N	\N
208	ROBERT DAVID CENTENO PINTO	0000000-0	240	2025-07-23 15:57:53.25	2025-07-23 15:58:06.023	/api/uploads/a37192d2-ded4-4653-a630-99f7881aae10.jpeg	\N	\N
209	JOSE GREGORIO RODRIGUEZ MARCELO	00000000-0	240	2025-07-23 16:00:02.392	2025-07-23 16:00:18.586	/api/uploads/4b670189-00fb-43a6-987a-3f6b47ec5e22.jpeg	\N	\N
213	Juan Ignacio Riveros Rojas	19771112-4	41	2025-08-07 13:49:27.614	2025-08-07 13:49:27.614	\N	\N	\N
210	EDUARDO RAMON SANTANA PARRA 	00000000-0	240	2025-07-23 16:05:47.059	2025-07-23 16:15:22.951	/api/uploads/b3b21f60-63a9-4d9f-8d0f-a3f57a508b9d.png		\N
211	EMILIO DANIEL SALCEDO ARROYO	00000000-0	240	2025-07-23 16:18:45.31	2025-07-23 16:19:06.239	/api/uploads/b0fba886-95c7-4564-9b70-f859ecfd13e5.png	\N	\N
214	 Diego Andrés Véliz Véliz	20168224-K	41	2025-08-07 16:19:01.018	2025-08-07 16:19:20.492	/api/uploads/bc41c3e6-765d-4006-851e-7fd846b707c0.jpg	\N	\N
215	Samuel Ignacio Gómez Leyton	19771235-K	41	2025-08-14 16:11:24.614	2025-08-14 16:17:47.955	/api/uploads/f6a1a91a-9ac6-4ea4-9e6f-ab8d8f8c4bac.JPG	nacho	\N
197	RODRIGO MAXIMILIANO ROJAS VALDIVIA 	18353545-5	41	2025-06-27 17:20:49.128	2025-08-17 01:43:37.905	/api/uploads/f3f05fdc-0dea-41f5-b6e5-cfe2a0a5ed21.jpg	TOTANO	\N
216	DIEGO ANTONIO BURROWS BARRAZA	18633065-K	41	2025-08-27 13:50:44.532	2025-08-27 13:50:44.532	\N	\N	\N
217	RAÚL ALEJANDRO DÍAZ CODOCEO	18003106-5	41	2025-08-27 13:52:12.275	2025-08-27 13:52:12.275	\N	\N	\N
218	NATALIA ELIZABETH MORALES ZULETA	18235572-0	41	2025-08-27 13:55:58.794	2025-08-27 13:55:58.794	\N	\N	\N
219	MAICOL JONATHAN MORALES GUZMÁN	16110687-9	41	2025-08-27 14:33:03.457	2025-08-27 14:33:03.457	\N	\N	\N
220	IVÁN LUIS MENESES LEYTON	19888772-2	41	2025-08-27 19:09:31.907	2025-08-27 19:09:31.907	\N	\N	\N
221	ELADIO ENRIQUE GARCÍA ROJAS	10820707-8	41	2025-08-27 19:51:56.819	2025-08-27 19:51:56.819	\N	\N	\N
223	Misael Ignacio Olivares Pastén	22510391-7	41	2025-08-27 20:17:57.562	2025-08-27 20:17:57.562	\N	\N	\N
224	JHON MARIO BETANCOURT CASTAÑO	14676778	45	2025-08-27 20:29:17.55	2025-08-27 20:29:17.55	\N	\N	\N
225	JOSÉ IGNACIO GAMBOA RIVERA	18823659-6	41	2025-08-29 16:48:58.529	2025-08-29 16:48:58.529	\N	\N	\N
226	Rodrigo Gabriel Castro Rojo	22432988-1	41	2025-09-01 13:19:36.308	2025-09-01 13:19:36.308	\N	\N	\N
227	Yair Alexander Rojas Alarcón	21926977-3	41	2025-09-01 13:20:40.271	2025-09-01 13:21:00.959	/api/uploads/737ef68a-627a-4950-9bbc-2ce49cca518d.jpeg	\N	\N
\.


--
-- Data for Name: MIHallazgos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MIHallazgos" (id, nombre) FROM stdin;
1	Droga
2	Armas
3	Municiones
4	Vestimentas policías
5	Teléfonos
6	Otros
\.


--
-- Data for Name: MedidaIntrusiva; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MedidaIntrusiva" (id, causa_id, tipo_medida_id, fiscal_id, tribunal_id, cantidad_domicilios, domicilios_aprobados, detenidos, unidad_policial_id, "fechaSolicitud", "nombreJuez", estado, observacion, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Medida_Hallazgo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Medida_Hallazgo" (medida_id, hallazgo_id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MiembrosOrganizacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MiembrosOrganizacion" (id, "organizacionId", "imputadoId", rol, "fechaIngreso", "fechaSalida", activo, "createdAt", "updatedAt") FROM stdin;
15	4	70	Lider	2024-12-19 00:00:00	\N	t	2024-12-19 20:26:13.961	2024-12-19 20:26:13.961
16	4	56	Colaborador	2024-12-19 00:00:00	\N	t	2024-12-19 20:27:09.283	2024-12-19 20:27:09.283
17	4	42		2024-12-19 00:00:00	\N	t	2024-12-19 20:27:58.033	2024-12-19 20:27:58.033
18	5	65		2024-12-19 00:00:00	\N	t	2024-12-19 20:29:13.945	2024-12-19 20:29:13.945
19	5	63		2024-12-19 00:00:00	\N	t	2024-12-19 20:29:29.565	2024-12-19 20:29:29.565
20	5	61		2024-12-19 00:00:00	\N	t	2024-12-19 20:29:56.661	2024-12-19 20:29:56.661
21	5	62		2024-12-19 00:00:00	\N	t	2024-12-19 20:30:11.79	2024-12-19 20:30:11.79
22	6	58	Lider	2024-12-19 00:00:00	\N	t	2024-12-19 20:31:56.332	2024-12-19 20:31:56.332
23	6	59	Lider	2024-12-19 00:00:00	\N	t	2024-12-19 20:32:10.173	2024-12-19 20:32:10.173
24	6	60		2024-12-19 00:00:00	\N	t	2024-12-19 20:58:38.041	2024-12-19 20:58:38.041
25	6	71		2024-12-19 00:00:00	\N	t	2024-12-19 20:58:45.945	2024-12-19 20:58:45.945
26	6	72		2024-12-19 00:00:00	\N	t	2024-12-19 20:59:07.386	2024-12-19 20:59:07.386
27	6	73		2024-12-19 00:00:00	\N	t	2024-12-19 20:59:40.656	2024-12-19 20:59:40.656
28	6	74		2024-12-19 00:00:00	\N	t	2024-12-19 21:00:28.207	2024-12-19 21:00:28.207
29	6	75		2024-12-19 00:00:00	\N	t	2024-12-19 21:00:49.37	2024-12-19 21:00:49.37
30	6	76		2024-12-19 00:00:00	\N	t	2024-12-19 21:00:58.064	2024-12-19 21:00:58.064
31	6	77		2024-12-19 00:00:00	\N	t	2024-12-19 21:01:16.725	2024-12-19 21:01:16.725
32	6	78		2024-12-19 00:00:00	\N	t	2024-12-19 21:01:36.228	2024-12-19 21:01:36.228
33	6	79		2024-12-19 00:00:00	\N	t	2024-12-19 21:03:02.322	2024-12-19 21:03:02.322
34	6	80		2024-12-19 00:00:00	\N	t	2024-12-19 21:03:14.838	2024-12-19 21:03:14.838
35	6	81		2024-12-19 00:00:00	\N	t	2024-12-19 21:03:28.526	2024-12-19 21:03:28.526
36	6	82		2024-12-19 00:00:00	\N	t	2024-12-19 21:03:39.493	2024-12-19 21:03:39.493
37	6	83		2024-12-19 00:00:00	\N	t	2024-12-19 21:03:50.515	2024-12-19 21:03:50.515
38	6	84		2024-12-19 00:00:00	\N	t	2024-12-19 21:04:03.662	2024-12-19 21:04:03.662
39	6	85		2024-12-19 00:00:00	\N	t	2024-12-19 21:04:26.44	2024-12-19 21:04:26.44
40	6	86		2024-12-19 00:00:00	\N	t	2024-12-19 21:04:36.879	2024-12-19 21:04:36.879
41	6	87		2024-12-19 00:00:00	\N	t	2024-12-19 21:04:45.45	2024-12-19 21:04:45.45
42	6	88		2024-12-19 00:00:00	\N	t	2024-12-19 21:05:04.828	2024-12-19 21:05:04.828
43	6	89		2024-12-19 00:00:00	\N	t	2024-12-19 21:05:13.411	2024-12-19 21:05:13.411
44	6	90		2024-12-19 00:00:00	\N	t	2024-12-19 21:05:24.788	2024-12-19 21:05:24.788
52	7	105	compañero de delito	2025-01-15 00:00:00	\N	t	2025-01-15 15:21:37.124	2025-01-15 15:21:37.124
46	7	95	Lider	2025-01-01 00:00:00	\N	t	2025-01-01 14:42:27.027	2025-01-01 14:42:27.027
47	7	96	Integrante	2025-01-01 00:00:00	\N	t	2025-01-01 14:42:38.391	2025-01-01 14:42:38.391
48	7	97	Integrante	2025-01-01 00:00:00	\N	t	2025-01-01 14:46:43.917	2025-01-01 14:46:43.917
49	7	98	Integrante	2025-01-01 00:00:00	\N	t	2025-01-01 14:49:57.777	2025-01-01 14:49:57.777
50	7	99	Integrante	2025-01-01 00:00:00	\N	t	2025-01-01 15:02:50.741	2025-01-01 15:02:50.741
51	7	104	Integrante	2025-01-13 00:00:00	\N	t	2025-01-13 20:34:17.965	2025-01-13 20:34:17.965
53	7	107	Compañero de delito	2025-01-15 00:00:00	\N	t	2025-01-15 20:00:47.022	2025-01-15 20:00:47.022
54	7	108	Lider (antiguo) cumpliendo condena	2025-01-15 00:00:00	\N	t	2025-01-15 20:26:05.273	2025-01-15 20:26:05.273
55	8	114	Punta de Lanza, pareja de Hugo Perez	2025-01-21 00:00:00	\N	t	2025-01-21 15:21:48.688	2025-01-21 15:21:48.688
56	8	113	Lider	2025-01-21 00:00:00	\N	t	2025-01-21 15:22:14.132	2025-01-21 15:22:14.132
57	8	115	Venta y recolección de dinero	2025-01-21 00:00:00	\N	t	2025-01-21 15:23:03.364	2025-01-21 15:23:03.364
58	8	116	Parejade Cesar Mondaca, Captadora	2025-01-21 00:00:00	\N	t	2025-01-21 15:24:05.036	2025-01-21 15:24:05.036
59	8	117	Lider	2025-01-21 00:00:00	\N	t	2025-01-21 15:39:02.482	2025-01-21 15:39:02.482
60	8	119		2025-01-21 00:00:00	\N	t	2025-01-21 15:41:26.766	2025-01-21 15:41:26.766
61	8	118		2025-01-21 00:00:00	\N	t	2025-01-21 15:42:05.523	2025-01-21 15:42:05.523
62	10	131	Lider	2025-03-22 00:00:00	\N	t	2025-03-22 18:38:00.728	2025-03-22 18:38:00.728
63	10	136		2025-03-22 00:00:00	\N	t	2025-03-22 18:38:33.106	2025-03-22 18:38:33.106
64	10	135		2025-03-22 00:00:00	\N	t	2025-03-22 18:38:48.09	2025-03-22 18:38:48.09
65	10	134		2025-03-22 00:00:00	\N	t	2025-03-22 18:39:08.283	2025-03-22 18:39:08.283
66	10	132		2025-03-22 00:00:00	\N	t	2025-03-22 18:39:45.707	2025-03-22 18:39:45.707
67	10	133		2025-03-22 00:00:00	\N	t	2025-03-22 18:40:02.359	2025-03-22 18:40:02.359
68	11	138	Lider	2025-03-22 00:00:00	\N	t	2025-03-22 18:50:20.683	2025-03-22 18:50:20.683
69	11	137		2025-03-22 00:00:00	\N	t	2025-03-22 18:50:34.613	2025-03-22 18:50:34.613
70	10	139		2025-03-22 00:00:00	\N	t	2025-03-22 19:20:09.288	2025-03-22 19:20:09.288
71	12	142	No definido el rol	2025-04-01 00:00:00	\N	t	2025-04-01 19:00:34.73	2025-04-01 19:00:34.73
72	12	140	No definido el rol	2025-04-01 00:00:00	\N	t	2025-04-01 19:00:42.713	2025-04-01 19:00:42.713
73	12	141	No definido el rol	2025-04-01 00:00:00	\N	t	2025-04-01 19:00:53.913	2025-04-01 19:00:53.913
74	12	10	No definido el rol	2025-04-01 00:00:00	\N	t	2025-04-01 19:01:06.808	2025-04-01 19:01:06.808
75	13	147		2025-04-16 00:00:00	\N	t	2025-04-16 19:13:48.174	2025-04-16 19:13:48.174
76	13	148		2025-04-16 00:00:00	\N	t	2025-04-16 19:13:56.113	2025-04-16 19:13:56.113
77	13	149		2025-04-16 00:00:00	\N	t	2025-04-16 19:14:03.18	2025-04-16 19:14:03.18
78	13	150		2025-04-16 00:00:00	\N	t	2025-04-16 19:14:14.928	2025-04-16 19:14:14.928
79	13	151		2025-04-16 00:00:00	\N	t	2025-04-16 19:14:23.503	2025-04-16 19:14:23.503
81	13	153		2025-04-16 00:00:00	\N	t	2025-04-16 19:15:06.586	2025-04-16 19:15:06.586
82	13	154		2025-04-16 00:00:00	\N	t	2025-04-16 19:15:15.997	2025-04-16 19:15:15.997
83	13	155		2025-04-16 00:00:00	\N	t	2025-04-16 19:15:25.314	2025-04-16 19:15:25.314
84	13	156		2025-04-16 00:00:00	\N	t	2025-04-16 19:15:52.726	2025-04-16 19:15:52.726
85	13	157		2025-04-16 00:00:00	\N	t	2025-04-16 19:16:00.802	2025-04-16 19:16:00.802
86	15	182	Lider	2025-06-19 00:00:00	\N	t	2025-06-19 02:47:00.975	2025-06-19 02:47:00.975
87	15	167	Colaborador, pareja de sobrina de Cabrera Ortiz	2025-06-19 00:00:00	\N	t	2025-06-19 02:48:03.307	2025-06-19 02:48:03.307
89	15	187	Soldado	2025-06-19 00:00:00	\N	t	2025-06-19 13:07:29.393	2025-06-19 13:07:29.393
90	15	184	Soldado (cuñado de Mazzolotti)	2025-06-19 00:00:00	\N	t	2025-06-19 13:08:07.191	2025-06-19 13:08:07.191
91	15	185	Soldado	2025-06-19 00:00:00	\N	t	2025-06-19 13:08:16.267	2025-06-19 13:08:16.267
92	15	192	Soldado (al parecer estan en disputa con Cabrera Ortiz)	2025-06-19 00:00:00	\N	t	2025-06-19 13:09:19.738	2025-06-19 13:09:19.738
93	15	186	Colaborador	2025-06-19 00:00:00	\N	t	2025-06-19 13:10:22.932	2025-06-19 13:10:22.932
94	15	188	Soldado	2025-06-19 00:00:00	\N	t	2025-06-19 13:11:10.204	2025-06-19 13:11:10.204
95	15	193	Colaborador, conducia para Cristobal Marmbio	2025-06-19 00:00:00	\N	t	2025-06-19 13:15:12.601	2025-06-19 13:15:12.601
96	14	167	\N	2025-06-19 00:00:00	\N	t	2025-06-19 19:54:46.328	2025-06-19 19:54:46.328
97	12	197	Colaborador	2025-06-27 00:00:00	\N	t	2025-06-27 17:22:22.95	2025-06-27 17:22:22.95
98	16	48	Lider	2024-10-01 00:00:00	\N	t	2025-07-04 13:28:29.555	2025-07-04 13:28:29.555
99	15	202	Testaferro,recolector de dinero	2025-07-11 00:00:00	\N	t	2025-07-11 14:34:06.717	2025-07-11 14:34:06.717
100	15	204	Orden de detención vigente (tenencia y porte armas fuego)	2025-07-17 00:00:00	\N	t	2025-07-17 19:42:59.971	2025-07-17 19:42:59.971
101	15	189	Sobrino, casa de operaciones	2025-07-17 00:00:00	\N	t	2025-07-17 19:44:27.098	2025-07-17 19:44:27.098
\.


--
-- Data for Name: Nacionalidad; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Nacionalidad" (id, nombre) FROM stdin;
1	Afganistán
2	Albania
3	Alemania
4	Algeria
5	Andorra
6	Angola
7	Anguila
8	Antártida
9	Antigua y Barbuda
10	Antillas Neerlandesas
11	Arabia Saudita
12	Argentina
13	Armenia
14	Aruba
15	Australia
16	Austria
17	Azerbayán
18	Bélgica
19	Bahamas
20	Bahrein
21	Bangladesh
22	Barbados
23	Belice
24	Benín
25	Bhután
26	Bielorrusia
27	Birmania
28	Bolivia
29	Bosnia y Herzegovina
30	Botsuana
31	Brasil
32	Brunéi
33	Bulgaria
34	Burkina Faso
35	Burundi
36	Cabo Verde
37	Camboya
38	Camerún
39	Canadá
40	Chad
41	Chile
42	China
43	Chipre
44	Ciudad del Vaticano
45	Colombia
46	Comoras
47	Congo
48	Congo
49	Corea del Norte
50	Corea del Sur
51	Costa de Marfil
52	Costa Rica
53	Croacia
54	Cuba
55	Dinamarca
56	Dominica
57	Ecuador
58	Egipto
59	El Salvador
60	Emiratos Árabes Unidos
61	Eritrea
62	Eslovaquia
63	Eslovenia
64	España
65	Estados Unidos de América
66	Estonia
67	Etiopía
68	Filipinas
69	Finlandia
70	Fiyi
71	Francia
72	Gabón
73	Gambia
74	Georgia
75	Ghana
76	Gibraltar
77	Granada
78	Grecia
79	Groenlandia
80	Guadalupe
81	Guam
82	Guatemala
83	Guayana Francesa
84	Guernsey
85	Guinea
86	Guinea Ecuatorial
87	Guinea-Bissau
88	Guyana
89	Haití
90	Honduras
91	Hong kong
92	Hungría
93	India
94	Indonesia
95	Irán
96	Irak
97	Irlanda
98	Isla Bouvet
99	Isla de Man
100	Isla de Navidad
101	Isla Norfolk
102	Islandia
103	Islas Bermudas
104	Islas Caimán
105	Islas Cocos (Keeling)
106	Islas Cook
107	Islas de Åland
108	Islas Feroe
109	Islas Georgias del Sur y Sandwich del Sur
110	Islas Heard y McDonald
111	Islas Maldivas
112	Islas Malvinas
113	Islas Marianas del Norte
114	Islas Marshall
115	Islas Pitcairn
116	Islas Salomón
117	Islas Turcas y Caicos
118	Islas Ultramarinas Menores de Estados Unidos
119	Islas Vírgenes Británicas
120	Islas Vírgenes de los Estados Unidos
121	Israel
122	Italia
123	Jamaica
124	Japón
125	Jersey
126	Jordania
127	Kazajistán
128	Kenia
129	Kirgizstán
130	Kiribati
131	Kuwait
132	Líbano
133	Laos
134	Lesoto
135	Letonia
136	Liberia
137	Libia
138	Liechtenstein
139	Lituania
140	Luxemburgo
141	México
142	Mónaco
143	Macao
144	Macedônia
145	Madagascar
146	Malasia
147	Malawi
148	Mali
149	Malta
150	Marruecos
151	Martinica
152	Mauricio
153	Mauritania
154	Mayotte
155	Micronesia
156	Moldavia
157	Mongolia
158	Montenegro
159	Montserrat
160	Mozambique
161	Namibia
162	Nauru
163	Nepal
164	Nicaragua
165	Niger
166	Nigeria
167	Niue
168	Noruega
169	Nueva Caledonia
170	Nueva Zelanda
171	Omán
172	Países Bajos
173	Pakistán
174	Palau
175	Palestina
176	Panamá
177	Papúa Nueva Guinea
178	Paraguay
179	Perú
180	Polinesia Francesa
181	Polonia
182	Portugal
183	Puerto Rico
184	Qatar
185	Reino Unido
186	República Centroafricana
187	República Checa
188	República Dominicana
189	Reunión
190	Ruanda
191	Rumanía
192	Rusia
193	Sahara Occidental
194	Samoa
195	Samoa Americana
196	San Bartolomé
197	San Cristóbal y Nieves
198	San Marino
199	San Martín (Francia)
200	San Pedro y Miquelón
201	San Vicente y las Granadinas
202	Santa Elena
203	Santa Lucía
204	Santo Tomé y Príncipe
205	Senegal
206	Serbia
207	Seychelles
208	Sierra Leona
209	Singapur
210	Siria
211	Somalia
212	Sri lanka
213	Sudáfrica
214	Sudán
215	Suecia
216	Suiza
217	Surinám
218	Svalbard y Jan Mayen
219	Swazilandia
220	Tadjikistán
221	Tailandia
222	Taiwán
223	Tanzania
224	Territorio Británico del Océano Índico
225	Territorios Australes y Antárticas Franceses
226	Timor Oriental
227	Togo
228	Tokelau
229	Tonga
230	Trinidad y Tobago
231	Tunez
232	Turkmenistán
233	Turquía
234	Tuvalu
235	Ucrania
236	Uganda
237	Uruguay
238	Uzbekistán
239	Vanuatu
240	Venezuela
241	Vietnam
242	Wallis y Futuna
243	Yemen
244	Yibuti
245	Zambia
246	Zimbabue
\.


--
-- Data for Name: OrganizacionDelictual; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrganizacionDelictual" (id, nombre, descripcion, "fechaIdentificacion", activa, "tipoOrganizacionId", "createdAt", "updatedAt") FROM stdin;
4	Banda Del Colate	Banda en Coquimbo, relacionada a homicidio de Los Tambores	2024-12-19 00:00:00	t	1	2024-12-19 20:19:07.021	2024-12-19 20:19:07.021
5	PANTAN	Organización proveniente de la V Región. Se concertan para quitada de drogas y dinero a familias de la región de Coquimbo	2024-12-19 00:00:00	t	2	2024-12-19 20:20:26.327	2024-12-19 20:20:26.327
6	DIAMANTE VERDE	Organciación dedicada a venta de semillas y marihuana, Ovalle, alcones.	2024-12-19 00:00:00	t	1	2024-12-19 20:31:32.437	2024-12-19 20:31:32.437
7	Los Pita	Banda Narcotrafico, Viuña, Población Manuel Rodriguez	2025-01-01 00:00:00	t	1	2025-01-01 14:42:10.393	2025-01-01 14:42:10.393
8	Guerrero,Perez y toros	Banda dedicada a la compraventa de drogas, distribuición regional	2025-01-21 00:00:00	t	1	2025-01-21 15:21:11.045	2025-01-21 15:21:11.045
9	Los Conejos	Banda con operación en las Companias, La Serena	2025-01-21 00:00:00	t	1	2025-01-21 16:14:14.594	2025-01-21 16:14:14.594
10	F150	Banda liderada por Ferando Mella Blamey. Dptos Rojos	2024-03-01 00:00:00	t	1	2025-03-22 18:18:32.659	2025-03-22 18:18:32.659
11	LOS CHARRACOS	Banda dedicada al robo de vehiculos 	2025-03-22 00:00:00	t	1	2025-03-22 18:49:59.076	2025-03-22 18:49:59.076
12	SALAMANCA OVALLE	Registro para causa Los Salamancas	2025-04-01 00:00:00	t	3	2025-04-01 18:57:40.905	2025-04-01 18:58:09.365
13	TDA KRATOS	Registro de sujetos operacion KRATOS	2025-04-16 00:00:00	f	4	2025-04-16 19:13:29.782	2025-04-16 19:13:29.782
14	Mazzolotti y asoc. Robo de Vehiculos	Ejemplo paa capacitación	2025-06-04 00:00:00	t	2	2025-06-04 16:31:35.976	2025-06-04 16:31:35.976
15	Banda del Yoyi	Foco Novela Turca	2025-06-19 00:00:00	t	1	2025-06-19 02:13:01.931	2025-06-19 02:13:01.931
16	Grupo del Brian Lopetegui	Grupo de sujetos que realizan delitos específicos. 	2025-02-05 00:00:00	t	2	2025-07-04 13:13:41.945	2025-07-04 13:26:16.488
\.


--
-- Data for Name: TimelineHito; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TimelineHito" (id, titulo, fecha, descripcion, icono, "imagenUrl", "causaId", "createdAt", "updatedAt") FROM stdin;
3	Comunicación entre ÁGUILA MALDONADO)  y víctima	2025-01-19 00:00:00	Registro de comunicación entre perfil configurado en WhatsApp registrado como  “Alexis Aguila” (Gerald Alexis ÁGUILA MALDONADO) y contacto registrado como “.nerka Nuebooo New” (víctima), número telefónico +56959215746., los mensajes fueron eliminados, pero hablan de la venta de una pistola Glock		/uploads/8e1730a4-42d3-46f3-a742-adc12543f385.png	123	2025-05-06 17:14:43.285	2025-05-06 17:14:43.285
4	ÁGUILA MALDONADO y José Abreu	2025-01-19 00:00:00	La comunicación comienza  a las 07:11 pm, venta de vehiculos robados, droga- Jose conuslta por "metales" (armas)		/uploads/2909bfb5-f8a8-4993-8ad3-b3a7db904cf2.png	123	2025-05-06 17:19:13.778	2025-05-06 17:19:13.778
5	Homicidio BASTIAN NICOLAS GALLEGUILLOS VALDIVIA	2025-01-22 00:00:00	Homicidio de BASTIAN NICOLAS GALLEGUILLOS VALDIVIA en el sector de Huamalata.		/uploads/2a5e1d52-8837-4295-a96c-f0a8d98279fd.jpg	123	2025-05-06 17:23:06.177	2025-05-06 17:23:06.177
6	Llamado a ECOH	2025-01-23 00:00:00	Ubicación SS: Ubicación SS, Lat: -30.546595196026807, Lon: -71.15536506960899.\nVehiculo en el cual llega la victima al hospital, KIA RH VW62\n<p>El traslado es realizado por un funcionario policial de Carabineros y el denunciante, don Francisco Javier Reinoso Pérez, RUN 18.705.119-3, quien señala a Carabineros que  se dedica a transporte de pasajeros mediante aplicación y que el día 23 de enero del 2025 fue contactado directamente por Bastián Nicolás Galleguillos Valdivia, para realizar un viaje desde la ciudad de  Viña del Mar hasta Ovalle.</p>	Flag		123	2025-05-06 19:05:52.56	2025-05-06 19:05:52.56
10	19:37:56 Se observa la víctima, cruzar calle regimiento Buin en dirección a la botillería.	2024-06-23 00:00:00	19:37:56 Desde cámara 8 de Botilleria, se observa la víctima, cruzar calle regimiento Buin en dirección a la botillería.			40	2025-06-05 16:41:28.321	2025-06-05 16:41:28.321
11	19:38:12  Sujetos caminan por regimiento Buin	2024-06-23 00:00:00	Se observan dos personas, una de ellas cruza la calle Regimiento Buin para reunirse con otra persona que transitaba dirección sur a norte 			40	2025-06-05 16:42:50.012	2025-06-05 16:42:50.012
12	19:38:30, ingreso de víctima a Botilleria	2024-06-23 00:00:00	cámara de seguridad (cámara 9) que registra la llegada de la víctima Gabriel Alejando Miranda Muñoz a la botillería, en ella se aprecia como la persona pasa algunas monedas a otra persona y luego se las devuelven			40	2025-06-05 16:43:52.775	2025-06-05 16:43:52.775
13	19:39:08, Cruce víctima e imputado.	2025-06-05 00:00:00	 , se observa la sombra de una persona que cruza la calle y es interceptado por la persona que se encuentra en la esquina (19:39:08)	AlertTriangle		40	2025-06-05 16:46:26.807	2025-06-05 16:46:26.807
14	20:37 SALIDA DE JUAN  ARANCIBIA BERENGUELA	2025-05-19 00:00:00	Cámara de seguridad registra momento en que la víctima se sube a vehiuclo MG, testigo señala que lo pasa a buscar junto a su pola Danai 	Video	api/uploads/aa727de8-85ee-4435-bf17-b38195933207.png	150	2025-06-09 14:06:03.157	2025-06-09 14:06:03.157
15	01:25, carvana, pasa a buscar a David Mazzolotti	2025-05-20 00:00:00	01:25, (cámara de seguridad presenta desfase )carvana, pasa a buscar a David Mazzolotti	Video		150	2025-06-09 14:10:59.198	2025-06-09 14:10:59.198
16	02:07:34, caravana pasa frente SALFA	2025-05-20 00:00:00	02:07:34, caravana pasa frente SALFA, los tres vehiculos.			150	2025-06-09 14:11:56.78	2025-06-09 14:11:56.78
17	02:09 Vehiculos se estacionan en el SS	2025-05-20 00:00:00	02:09 Vehiculos se estacionan en el SS, 1 minuto despues el MG (conducido por José Castillo)inicia marcha hacia el SUR, recoge a una persona a pie, (Jose Lillo)	Video		150	2025-06-09 14:15:00.565	2025-06-09 14:15:00.565
18	Colisión	2025-05-04 00:00:00	19:15 horas - Colisión frontal entre el vehículo de la víctima (Subaru WRX gris, patente TPYR-34) y otro vehículo en la intersección de Calle La Conquista con Pasaje Gregorio Argomedo.	Clock		149	2025-07-01 16:25:15.19	2025-07-01 16:25:15.19
19	Discusión	2025-05-04 00:00:00	19:15-19:20 horas - Ambos conductores descienden y comienzan una discusión. El agresor retrocede su vehículo y todos los ocupantes de ambos automóviles descienden.	MessageCircle		149	2025-07-01 16:25:54.023	2025-07-01 16:25:54.023
20	Agersión	2025-05-04 00:00:00	19:20 horas - El agresor extrae una pistola y dispara aproximadamente cinco veces contra Richard Bugueño Vera y su vehículo. Posteriormente huye corriendo hacia el sur por Calle La Conquista.	AlertTriangle		149	2025-07-01 16:26:24.429	2025-07-01 16:26:24.429
21	Traslado Hospital de La Serena	2025-05-04 00:00:00	19:20-19:53 horas - Personas del lugar ayudan a trasladar a la víctima al Hospital de La Serena.	Info		149	2025-07-01 16:27:08.114	2025-07-01 16:27:08.114
23	Lllegada de personal policial a lugar	2025-05-04 00:00:00	20:02 horas - Personal policial llega al sitio del suceso y encuentra el vehículo con la llanta quebrada, cinco vainillas calibre 9mm y manchas de sangre.	AlertTriangle		149	2025-07-01 16:28:12.208	2025-07-01 16:28:12.208
24	Llegada Fiscalia ECOH	2025-05-04 00:00:00	23:57 horas - Se presenta el Fiscal de Turno, Eduardo Yáñez Muñoz.\n	User		149	2025-07-01 16:28:38.412	2025-07-01 16:28:38.412
22	Llamada Cenco	2025-05-05 00:00:00	19:53 horas - CENCO informa a Carabineros sobre el procedimiento.\n	Phone		149	2025-07-01 16:27:36.094	2025-07-01 19:27:20.726
26	nicio del Incident	2025-05-22 00:00:00	11:30 horas, mientras la víctima se encontraba en el corral de animales de su casa, tres sujetos de aproximadamente  30 años ingresaron a través del sitio de su padre.	AlertTriangle		155	2025-07-03 16:00:09.385	2025-07-03 16:00:09.385
27	Identificación	2025-05-22 00:00:00	11:30 Uno de los agresores fue identificado como Cristiano Ignacio Acevedo, quien vive en el sector.	User		155	2025-07-03 16:00:48.357	2025-07-03 16:00:48.357
28	Traslado y Agresión	2025-05-22 00:00:00	12:30 Trasladaron a la víctima al sector El Romero (aproximadamente \nuna hora de viaje), donde lo golpearon durante el trayecto y posteriormente lo \nbajaron del vehículo cerca de un huerto de chirimoyas			155	2025-07-03 16:01:25.748	2025-07-03 16:01:25.748
29	Torturas	2025-05-22 00:00:00	12:30 En el lugar, continuaron agrediéndolo con golpes y patadas, intentando \nque se quitara la ropa, pero finalmente lo dejaron en ropa interior			155	2025-07-03 16:01:59.307	2025-07-03 16:01:59.307
30	Escape	2025-05-22 00:00:00	13:00 La víctima logró huir corriendo hacia unos campos mientras escuchaba disparos (aproximadamente dos balazos). Estuvo cautivo hasta cerca de las 13:00 horas, Se encontró con su hermano quien lo llevó a caballo hasta su casa, donde su madrastra lo acompañó a presentar la denuncia.	Flag		155	2025-07-03 16:02:51.966	2025-07-03 16:02:51.966
32	HECHO 2 ASOCIACIÓN CRIMINAL 	2024-08-03 00:00:00	JORGE GONZÁLEZ, FRANCISCO ZURITA Y MAYERLINE OLGUÍN\nen vehículo Wagon Chery modelo Tiggo PPU BVGH-53 negro \nAmenazan de muerte y golpean a Luis Alfaro Alfaro y Luis Alfaro Zambra\nMayerline atropella a la víctima \n\nDirección: Lincoyán #075, El Llano, Coquimbo 	Flag		54	2025-07-14 19:29:53.559	2025-07-14 19:39:32.701
31	HECHO 1 ASOCIACIÓN CRIMINAL	2024-07-22 00:00:00	JORGE GONZÁLEZ, MAXIMILIANO CASTEX Y FRANCISCO FLORES \nMantenían Moto marca HYOSUNG GT250R color negro de origen ilícito, inscripción  DDF.093-7\n\nDirección \nLincoyán #084, El Llano, Coquimbo	Flag	api/uploads/6ec1733c-09e7-4bce-a3ec-4b60010b966d.JPG	54	2025-07-14 19:24:55.915	2025-07-14 19:39:40.589
33	HECHO 3 ASOCIACIÓN CRIMINAL 	2024-08-03 00:00:00	JORGE GONZÁLEZ ENVÍA A MAXIMILIANO CASTEX, FRANCISCO ZURITA Y A FRANCISCO FLORES a atentar contra la vida de JAMIE ALFARO en el vehículo de JORGE GONZÁLEZ Wagon marcha Chery modelo Tiggo negro BVGH-53 \nHECHOS INSTRUIDOS POR JORGE GONZÁLEZ:\n3.1 MAXIMILIANO BUSCA A JAMIE\n3.2 AMBOS VAN AL FUERTE DE COQUIMBO\n3.3 APARECEN AHÍ FRANCISCO ZURITA Y FRANCISCO FLORES\n3.4 VAN TODOS AL MOTEL CORAZÓN EN DONDE FRANCISCO ZURITA LE EXIGE RELACIONES SEXUALES A JAMIE Y ESTA SE NIEGA\n3.5 VAN A SECTOR GUAYACAN, LA GOLPEAN Y LE CORTAN EL CUELLO PARA ABANDONARLA EN SECTOR TAMBORES	Star		54	2025-07-14 19:58:49.566	2025-07-14 19:58:49.566
34	HECHO 4 ASOCIACIÓN CRIMINAL	2024-08-05 00:00:00	JORGE GONZÁLEZ, FRANCISCO ZURITA, FRANCISCO FLORES Y MAXIMILIANO CASTEX ROBAN EN CABAÑAS DEL COMPLEJO HOTELERO CABAÑAS PINAMAR EN AVENIDA PACIFICO #5020, LA SERENA. SE MANTENIAN EN VEHÍCULO STATION WAGON CHERY TIGGO NEGRO BVGH53	Flag		54	2025-07-14 20:02:14.665	2025-07-14 20:02:14.665
35	HECHO 5 ASOCIACIÓN CRIMINAL 	2024-08-07 00:00:00	JORGE GONZÁLEZ Y MAYERLYNE OLGUIN roban mancuernas en cabaña 16 de Hostal Los Álamos, en calle cerrito #10 sector La Herradura, Coquimbo. Consumiendo drogas como ketamina y marihuana al interior de la cabaña en la que se encontraban cabaña 04	Flag		54	2025-07-14 20:05:17.72	2025-07-14 20:05:17.72
37	HECHO 7 ASOCIACIÓN CRIMINAL 	2024-10-24 00:00:00	Jorge Gonzalez privado de libertad amenaza de muerte a Camila Azola Delito amenazas simples desde Centro penitenciario	Flag		54	2025-07-21 21:28:05.23	2025-07-21 21:28:05.23
36	HECHO 6 ASOCIACIÓN CRIMINAL 	2024-09-14 00:00:00	Al interior de inmueble en calle portales #343, Coquimbo Residencial CAPRI JORGE GONZÁLEZ se abalanza sobre su madre GLORIA OYANEDEL agrediendo con golpes de puño en la cabeza, tórax, brazos y manos 	Flag		54	2025-07-14 20:09:08.19	2025-07-21 21:28:14.338
\.


--
-- Data for Name: TipoActividad; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TipoActividad" (id, nombre, descripcion, "areaId", activo, "createdAt", "updatedAt", siglainf, reqinforme) FROM stdin;
6	Otras tareas de análisis	Otras tareas de análisis	1	t	2024-12-18 10:25:00	2024-12-18 10:25:00	\N	f
7	Otras tareas ATVT	Otras tareas ATVT	3	t	2024-12-18 10:25:00	2024-12-18 10:25:00	\N	f
8	Otras actividades jurídicas	Otras actividades jurídicas	2	t	2024-12-18 10:25:00	2024-12-18 10:25:00	\N	f
20	Reportes de monitoreo por foco		1	t	2024-12-18 10:25:00	2024-12-18 10:25:00	\N	f
21	Reporte a Fiscal Regional		1	t	2024-12-18 10:25:00	2024-12-18 10:25:00	\N	f
22	Otros Reportes		1	t	2024-12-18 10:25:00	2024-12-18 10:25:00	\N	f
10	Contacto Con Víctima O Testigo		3	t	2024-12-18 10:25:00	2024-12-18 10:25:00	\N	f
11	Concurrencias A Ss		3	t	2024-12-18 10:25:00	2024-12-18 10:25:00	\N	f
12	Entrega De Medidas De Protección		3	t	2024-12-18 10:25:00	2024-12-18 10:25:00	\N	f
13	Infrome Atvt		3	t	2024-12-18 10:25:00	2024-12-18 10:25:00	\N	f
14	Otros Informes Y Reportes		3	t	2024-12-18 10:25:00	2024-12-18 10:25:00	\N	f
15	Reuniones Con Uravit		3	t	2024-12-18 10:25:00	2024-12-18 10:25:00	\N	f
16	Coordinaciones Intersectoriales		3	t	2024-12-18 10:25:00	2024-12-18 10:25:00	\N	f
17	Derivaciones Intersectoriales		3	t	2024-12-18 10:25:00	2024-12-18 10:25:00	\N	f
18	Intervenciones Y Charlas Comunitarias		3	t	2024-12-18 10:25:00	2024-12-18 10:25:00	\N	f
19	Análisis De Carpeta Investigativa		3	t	2024-12-18 10:25:00	2024-12-18 10:25:00	\N	f
1	Georreferenciación trafico telefónico	Georreferenciación trafico telefónico, registros de comunicaciones en antenas de compañías telefónicas	1	t	2024-12-18 10:25:00	2024-12-18 10:25:00	GA\n	t
3	Reporte de Monitoreo	Reporte Monitoreo	1	t	2024-12-18 10:25:00	2024-12-18 10:25:00	RM	t
4	Proyecto acusación	Proyecto acusación	2	t	2024-12-18 10:25:00	2024-12-18 10:25:00	\N	f
9	Informe patrimonial	Informe patrimonial	1	t	2024-12-18 10:25:00	2024-12-18 10:25:00	IPA	t
2	Extracción de  evidencia digital	Extracción y análisis de evidencia digital	1	t	2024-12-18 10:25:00	2024-12-18 10:25:00	IEED	t
23	Análisis de evidencia digital	Extracción y análisis de evidencia digital	1	t	2024-12-18 10:25:00	2024-12-18 10:25:00	IAED	t
24	Informe Temprano de Análisis	Informe Temprano de Análisis	1	t	2024-12-18 10:25:00	2024-12-18 10:25:00	ITA	t
5	Reporte de análisis	Reporte de análisis	1	t	2024-12-18 10:25:00	2024-12-18 10:25:00	RA	t
25	Extracción y análisis de Evidencia Digital	Proceso completo de Extracción y análisis de Evidencia Digital	1	t	2024-12-18 10:25:00	2024-12-18 10:25:00	IEAED	t
26	Informe Cuadro gráfico demostrativo.	Cuadro gráfico demostrativo.	1	t	2024-12-18 10:25:00	2024-12-18 10:25:00	ICGD	t
27	Ampliación de informe	Ampliación de informe	1	t	2024-12-18 10:25:00	2024-12-18 10:25:00	AI	t
\.


--
-- Data for Name: TipoMedida; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TipoMedida" (id, nombre, activo, "createdAt", "updatedAt") FROM stdin;
6	Alzamiento de secreto bancario	t	2024-01-10 00:00:00	2024-01-10 00:00:00
7	Agente revelador y agente encubierto	t	2024-01-10 00:00:00	2024-01-10 00:00:00
1	Órdenes de entrada y registro	t	2024-01-10 00:00:00	2025-01-10 13:08:26.30183
2	Órdenes de detención	t	2024-01-10 00:00:00	2025-01-10 13:08:26.30183
3	Interceptación telefónica	t	2024-01-10 00:00:00	2025-01-10 13:08:26.30183
4	Autorización extracción forense teléfono	t	2024-01-10 00:00:00	2025-01-10 13:08:26.30183
5	Autorización requerir tráfico llamados	t	2024-01-10 00:00:00	2025-01-10 13:08:26.30183
8	Autorización de correspondencia 	t	2024-01-10 00:00:00	2025-01-10 13:08:26.30183
9	Autorización para obtener ADN imputado	t	2024-01-10 00:00:00	2025-01-10 13:08:26.30183
\.


--
-- Data for Name: TipoOrganizacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TipoOrganizacion" (id, nombre, descripcion, "createdAt", "updatedAt") FROM stdin;
1	Banda	Agrupación Criminal 	2024-12-19 00:00:00	2024-12-19 00:00:00
2	Concertación	sujetos concertados para realizar uno o mas delitos en un rango de fecha determinado	2024-12-19 00:00:00	2024-12-19 00:00:00
3	No definido	Relaciones de sujetos con interrelaciones no reconocidas	2024-12-19 00:00:00	2024-12-19 00:00:00
4	Crimen Organizado	tructura permanente y jerarquizada de individuos que opera coordinadamente para obtener beneficios ilícitos a través de actividades delictivas, usando violencia, corrupción e intimidación para mantener su influencia.	2025-04-01 15:57:01.68	2024-12-19 00:00:00
\.


--
-- Data for Name: Tribunal; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Tribunal" (id, nombre) FROM stdin;
1	TG La Serena
2	TG Coquimbo
3	TG Ovalle
4	TG Los Vilos
5	TG Illapel
6	TG Combarbalá
7	TG Andacollo
8	TG Vicuña
9	TOP La Serena
10	TOP Ovalle
11	No definido
12	Otro
\.


--
-- Data for Name: UnidadPolicial; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UnidadPolicial" (id, nombre) FROM stdin;
1	BIRO
2	BICRIM OVALLE
\.


--
-- Data for Name: Victima; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Victima" (id, "nombreVictima", "docId", "nacionalidadId") FROM stdin;
2	JUAN FRANCISCO ARANCIBIA BERENGUELA	19660767-6	41
1	 DILAN BASTIÁN ROJEL CORTÉS	22143020-4	41
4	PATRICIO ALEJANDRO YAÑEZ OPAZO	13760497-3	41
5	JORGE MAXIMILIANO DOMINGUEZ VARGAS	23038783-4	41
6	JOAQUÍN IGNACIO GUERRERO ZEPEDA	20457537-1	41
7	JUAN ANDRÉS OLIVARES MIRANDA	17112264-3	41
8	CAROL CATALINA TAPIA SILVA	20563723-0	41
9	SEBASTIÁN ALEJANDRO CORTÉS CASTILLO	19302602-8	41
10	ANGEL EDUARDO VALDES ARAYA	9130579-8	41
11	LESLIE MATILDE VALDÉS ÁLVAREZ	21983475-6	41
12	NICOLAS ANTONIO NUÑEZ FLORES	18381241-6	41
13	CHRISHNA YAMILETT JAMETT PÉREZ	20344463-K	41
14	CATHERINE SHAARON HERRERA BAHAMONDES	18230926-5	41
15	JUAN HERIBERTO HERRERA VALDIVIA	8645255-3	41
16	FERNANDO ANTONIO BARRAZA GARCIA	16848324-4	41
17	JUANA GUILLERMINA GARCÍA LÓPEZ	10691134-7	41
18	YENILET MARLENE CHAPARRO VÁSQUEZ	17236258-3	41
19	RICARDO EMILIO ROJAS MENESES	18984908-7	41
20	SIBIA JANETT MENESES ROJAS	11327332-1	41
21	MAYKOL ARTURO CARVAJAL CARVAJAL	19667558-2	41
22	MILDRED ISABEL CARVAJAL PASTÉN	15044027-0	41
23	FABIÁN EDUARDO OYANADEL LEIVA	20167687-8	41
24	ALEJANDRO ENRIQUE GARCÍA ZEPEDA	20599914-0	41
25	GALINDO ISMAEL BARRAZA BARRAZA	13208986-8	41
26	DENIS ANTONELLA GARCÍA GALLARDO	21495796-5	41
27	LUIS ALBERTO MENA SEPÚLVEDA	17942229-8	41
28	JOSÉ ANTONIO AGUIRRE AGUIRRE	17364375-6	41
29	ARTURO LUIS QUIROGA CALCAGNO	9645717-0	41
30	IVÁN JORGE GONZÁLEZ ARACENA	7268798-1	41
31	\t BENJAMÍN EMERSON ALFARO HERRERA	22179046-4	41
32	ANGEL MIRO VALDÉS ÁLVAREZ	20317405-5	41
33	JOHAN RAFAEL SÁNCHEZ GÓMEZ	25718485-4	240
34	CESAR EDUARDO GODOY ESPINOZA	15673839-5	41
35	ANA MARIA PIZARRO PIZARRO 	11346733-9	41
36	JEAN FRANCO DE JESUS PALAVECINOS VILLALOBOS	20407078-4	41
37	EDUARDO MAURICIO ALVARADO BAÑADOS	19506395-8	41
38	CRISTIAN ROLANDO HIDALGO LUCEMA 	0000000-0	240
39	NATHAN ENRIQUE UGUETO HERNANDEZ	00000000-0	240
40	HERALDO ESTEBAN COLLAO COLLAO 	19257740-3	41
41	MARCO ANDRES PASTEN GONZALEZ 	18632932-5	41
42	HECTOR JOSE DURAN YEPE	14894271-4	240
43	CESAR EDUARDO GODOY ESPINOZA	15673839-5	41
44	MAIRA GABRIELA MARTINEZ GRATEROL	11111111-1	240
45	JORGE ANDRES CARDONA AGUIRRE	11111111-1	45
46	RODRIGO ALEXIS VILLALON OLIVARES	15049809-0	41
47	NICOLAS ANDRES PINOCHET GARCIA 	16579041-3	41
48	JAMIE ANTONELLA ALFARO HERRERA	20025828-2	41
49	MOISES FERNANDO LOBOS GODOY 	15023668-1	41
50	MACARENA ISABEL ALARCON ALARCON 	15998479-6	41
51	JUAN GABRIEL ANACONA LOPEZ	16444194-6	41
52	DANIEL JOTHAM CORONADO RAMIREZ	15035307-6	41
53	Eduardo Antonio Godoy Orrego	18001505-1	41
54	YAJAIRA MERCEDES GUTIERREZ ARGUELLOS	00000000-0	240
3	CRISTIÁN ALEJANDRO FLORES TAPIA	19257614-8	41
56	MARCOS CAICEDO VALENCILLA	14881411-2	45
57	JUAN PABLO POBLETE PLAZA	18632529-K	41
58	JUANA AMELIA ARRIAGADA PLAZA	5522945-7	41
60	JORGE LEONARDO ROMERO BUITRIAGO	00000000-0	45
61	JERSON FELIPE HERNÁNDEZ BETANCOURT	00000000-0	45
62	ALEXANDER RIGOBERTO PEREIRA MALDONADO	21450371-9	41
63	RENZO ANDRÉS BAZAN ALARCÓN	20737934-4	41
64	NICOLAS ANTONIO NUÑEZ FLORES	18381241-6	41
65	MARCIAL DEL CARMEN MENESES CASTRO	8562914-K	41
66	RODRIGO ANDRES ELTIT ELTIT	10629424-0	41
67	CARLOS ALBERTO ARAYA ASTUDILLO	20950935-0	41
59	IGNACIO JAVIER CAROCA AGUILERA	16473747-0	41
68	ALEXANDER MANUEL CANTILLANA FERNÁNDEZ	21831682-4	41
69	CARTLOS JESÚS RODA GLORIOSO	26751779-7	240
70	MAXIMILIANO IGNACIO ORTÍZ RIVERA	19347465-9	41
71	BAOXIONG YE	22014866-1	42
72	WEIBIN YE	21335055-2	42
73	EIMY VICTORIA WALKER ARAYA	21520619-K	41
74	IGNACIO ALEJANDRO ROBLEDO ROBLEDO	19207388-K	41
75	JOAQUÍN RODRIGO PUELLES CARRAZANA	20006271-K	41
76	PABLO IGNACIO ROJAS ROJAS	18217360-6	41
77	DANIEL ISAÍAS FIGUEROA CARRASCO	18505099-8	41
78	VÍCTOR MANUEL TAPIA PEREIRA	15910251-3	41
79	BASTIÁN NICOLAS GALLEGUILLOS VALDIVIA	19612898-0	41
80	LUÍS ALBERTO HERRERA HERRERA	14159251-3	41
81	FELIPE ALBERTO DÍAZ TAPIA	18495363-3	41
83	CARLOS MAURICIO GREZ VILLALOBOS	17773319-9	41
84	Wilfredo Elías Chaparro Henríquez 	19256432-8	41
85	Mauricio Esteban Soto Soto	19521958-3	41
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
3cc2cb1d-7b4c-4dfa-bc6d-3e3198ede1f2	bbe7457e487ba4fd0cfd0274c197465fda69f6fef1d98fd380efa89d87fe6090	2024-12-17 13:13:04.460142-03	20241217161304_migracion	\N	\N	2024-12-17 13:13:04.249804-03	1
1bdeb119-9805-4694-95fc-fb2a2021efdb	f91ba289a65796b813dd9561f8f979708ec3816e0262c3ea05933c5b5774137d	\N	20250821000000_add_estado_causa	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250821000000_add_estado_causa\n\nDatabase error code: 42P07\n\nDatabase error:\nERROR: la relación «estados_causa» ya existe\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P07), message: "la relación «estados_causa» ya existe", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("heap.c"), line: Some(1151), routine: Some("heap_create_with_catalog") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250821000000_add_estado_causa"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="20250821000000_add_estado_causa"\n             at schema-engine\\core\\src\\commands\\apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:226	\N	2025-09-01 21:02:31.212031-04	0
\.


--
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categorias (id, nombre, descripcion, color, icono, activo, orden, created_at, updated_at) FROM stdin;
1	analisis	Herramientas de análisis y procesamiento	#ef4444	BarChart3	t	1	2025-06-09 22:03:29.446088-04	2025-06-09 22:03:29.446088-04
2	busqueda	Sistemas de búsqueda y consulta	#3b82f6	Search	t	2	2025-06-09 22:03:29.446088-04	2025-06-09 22:03:29.446088-04
3	datos	Bases de datos y repositorios	#22c55e	Database	t	3	2025-06-09 22:03:29.446088-04	2025-06-09 22:03:29.446088-04
4	investigacion	Herramientas de investigación	#8b5cf6	Search	t	4	2025-06-09 22:03:29.446088-04	2025-06-09 22:03:29.446088-04
5	contacto	Contactos y comunicación	#f59e0b	Mail	t	5	2025-06-09 22:03:29.446088-04	2025-06-09 22:03:29.446088-04
6	registro	Sistemas de registro y documentación	#6366f1	ClipboardList	t	6	2025-06-09 22:03:29.446088-04	2025-06-09 22:03:29.446088-04
7	alertas	Sistemas de alertas y notificaciones	#f97316	AlertTriangle	t	7	2025-06-09 22:03:29.446088-04	2025-06-09 22:03:29.446088-04
8	estadisticas	Herramientas estadísticas y reportes	#06b6d4	BarChart3	t	8	2025-06-09 22:03:29.446088-04	2025-06-09 22:03:29.446088-04
9	documentacion	Documentación y protocolos	#64748b	FileText	t	9	2025-06-09 22:03:29.446088-04	2025-06-09 22:03:29.446088-04
10	Fuentes Abiertas	Herrramientas utiles para busqueda OSINT	#00ff00	Search	t	10	2025-06-09 22:03:29.446088-04	2025-06-09 22:03:29.446088-04
\.


--
-- Data for Name: estados_causa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estados_causa (id, nombre, descripcion, codigo, activo, orden, color, "createdAt", "updatedAt") FROM stdin;
4	En Tramitación	Causa que se encuentra en proceso de investigación activa	TRAMITACION	t	1	#3b82f6	2025-09-01 19:07:23.55	\N
5	Investigación Cerrada	Causa con investigación cerrada pero sin sentencia	INV_CERRADA	t	2	#f59e0b	2025-09-01 19:07:23.55	\N
6	Cerrada con Sentencia	Causa cerrada con sentencia definitiva	CERRADA_SENTENCIA	t	3	#10b981	2025-09-01 19:07:23.55	\N
\.


--
-- Data for Name: origenes_causa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.origenes_causa (id, nombre, descripcion, codigo, activo, orden, color, "createdAt", "updatedAt") FROM stdin;
1	ECOH	Equipo de Crimen Organizado y Homicidios	ECOH	t	1	#ef4444	2025-09-01 19:10:35.621	2025-09-01 19:10:35.621
2	SACFI	Sistema de Análisis Criminal y Focalización de la Investigación	SACFI	t	2	#3b82f6	2025-09-01 19:10:35.621	2025-09-01 19:10:35.621
3	LEGADA	Causa Legada de otra unidad	LEGADA	t	3	#f59e0b	2025-09-01 19:10:35.621	2025-09-01 19:10:35.621
\.


--
-- Data for Name: proveedores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proveedores (id, nombre) FROM stdin;
1	Entel\n
2	Movistar
3	Claro
4	Wom
\.


--
-- Data for Name: resoluciones_tribunal; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resoluciones_tribunal (id, resolucion, activo, created_at, updated_at) FROM stdin;
1	Aprueba totalidad	t	2025-01-10 00:00:00	2025-01-10 00:00:00
2	Aprueba Parcial	t	2025-01-10 00:00:00	2025-01-10 00:00:00
3	Previo Resolver	t	2025-01-10 00:00:00	2025-01-10 00:00:00
4	Rechazada	t	2025-01-10 00:00:00	2025-01-10 00:00:00
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, nombre, descripcion, "createdAt", "updatedAt") FROM stdin;
3	READ	Solo puede ver registros	2024-11-30 13:43:12.409	2024-11-30 13:43:12.409
1	Admin	Acceso total al sistema	2024-11-30 13:43:12.409	2024-11-30 13:43:12.409
2	Usuario	Puede crear y modificar registros	2024-11-30 13:43:12.409	2024-11-30 13:43:12.409
4	Jefatura	Puede crear y modificar registros y delegar tareas	2024-11-30 13:43:12.409	2024-11-30 13:43:12.409
\.


--
-- Data for Name: sitios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sitios (id, nombre, descripcion, url, icono, activo, orden, categoria_id, created_at, updated_at) FROM stdin;
1	SILID	Analisis geoespacial de información delictual	http://frxv-silid/silid/index.php	MapPin	t	1	1	2025-06-09 22:03:39.056944-04	2025-06-09 22:03:39.056944-04
2	SBAA	Búsqueda avanzada de texto en los relatos de hechos delictuales	http://sqlprod-rs.minpublico.cl/home	Search	t	2	2	2025-06-09 22:03:39.056944-04	2025-06-09 22:03:39.056944-04
3	BEPAT	Búsqueda avanzada en relatos y archivos por medio de parámetros	http://172.18.1.132:8000/login/	FileSearch	t	3	2	2025-06-09 22:03:39.056944-04	2025-06-09 22:03:39.056944-04
4	Fiscal Heredia	Búsqueda compañeros de delito	mailto:fiscalheredia@minpublico.cl	Mail	t	4	5	2025-06-09 22:03:39.056944-04	2025-06-09 22:03:39.056944-04
5	Cubos OLAP	Búsqueda de texto en registros SAF	http://sqlprod-rs/reports/browse/SACFI	Database	t	5	3	2025-06-09 22:03:39.056944-04	2025-06-09 22:03:39.056944-04
6	Orbis	Búsqueda de información en fuentes abiertas	https://40.71.2.238/	Globe	t	6	4	2025-06-09 22:03:39.056944-04	2025-06-09 22:03:39.056944-04
7	SIRA	Registro de fenómenos delictuales	http://server-sira/sira/	ClipboardList	t	7	6	2025-06-09 22:03:39.056944-04	2025-06-09 22:03:39.056944-04
8	Cruce de agendas telefónicas	Cruce de agendas telefónicas obtenidas de extracciones a móviles	http://172.18.6.76/telefonos/login.php	Phone	t	8	4	2025-06-09 22:03:39.056944-04	2025-06-09 22:03:39.056944-04
9	BUD	Base de datos unificada con información de distintos organismos	http://10.190.9.11/bud/	Server	t	9	3	2025-06-09 22:03:39.056944-04	2025-06-09 22:03:39.056944-04
10	Sujetos de Interés	Alertas por aparición de sujetos en SAF	mailto:dsalinas@minpublico.cl	AlertTriangle	t	10	7	2025-06-09 22:03:39.056944-04	2025-06-09 22:03:39.056944-04
11	Datos estadísticos ECOH	Registro de información estadística asociada al proyecto ECOH	https://minpublicocl.sharepoint.com/:x:/s/ProyectoECOH/ETTXUYFDCt9Aqblj0KBCZFkBfaSmRdM_MfN-11GeAhsjBQ?e=hRTAq8	BarChart3	t	11	8	2025-06-09 22:03:39.056944-04	2025-06-09 22:03:39.056944-04
12	Protocolos ECOH	Documentación relevante para la investigación y gestión del proyecto ECOH	javascript:ViewCarpetaDocumentos()	FileText	t	12	9	2025-06-09 22:03:39.056944-04	2025-06-09 22:03:39.056944-04
13	CLEARVIEW	Búsqueda avanzada en relatos y archivos por medio de parámetros	https://app.clearview.ai/app/login/	Eye	t	13	4	2025-06-09 22:03:39.056944-04	2025-06-09 22:03:39.056944-04
14	BUCOH	Base unificada de homicidios y crimen organizado	http://172.18.6.93/bucoh/login.php	Shield	t	14	4	2025-06-09 22:03:39.056944-04	2025-06-09 22:03:39.056944-04
15	Volante o Maleta	Busqueda de patentes de vehiculos	https://www.volanteomaleta.com/	CarIcon	t	15	10	2025-06-09 22:03:39.056944-04	2025-06-09 22:03:39.056944-04
16	Rutificador	Rutificador	https://www.nombrerutyfirma.com/	Globe	t	16	10	2025-06-09 22:03:39.056944-04	2025-06-09 22:03:39.056944-04
17	Mapas SII	Mapas Digitales de SII	https://www4.sii.cl/mapasui/internet/#/contenido/index.html	MapPin	t	17	10	2025-06-09 22:03:39.056944-04	2025-06-09 22:03:39.056944-04
18	Solicitudes a Entel	Correo Solicitudes a Entel (Tráfico, IMEI, etc.)	mailto:soperacional@entel.cl	Phone	t	18	10	2025-06-09 22:03:39.056944-04	2025-06-09 22:03:39.056944-04
19	Solicitudes Movistar	Correo solicitudes Movistar (Tráfico, IMEI, etc.)	mailto:r.judicialeschile@telefonica.com	Phone	t	19	10	2025-06-09 22:03:39.056944-04	2025-06-09 22:03:39.056944-04
20	 Solicitudes a Claro	Correo Solicitudes a Claro (Tráfico, IMEI, etc.)	mailto:info.judicial@clarochile.cl	Phone	t	20	10	2025-06-11 11:57:40.800488-04	2025-06-11 11:57:40.800488-04
21	 Solicitudes a WOM	Correo  Solicitudes a Claro (Tráfico, IMEI, etc.)	mailto:requerimientos_mp@wom.cl\n	Phone	t	21	10	2025-06-11 11:57:40.800488-04	2025-06-11 11:57:40.800488-04
22	 Patentes Chile	Consultar Patentes Chile	https://www.patentechile.com/	CarIcon	t	22	10	2025-06-09 22:03:39.056944-04	2025-06-09 22:03:39.056944-04
\.


--
-- Data for Name: telefonos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.telefonos (id, "idProveedorServicio", imei, abonado, "solicitaTrafico", "solicitaImei", observacion, "numeroTelefonico", "extraccionForense", enviar_custodia, id_ubicacion, nue) FROM stdin;
3	1	353597111191324	Javier Marquez	f	f	Telefono con Puente de carga descompuesto, no es posible hacer extrtacción forense	56968633223	t	\N	3	\N
5	1	357928274044727	Jose Pizarro Pizarro	f	f	Samsung SM-S918b DS Galaxy S23 Ultra Extraccion OK. 7478740	56996325926	f	\N	3	\N
7	2	353472170448058	Johan\tPérez Guerra	f	f	 \nDevice Name: Samsung SM-S926b Galaxy S24+\nIMEI / MEID: 353472170448058\nIMEI / MEID: 355898800448050	5698938639	f	\N	3	\N
8	2	358251526878159	Isabel Aranda	f	f	IMEI / MEID: 358251526878159\nDevice Name: Samsung SM-A055m DS Galaxy A05	56923771945	t	\N	3	\N
4	2	357928274044727	Jose Aranda	f	f	Samsung Galaxy A14	56961314602	t	\N	3	\N
6	2	 353842196657702	Álvaro\tZepeda Gómez	f	f	Device Name: Samsung SM-A536e DS Galaxy A53 5GÁlvaro\tZepeda\tGómez Extraccion forense ok\n 	947392254	t	\N	3	\N
9	2	357928274044727	Jose Aranda	f	f	Samsung SM-A146m DS Galaxy A14 5G\\\n 	56961314602	t	\N	3	\N
10	1	350888743371050	Johan\tPérez\tGuerra	f	f	Apple iPhone 12 Pro Max 5G (A2342)\nTel: +56965434904\nTel: +56940164230\nTel: +56930521987\nTel: +56946828870	56946828870	t	\N	3	\N
13	4	35432620-431907-0	Gerald Alexis ÁGUILA MALDONADO	f	f	\N	56945656760	t	f	1	\N
14	3	SN	BASTIAN NICOLAS GALLEGUILLOS VALDIVIA (víctima)	f	t	+56959215746	56959215746	f	f	1	\N
15	3	SN	JOSE Antonrio abreu Hernandez (Venezolano)	f	f	 56929874234, telefono aparece como VTR MOVIL S.A.	56929874234	f	f	3	\N
16	3	353018990260551	Vicente	f	f	Extraccion Forense OK, Teléfono marca Samsung Galaxy A35 5G SM-A356E NUE 3113392.	56999805875	t	t	2	\N
17	3	SN	no definido. lo usaba Juan Francisco Arancibia Berenguela	f	f	Solo tenemos el numero telefónico de la  victima Juan Francisco Arancibia Berenguela	56964147483	f	f	3	\N
18	1	35948835205196	OSMAN RAUL RODRIGUEZ MARQUEZ, RUT:12445895-1, MARTA BRUNET 1021, LA SERENA	f	t	\N	56956833499	f	f	3	\N
19	1	869876053096304/01	Rodrigo Cabrera Ortiz	f	f	Se realiza extracción forense. Debe salir a custodia LS/Coquimbo	56987236569	t	t	1	\N
21	2	351864751021407	Jorge Carcamo	f	f	Extraido 2025-05-28 10:30:29 (UTC-4) con MobilEdit, causa RUC 2500167086-K\nNUE 7802550	56961900079	t	f	4	\N
22	2	862849044192265	Jorge Carcamo	f	f	Extraido 2025-05-28 10:30:29 (UTC-4) con MobilEdit, causa RUC 2500167086-K\nNUE 7802550	569620805458	t	t	4	\N
23	4	864596072978828	David Mazzolotti	f	f	NUE 5236600 RUC 2500697261-9 Se realiza extracción forense OK 	569933315125	t	f	4	\N
20	1	 s/n	Gipsy Arqueros	f	f	Extracción forense fallida.	56942104602	t	f	4	\N
25	1	352682504368084	Jose ABreu	t	f	Telefono Galaxy Note20 Ultra SM-N985F, Jose Abreu Extraccion OK\n	56939033017	t	f	4	\N
24	4	2271980111	FRANCISCO JAVIER CALDERA MONTOYA	f	f	Galaxy S22 Ultra RUC 2401331626-7 NUIE 4610070, Pantalla fracturada. Abuso Sexual, enviado desde FL La Serena extracción OK, falta análsiis	2271980111	t	t	4	\N
26	4	863600058122477	No identificado	f	f	Teléfono con EF realizado. Se debe remitir a custodia.	56911111	t	t	5	4960126
27	4	s/n	No identificado	f	f	Teléfono sin identificar, levantado el dia de los hechos 22.10.2024. no pudiendo realizar EF ya que no se encuentra en condiciones de hacerlo y bloqueado. Se debe remitir a custodia.	569569569	f	t	5	4960126
33	2	355531114109296	Mayerlin pareja colate	t	t	Telefono motorola rosado sin extracción, (pareja de colate) causa tambores	56977062623	f	f	5	7767494
38	2	SN	FRANCO RICHARD REYES SALGADO	f	f	pantalla fracturada, no se ha podido relaizar extraccion	569123456	t	f	4	7767634
36	2	35545111699263301	MARCO EZEQUIEL CASTILLO ESCUDERO	t	t	EXTRACCION FORENSE OK 3113418, PASO DIRECTO A ECOH, SIN PASO POR CUSTODIA	56966112006	t	t	4	3113418
32	2	864781067234201	Angelo Adaros	t	t	Teléfono imputado Angelo Adaros causa ruc 2500441394-9 (telefono redmi negro con carcasa roja)	56974312156	t	f	5	3113400
29	4	865408068729234	Víctima Yahir Zepeda	f	f	Teléfono víctima homicidio causa Guanaqueros 2C yahir, no se ha realizado extracción aún (telefono redmi13C 5G azul con carcasa negra con letras amarillas) 	56934933266	f	f	5	5236586
35	3	352295696099076	Jorge Gonzalez COLATE	t	f	telefono moto G53 5G COLATE causa tambores 	56964391678	t	f	5	7767493
28	4	863224050836099	Patricio Yañez Opazo	f	f	Teléfono con EF realizada. Asociado a calle Narciso Herrera n°3675 Coquimbo. Telefono marca OPPO asociado a la victima. Remitir a custodia	569569569	t	t	5	6862840
31	3	356991525180964	Dylan Peña Vargas	f	f	Proceso EF realizado. Telefono Motorola g. Remitir a custodia.	569569569	t	t	7	7767345
30	3	\t860717057945550	Jonathan Eloy Sanders Araya	f	f	 Extracción Forense realizada. Telefono VIVO2028. Remitir a custodia.	56945266702	t	t	7	6862839
12	2	sn	NICOLAS ALBERTO TRIPAINAO SALAS	f	t	NICOLAS ALBERTO TRIPAINAO SALAS, solo se tiene numero telefonico.Se solicita interceptación	56958047405	f	f	3	\N
37	3	354691313788943	Jorge Gonzalez COLATE	f	t	teléfono Jorge González COLATE (Samsung negro) problemas con el puerto, sin extracción 	1111111111	f	f	5	7767492
34	3	s/n	No identificado	f	f	EF sin resultados, teléfono formateado. Iphone 12 MINI negro. 	569569569	t	t	7	7767409
2	2	353779102647841	ALEXIS ANTONIO SIERRA CASTRILLON	f	t	Telefono de ALEXIS ANTONIO SIERRA CASTRILLON\nCaja 1, para entrega a custodia	974218700	t	t	4	\N
40	3	111111111111111111111	entregado desde concepción 	f	f	teléfono huawei celeste con carcasa de auto enviado desde Concepción CAUSA LA DIVA con extracción forense realizada por RR	1111111111	t	f	5	7769967
42	3	356557847111993	Cristobal Luciano Bravo Trujillo	f	f	EF realizado. Telefono Iphone 13, negro. Se debe remitir a custodia	56954077257	t	t	7	7769971
41	3	356915115260209	Maximiliano Castex MAXI 	f	t	Teléfono motorola E7 negro bloqueado por pin (prepago) causa tambores MAXI PANTALLA NO ENCIENDE	1111111111	f	f	5	7767501
43	3	358117082130592	Francisco Flores PANCHO	f	t	Teléfono sony 63313 color negro con extracción causa tambores imputado Pancho	56940974355	t	f	5	7767501
44	3	358892480490380	Francisco Zurita IQUIQUE	f	t	Teléfono TLC color negro de IQUIQUE causa tambores, pantalla quemada sin extracción	1111111111	f	f	5	7767501
39	3	351347491512216	Darien Andres Araya Tabilo	f	f	Telefono Samsumg A23 negro del imputado, obtenido en la OD ejecutada. Se debe realizar EF y analisis de evidencia digital.	569569569	t	f	7	3113423
45	3	s/n	No identificado	f	f	(02) Teléfonos entregados por BH. Modelos antiguos, se debe verificar factibilidad de EF.  Smartphone Samsumg, blanco y sucio. Teléfono sin marca ni modelo identificado, negro	569569569	f	f	7	7767641
46	3	SN	No se identifica	f	f	6 telefonos celulares\n1 telefono azul, pantalla fracturada, se desconoce marca\n1Huawei pot-lx3\n1 telfono azul motorola, pantalla rota\n1 iphone  6 \n2 Xiamoi Redmi , no encienden\n	569123456	f	f	2	2172163
47	4	SN	ROBERT OYANADEL GUERRERO	f	f	EXTRACCION FORESNE FALLIDA,ROBERT OYANADEL GUERRERO TELEFONO NO RESPONDE	5691111111	t	f	4	70004886
48	1	SN	JOAQUIN CORTES	f	f	Apple iPhone X (Global) [iPhone10,3 D22AP] IMPUTADO JOAQUIN CORTES\nSE PROCESA CON FUERZA BRUTA, SIN EXITO	569222222	f	f	4	7004884
49	2	s/n	No identificado	f	f	Tablet marca Samsumg modelo Tab etregado por BIPE Metropolitana,por causa TdA, Secuestro Los Vilos (Pichidangui). Se debe remitir a Custodia	569569569	f	t	8	6319221
50	2	s/n	Jordan Salas Rodriguez	f	f	02 telefonos marca Apple sin modelo visible, con carcasa con figuras animadas (02)	569569569	f	t	8	7525196
51	2	s/n	Jaimir Usuga Rojas	f	f	02 teléfonos.  Marca OPPO A57 y sin marca visible, color rojo. Se dene remitir a custodia. 	569569569	f	t	8	6847429
53	4	354106241985800	Jose Castillo	f	f	Extracciónforense OK, pendiente informe de análisis.	56920601971	t	t	4	7768652
54	2	SN	Nicole Rojo Herrera	f	f	Extraccion forense fallida, se contactará con terstigo	5693554380	t	f	4	7768658
55	1	358385395036950	Cristian Ignacio Carvajal Acevedo	f	f	Telefono Imputado	56940832220	t	f	4	7769127
56	4	35257013015092	Mario Andrés Molina Romero	f	t	En proceso de extracción teléfono victima samsung negro 	56928795738	t	f	5	7768704
57	1	358710338993704	YAMILET CONSTANZA CONTRERAS SAAVEDRA	f	f	\N	56975041589	t	f	5	7768706
58	2	351814094978219	Luis Matias Pizarro Veliz	f	f	Extración telefonica ok. eviar a cuistodia. tambien  en la misma NUE  hay un teleofno ZTE	56950448242	t	t	2	4904120
59	4	35246088594751	56931739751	f	f	Telefono de la vícitma. Extracción OK, enviar custodia de Ovalle.	56931739751	t	f	2	4904120
60	2	353090109676183	Hector Cortes Ferreira	f	f	\N	123456789	t	f	4	7767517
61	2	864025050618653	Cortes Ferreira	f	f	\N	no definido	t	f	4	\N
62	3	354791647545660	Se desconoce	f	f	SAMSUNG / SM-G780F\nEnviar a Custodia Ovalle 	990949991	f	t	2	6862824
63	3	111111111111111111111	Edgar Andrés Molina Castagnoli 	f	f	teléfono marca redmi negro modelo note 12 pro  pertenece a Edgar Molina en causa Callejon Santa Elena, es amigo y arrendaba pieza con el occiso en Tierras Blancas	1111111111	f	f	5	7768709
65	1	SN	JOSE PEREZ CAMPO	f	f	Telefono Xiami Redmi 23100rn82l Extracción fallida, enviar a custodia.	no definido	t	f	2	7767588
66	3	354127112163541	RAFAEL  VALLADARES  	f	f	Telefono aportado por familia. se debe devolver a familia. 56992424718@s.whatsapp.net	56992424718	t	f	4	354127112163541
68	2	352208772292432	Jesus Castillo Rojas	f	f	\N	no definido	t	f	4	 7769116
69	1	352460880324454	Cristopher de Jesus Castillo Rojas	f	f	RUC 2300235628-7 Samsung Galaxy A13 SM-A135M\n	no definido	t	f	4	7769116
70	4	862011051329161	PAOLA XIMENA ARAYA VALLEJOS	f	f	Víctima solicita devolución, ATVT coordina entrega.	56927409476	t	f	4	\N
71	1	860134072251438	Mariana gelena gutierrez suare	t	f	Cta. controlada a nombre de  mariana gelena gutierrez suarez 27848920-5 direccion HUERFANOS 1400,SANTIAGO. Telefono fué devuelto a la víctima	56982181518	t	f	3	\N
72	2	860134072251438	FRANCISCO ANTONIO RETAMAL MOYA 10907782-8	t	f	Telefono devuelto a victima, mantenia dos chips, este numero corresponde a movistar.\n\n8956028200331638311\t56993738444\tFRANCISCO ANTONIO RETAMAL MOYA\t10907782-8\tCIENFUEGOS, 655, LOCAL COMERCIAL, LA SERENA, Coquimbo\tCONTRATO\n	5999378444	f	f	3	\N
73	4	357158815194662	nn	f	f	Extracción Fallida, enviar a custodia. telefono celular marca iPhone 12 [iPhone13,2 D53gAP] y telefono Galaxy A16 5G SM-A166M blanco.	56965897356	t	t	2	3648534
74	4	863600058122477	Brian Lopetegui Vicuña	f	f	Teléfono con EF e Informe de Análisis realizado. Dispositivo enviado a custodia de FL La Serena	no definido	t	t	7	4960126
75	1	86535007447835878	NICOLÁS IGNACIO ARANCIBIA CONTRERAS	f	f	Extracción OK, devolver a custodia.	56932913365	t	f	2	7769142
52	1	351156788021421	DILAN BASTIAN ROJEL CORTES	t	f	Extraccion telefonica telefono victima, no se logra desbloqueo pero si extracción de información, se envió a custodia	56920522434	t	t	3	5236507
67	3	350179381513421	TEOFILO MIRANDA CARDENAS	f	f	Galaxy A21s SM-A217M SERIE  R58NA1QCDBF TELEFONO IMPUTADO. EXTRACCION OK, enviado a custodia LS\n\n	56959486663	t	t	2	7768666
\.


--
-- Data for Name: telefonos_causa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.telefonos_causa (id, "idTelefono", "idCausa") FROM stdin;
8	2	102
9	3	97
10	4	86
11	5	86
12	6	86
13	7	86
14	8	86
15	9	86
16	10	86
19	13	123
20	14	123
21	15	123
22	16	148
24	17	150
25	18	149
26	12	125
27	19	156
28	20	110
29	23	150
30	25	133
31	25	123
32	26	117
33	26	117
34	27	117
35	28	17
36	30	17
37	31	17
38	32	158
39	29	159
40	33	54
41	34	36
42	35	54
43	36	148
44	37	54
45	27	85
46	39	117
47	40	18
48	41	54
49	42	125
50	43	54
51	44	54
52	45	120
53	47	179
54	48	179
55	49	60
56	50	60
57	51	60
58	52	152
59	54	150
60	53	150
61	55	155
62	56	180
63	57	180
64	58	22
65	59	22
66	60	65
67	61	65
68	63	180
69	67	152
70	70	84
71	71	190
72	72	190
\.


--
-- Data for Name: ubicacion_telefono; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ubicacion_telefono (id, nombre) FROM stdin;
1	Caja 10 Rafael Ramos
2	Caja 11, envío a custodia LS
3	NO APLICA/NO DEFINIDO
4	Caja 1 Rafael Ramos
5	Caja 2 Lissette Mujica
6	Caja 3 Rafael Ramos
7	Caja 4 Barbara León
8	CAJA TDA
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, clerk_id, email, nombre, cargo, "rolId", "createdAt", "updatedAt") FROM stdin;
4	user_2u8UyUoRSyzpZhyokkAbaUvFBeb	lmujica@minpublico.cl	Lissette Mujica	Analista	2	2024-12-18 17:14:42.107	2024-12-18 17:14:42.107
2	user_2pDKUtBa0TzA0qrZP2kpz0cqWPB	rramos@minpublico.cl	Rafael Ramos	Analista	1	2024-11-30 17:14:42.107	2024-11-30 00:00:00
6	user_2yJs4kL1Xl70eMMbggg04pVM7FD	jpgonzalez@minpublico.cl	Juan Pablo Gonzalez	Abogado	2	2025-06-10 11:14:42.107	2025-06-10 11:14:42.107
7	user_2yJljobijoKbAw6U6OJUQSBdga4	fpalma@minpublicocl.onmicrosoft.com	Felipe Palma Rojas	ATVT	2	2025-06-10 11:14:42.107	2025-06-10 11:14:42.107
8	user_2yJpRSaddQOmZqaIES9eqltj7XE	fbarrera@minpublicocl.onmicrosoft.com	Francisco Javier Barrera Vega	ATVT	2	2025-06-10 11:14:42.107	2025-06-10 11:14:42.107
9	user_2yJxKqReiSV7tCDVcLSETA95DR4	vcastror@minpublico.cl	Maria Veronica Castro	Abogado	2	2025-06-10 11:14:42.107	2025-06-10 11:14:42.107
3	user_2y2nkBWSAZUljtVg36u6p8eUuhj	bleon@minpublico.cl	Barbara León	Analista\n	2	2024-12-18 17:14:42.107	2024-12-18 17:14:42.107
11	user_2ybY4q6CMXQ7EwiKpzHKyWraJcQ	bcasanga@minpublico.cl	Berenice Casanga	Abogado	2	2025-06-16 14:14:42.107	2025-06-16 14:14:42.107
12	user_2ybbk0LZSGeqwmsf0yjBV0wMCvg	fsalinas@minpublico.cl	Freddy Salinas Salinas	Fiscal	4	2025-06-16 14:14:42.107	2025-06-16 14:14:42.107
1	user_2pZpe1TEXe5cjuPIgcasOFboGv4	ramos.aqueda@gmail.com	Rafael	Manager	4	2024-11-30 00:00:00	2024-11-30 00:00:00
13	user_2ygSzZUN9ltza2kmhbrqlgomLVX	gbarraza@minpublico.cl	Gisselle Barraza	Abogado	2	2025-06-18 11:14:42.107	2025-06-18 11:14:42.107
14	user_2yeLTq9CVzBnZEPn7vOQ684SDg9	pjazme@minpublico.cl	Paola Jazme	ATVT	2	2025-06-18 11:14:42.107	2025-06-18 11:14:42.107
15	user_2yeLNbI7YhT8Ncp4W1M8EhTvqD0	dgutierrezd@minpublico.cl	DAFNNE LAZARINE GUTIERREZ DIAZ	ATVT	2	2025-06-18 11:14:42.107	2025-06-18 11:14:42.107
16	user_2yhDCHns8w2x1bhLQNpDmWyvCeH	jorrego@minpublicocl.onmicrosoft.com	jorrego	Jefe UGI	2	2025-06-18 11:14:42.107	2025-06-18 11:14:42.107
10	user_2yKhgru47GpAS1i4kpb1XsUMFEc	aortize@minpublicocl.onmicrosoft.com	Andrea Ortiz	Auxiliar	2	2025-06-10 11:14:42.107	2025-06-10 11:14:42.107
17	user_30s3QBPcM9IEa0dSNaYzmvrqPbe	rvergarab@minpublico.cl	Roberto Vergara	Analista	2	2024-11-30 00:00:00	2024-11-30 00:00:00
5	user_2y2ntavSE10QWT6VON3vVar6kVG	agonzalezc@minpublicocl.onmicrosoft.com	Angela Gonzalez Coquelet	Analista	2	2024-12-18 17:14:42.107	2024-12-18 17:14:42.107
18	user_3192kzcBTFpIpDX1J7yloJBul1A	itorrejon@minpublico.cl	Iván Torrejón	Analista	2	2024-11-30 00:00:00	2024-11-30 00:00:00
19	user_31Yja2lNouMeECFEZunpbvRGUPG	lmanzano@minpublico.cl	Liliana Manzano	Analista	2	2024-11-30 00:00:00	2024-11-30 00:00:00
\.


--
-- Name:  Atvt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public." Atvt_id_seq"', 1, false);


--
-- Name: Abogado_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Abogado_id_seq"', 1, false);


--
-- Name: Actividad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Actividad_id_seq"', 349, true);


--
-- Name: Analista_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Analista_id_seq"', 1, false);


--
-- Name: Area_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Area_id_seq"', 3, true);


--
-- Name: CausaOrganizacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CausaOrganizacion_id_seq"', 5, true);


--
-- Name: Causa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Causa_id_seq"', 203, true);


--
-- Name: CausasRelacionadas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CausasRelacionadas_id_seq"', 15, true);


--
-- Name: Cautelar_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Cautelar_id_seq"', 6, true);


--
-- Name: Comuna_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Comuna_id_seq"', 1, false);


--
-- Name: CorrelativoTipoActividadSeq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CorrelativoTipoActividadSeq"', 50, true);


--
-- Name: Delito_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Delito_id_seq"', 1, true);


--
-- Name: Fiscal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Fiscal_id_seq"', 2, true);


--
-- Name: Foco_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Foco_id_seq"', 1, false);


--
-- Name: Fotografia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Fotografia_id_seq"', 190, true);


--
-- Name: Genograma_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Genograma_id_seq"', 2, true);


--
-- Name: Imputado_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Imputado_id_seq"', 227, true);


--
-- Name: MIHallazgos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."MIHallazgos_id_seq"', 6, true);


--
-- Name: MedidaIntrusiva_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."MedidaIntrusiva_id_seq"', 1, false);


--
-- Name: MiembrosOrganizacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."MiembrosOrganizacion_id_seq"', 101, true);


--
-- Name: Nacionalidad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Nacionalidad_id_seq"', 1, false);


--
-- Name: OrganizacionDelictual_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."OrganizacionDelictual_id_seq"', 16, true);


--
-- Name: TimelineHito_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TimelineHito_id_seq"', 37, true);


--
-- Name: TipoActividad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TipoActividad_id_seq"', 10, true);


--
-- Name: TipoMedida_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TipoMedida_id_seq"', 1, false);


--
-- Name: TipoOrganizacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TipoOrganizacion_id_seq"', 2, true);


--
-- Name: Tribunal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Tribunal_id_seq"', 1, false);


--
-- Name: UnidadPolicial_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."UnidadPolicial_id_seq"', 2, true);


--
-- Name: Victima_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Victima_id_seq"', 86, true);


--
-- Name: categorias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categorias_id_seq', 9, true);


--
-- Name: estados_causa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estados_causa_id_seq', 6, true);


--
-- Name: origenes_causa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.origenes_causa_id_seq', 3, true);


--
-- Name: proveedores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.proveedores_id_seq', 4, true);


--
-- Name: resoluciones_tribunal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.resoluciones_tribunal_id_seq', 4, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, false);


--
-- Name: sitios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sitios_id_seq', 14, true);


--
-- Name: telefonos_causa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.telefonos_causa_id_seq', 72, true);


--
-- Name: telefonos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.telefonos_id_seq', 75, true);


--
-- Name: ubicaciontelefono_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ubicaciontelefono_id_seq', 4, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 3, true);


--
-- Name: Atvt  Atvt_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Atvt"
    ADD CONSTRAINT " Atvt_pkey" PRIMARY KEY (id);


--
-- Name: Abogado Abogado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Abogado"
    ADD CONSTRAINT "Abogado_pkey" PRIMARY KEY (id);


--
-- Name: Actividad Actividad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Actividad"
    ADD CONSTRAINT "Actividad_pkey" PRIMARY KEY (id);


--
-- Name: Analista Analista_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Analista"
    ADD CONSTRAINT "Analista_pkey" PRIMARY KEY (id);


--
-- Name: Area Area_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Area"
    ADD CONSTRAINT "Area_pkey" PRIMARY KEY (id);


--
-- Name: CausaOrganizacion CausaOrganizacion_organizacionId_causaId_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CausaOrganizacion"
    ADD CONSTRAINT "CausaOrganizacion_organizacionId_causaId_unique" UNIQUE ("organizacionId", "causaId");


--
-- Name: CausaOrganizacion CausaOrganizacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CausaOrganizacion"
    ADD CONSTRAINT "CausaOrganizacion_pkey" PRIMARY KEY (id);


--
-- Name: Causa Causa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Causa"
    ADD CONSTRAINT "Causa_pkey" PRIMARY KEY (id);


--
-- Name: CausasCrimenOrganizado CausasCrimenOrganizado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CausasCrimenOrganizado"
    ADD CONSTRAINT "CausasCrimenOrganizado_pkey" PRIMARY KEY ("causaId", "parametroId");


--
-- Name: CausasImputados CausasImputados_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CausasImputados"
    ADD CONSTRAINT "CausasImputados_pkey" PRIMARY KEY ("causaId", "imputadoId");


--
-- Name: CausasRelacionadas CausasRelacionadas_causaMadreId_causaAristaId_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CausasRelacionadas"
    ADD CONSTRAINT "CausasRelacionadas_causaMadreId_causaAristaId_key" UNIQUE ("causaMadreId", "causaAristaId");


--
-- Name: CausasRelacionadas CausasRelacionadas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CausasRelacionadas"
    ADD CONSTRAINT "CausasRelacionadas_pkey" PRIMARY KEY (id);


--
-- Name: CausasVictimas CausasVictimas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CausasVictimas"
    ADD CONSTRAINT "CausasVictimas_pkey" PRIMARY KEY ("causaId", "victimaId");


--
-- Name: Cautelar Cautelar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cautelar"
    ADD CONSTRAINT "Cautelar_pkey" PRIMARY KEY (id);


--
-- Name: Comuna Comuna_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comuna"
    ADD CONSTRAINT "Comuna_pkey" PRIMARY KEY (id);


--
-- Name: CorrelativoTipoActividad CorrelativoTipoActividad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CorrelativoTipoActividad"
    ADD CONSTRAINT "CorrelativoTipoActividad_pkey" PRIMARY KEY (id);


--
-- Name: CrimenOrganizadoParams CrimenOrganizadoParams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CrimenOrganizadoParams"
    ADD CONSTRAINT "CrimenOrganizadoParams_pkey" PRIMARY KEY (value);


--
-- Name: Delito Delito_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Delito"
    ADD CONSTRAINT "Delito_pkey" PRIMARY KEY (id);


--
-- Name: Fiscal Fiscal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fiscal"
    ADD CONSTRAINT "Fiscal_pkey" PRIMARY KEY (id);


--
-- Name: Foco Foco_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Foco"
    ADD CONSTRAINT "Foco_pkey" PRIMARY KEY (id);


--
-- Name: Fotografia Fotografia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fotografia"
    ADD CONSTRAINT "Fotografia_pkey" PRIMARY KEY (id);


--
-- Name: Genograma Genograma_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Genograma"
    ADD CONSTRAINT "Genograma_pkey" PRIMARY KEY (id);


--
-- Name: Imputado Imputado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Imputado"
    ADD CONSTRAINT "Imputado_pkey" PRIMARY KEY (id);


--
-- Name: MIHallazgos MIHallazgos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MIHallazgos"
    ADD CONSTRAINT "MIHallazgos_nombre_key" UNIQUE (nombre);


--
-- Name: MIHallazgos MIHallazgos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MIHallazgos"
    ADD CONSTRAINT "MIHallazgos_pkey" PRIMARY KEY (id);


--
-- Name: MedidaIntrusiva MedidaIntrusiva_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MedidaIntrusiva"
    ADD CONSTRAINT "MedidaIntrusiva_pkey" PRIMARY KEY (id);


--
-- Name: Medida_Hallazgo Medida_Hallazgo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Medida_Hallazgo"
    ADD CONSTRAINT "Medida_Hallazgo_pkey" PRIMARY KEY (medida_id, hallazgo_id);


--
-- Name: MiembrosOrganizacion MiembrosOrganizacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MiembrosOrganizacion"
    ADD CONSTRAINT "MiembrosOrganizacion_pkey" PRIMARY KEY (id);


--
-- Name: Nacionalidad Nacionalidad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Nacionalidad"
    ADD CONSTRAINT "Nacionalidad_pkey" PRIMARY KEY (id);


--
-- Name: OrganizacionDelictual OrganizacionDelictual_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrganizacionDelictual"
    ADD CONSTRAINT "OrganizacionDelictual_pkey" PRIMARY KEY (id);


--
-- Name: TimelineHito TimelineHito_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TimelineHito"
    ADD CONSTRAINT "TimelineHito_pkey" PRIMARY KEY (id);


--
-- Name: TipoActividad TipoActividad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TipoActividad"
    ADD CONSTRAINT "TipoActividad_pkey" PRIMARY KEY (id);


--
-- Name: TipoMedida TipoMedida_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TipoMedida"
    ADD CONSTRAINT "TipoMedida_nombre_key" UNIQUE (nombre);


--
-- Name: TipoMedida TipoMedida_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TipoMedida"
    ADD CONSTRAINT "TipoMedida_pkey" PRIMARY KEY (id);


--
-- Name: TipoOrganizacion TipoOrganizacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TipoOrganizacion"
    ADD CONSTRAINT "TipoOrganizacion_pkey" PRIMARY KEY (id);


--
-- Name: Tribunal Tribunal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tribunal"
    ADD CONSTRAINT "Tribunal_pkey" PRIMARY KEY (id);


--
-- Name: UnidadPolicial UnidadPolicial_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnidadPolicial"
    ADD CONSTRAINT "UnidadPolicial_nombre_key" UNIQUE (nombre);


--
-- Name: UnidadPolicial UnidadPolicial_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UnidadPolicial"
    ADD CONSTRAINT "UnidadPolicial_pkey" PRIMARY KEY (id);


--
-- Name: Victima Victima_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Victima"
    ADD CONSTRAINT "Victima_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: categorias categorias_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_nombre_key UNIQUE (nombre);


--
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id);


--
-- Name: estados_causa estados_causa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estados_causa
    ADD CONSTRAINT estados_causa_pkey PRIMARY KEY (id);


--
-- Name: origenes_causa origenes_causa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.origenes_causa
    ADD CONSTRAINT origenes_causa_pkey PRIMARY KEY (id);


--
-- Name: proveedores proveedores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedores
    ADD CONSTRAINT proveedores_pkey PRIMARY KEY (id);


--
-- Name: resoluciones_tribunal resoluciones_tribunal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resoluciones_tribunal
    ADD CONSTRAINT resoluciones_tribunal_pkey PRIMARY KEY (id);


--
-- Name: resoluciones_tribunal resoluciones_tribunal_resolucion_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resoluciones_tribunal
    ADD CONSTRAINT resoluciones_tribunal_resolucion_key UNIQUE (resolucion);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sitios sitios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sitios
    ADD CONSTRAINT sitios_pkey PRIMARY KEY (id);


--
-- Name: telefonos_causa telefonos_causa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.telefonos_causa
    ADD CONSTRAINT telefonos_causa_pkey PRIMARY KEY (id);


--
-- Name: telefonos telefonos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.telefonos
    ADD CONSTRAINT telefonos_pkey PRIMARY KEY (id);


--
-- Name: ubicacion_telefono ubicaciontelefono_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ubicacion_telefono
    ADD CONSTRAINT ubicaciontelefono_pkey PRIMARY KEY (id);


--
-- Name: ubicacion_telefono unique_ubicacion_nombre; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ubicacion_telefono
    ADD CONSTRAINT unique_ubicacion_nombre UNIQUE (nombre);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: Actividad_causa_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Actividad_causa_id_idx" ON public."Actividad" USING btree (causa_id);


--
-- Name: Actividad_tipo_actividad_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Actividad_tipo_actividad_id_idx" ON public."Actividad" USING btree (tipo_actividad_id);


--
-- Name: Actividad_usuario_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Actividad_usuario_id_idx" ON public."Actividad" USING btree (usuario_id);


--
-- Name: Area_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Area_nombre_key" ON public."Area" USING btree (nombre);


--
-- Name: CausaOrganizacion_causaId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CausaOrganizacion_causaId_idx" ON public."CausaOrganizacion" USING btree ("causaId");


--
-- Name: CausaOrganizacion_organizacionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CausaOrganizacion_organizacionId_idx" ON public."CausaOrganizacion" USING btree ("organizacionId");


--
-- Name: Genograma_causaId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Genograma_causaId_idx" ON public."Genograma" USING btree ("causaId");


--
-- Name: Genograma_rucCausa_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Genograma_rucCausa_idx" ON public."Genograma" USING btree ("rucCausa");


--
-- Name: MiembrosOrganizacion_organizacionId_imputadoId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MiembrosOrganizacion_organizacionId_imputadoId_key" ON public."MiembrosOrganizacion" USING btree ("organizacionId", "imputadoId");


--
-- Name: TipoActividad_areaId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "TipoActividad_areaId_idx" ON public."TipoActividad" USING btree ("areaId");


--
-- Name: TipoActividad_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "TipoActividad_nombre_key" ON public."TipoActividad" USING btree (nombre);


--
-- Name: estados_causa_codigo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX estados_causa_codigo_key ON public.estados_causa USING btree (codigo);


--
-- Name: estados_causa_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX estados_causa_nombre_key ON public.estados_causa USING btree (nombre);


--
-- Name: fki_fk_causa_atvt; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fk_causa_atvt ON public."Causa" USING btree ("atvtId");


--
-- Name: idx_actividad_usuario_asignado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_actividad_usuario_asignado ON public."Actividad" USING btree (usuario_asignado_id);


--
-- Name: idx_categorias_activo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_categorias_activo ON public.categorias USING btree (activo);


--
-- Name: idx_categorias_orden; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_categorias_orden ON public.categorias USING btree (orden);


--
-- Name: idx_causa_estado_causa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_causa_estado_causa ON public."Causa" USING btree ("estadoCausaId");


--
-- Name: idx_causas_relacionadas_arista; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_causas_relacionadas_arista ON public."CausasRelacionadas" USING btree ("causaAristaId");


--
-- Name: idx_causas_relacionadas_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_causas_relacionadas_fecha ON public."CausasRelacionadas" USING btree ("fechaRelacion");


--
-- Name: idx_causas_relacionadas_madre; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_causas_relacionadas_madre ON public."CausasRelacionadas" USING btree ("causaMadreId");


--
-- Name: idx_origenes_causa_activo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_origenes_causa_activo ON public.origenes_causa USING btree (activo);


--
-- Name: idx_origenes_causa_orden; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_origenes_causa_orden ON public.origenes_causa USING btree (orden);


--
-- Name: idx_sitios_activo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sitios_activo ON public.sitios USING btree (activo);


--
-- Name: idx_sitios_categoria_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sitios_categoria_id ON public.sitios USING btree (categoria_id);


--
-- Name: idx_sitios_nombre; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sitios_nombre ON public.sitios USING btree (nombre);


--
-- Name: idx_sitios_orden; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sitios_orden ON public.sitios USING btree (orden);


--
-- Name: idx_telefonos_imei; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_telefonos_imei ON public.telefonos USING btree (imei);


--
-- Name: idx_telefonos_numero; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_telefonos_numero ON public.telefonos USING btree ("numeroTelefonico");


--
-- Name: idx_telefonos_proveedor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_telefonos_proveedor ON public.telefonos USING btree ("idProveedorServicio");


--
-- Name: idx_telefonos_ubicacion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_telefonos_ubicacion ON public.telefonos USING btree (id_ubicacion);


--
-- Name: idx_timelinehito_causaid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_timelinehito_causaid ON public."TimelineHito" USING btree ("causaId");


--
-- Name: medida_intrusiva_causa_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX medida_intrusiva_causa_id_idx ON public."MedidaIntrusiva" USING btree (causa_id);


--
-- Name: medida_intrusiva_fiscal_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX medida_intrusiva_fiscal_id_idx ON public."MedidaIntrusiva" USING btree (fiscal_id);


--
-- Name: medida_intrusiva_tipo_medida_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX medida_intrusiva_tipo_medida_id_idx ON public."MedidaIntrusiva" USING btree (tipo_medida_id);


--
-- Name: origenes_causa_codigo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX origenes_causa_codigo_key ON public.origenes_causa USING btree (codigo);


--
-- Name: origenes_causa_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX origenes_causa_nombre_key ON public.origenes_causa USING btree (nombre);


--
-- Name: roles_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX roles_nombre_key ON public.roles USING btree (nombre);


--
-- Name: usuarios_clerk_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX usuarios_clerk_id_key ON public.usuarios USING btree (clerk_id);


--
-- Name: usuarios_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX usuarios_email_key ON public.usuarios USING btree (email);


--
-- Name: CausaOrganizacion update_causa_organizacion_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_causa_organizacion_updated_at BEFORE UPDATE ON public."CausaOrganizacion" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: Medida_Hallazgo update_medida_hallazgo_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_medida_hallazgo_updated_at BEFORE UPDATE ON public."Medida_Hallazgo" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: MedidaIntrusiva update_medidaintrusiva_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_medidaintrusiva_updated_at BEFORE UPDATE ON public."MedidaIntrusiva" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: TipoMedida update_tipomedida_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_tipomedida_updated_at BEFORE UPDATE ON public."TipoMedida" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: Actividad Actividad_causa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Actividad"
    ADD CONSTRAINT "Actividad_causa_id_fkey" FOREIGN KEY (causa_id) REFERENCES public."Causa"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Actividad Actividad_tipo_actividad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Actividad"
    ADD CONSTRAINT "Actividad_tipo_actividad_id_fkey" FOREIGN KEY (tipo_actividad_id) REFERENCES public."TipoActividad"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Actividad Actividad_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Actividad"
    ADD CONSTRAINT "Actividad_usuario_id_fkey" FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CausaOrganizacion CausaOrganizacion_causaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CausaOrganizacion"
    ADD CONSTRAINT "CausaOrganizacion_causaId_fkey" FOREIGN KEY ("causaId") REFERENCES public."Causa"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CausaOrganizacion CausaOrganizacion_organizacionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CausaOrganizacion"
    ADD CONSTRAINT "CausaOrganizacion_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES public."OrganizacionDelictual"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Causa Causa_abogadoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Causa"
    ADD CONSTRAINT "Causa_abogadoId_fkey" FOREIGN KEY ("abogadoId") REFERENCES public."Abogado"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Causa Causa_analistaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Causa"
    ADD CONSTRAINT "Causa_analistaId_fkey" FOREIGN KEY ("analistaId") REFERENCES public."Analista"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Causa Causa_comunaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Causa"
    ADD CONSTRAINT "Causa_comunaId_fkey" FOREIGN KEY ("comunaId") REFERENCES public."Comuna"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Causa Causa_delitoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Causa"
    ADD CONSTRAINT "Causa_delitoId_fkey" FOREIGN KEY ("delitoId") REFERENCES public."Delito"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Causa Causa_estadoCausaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Causa"
    ADD CONSTRAINT "Causa_estadoCausaId_fkey" FOREIGN KEY ("estadoCausaId") REFERENCES public.estados_causa(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Causa Causa_fiscalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Causa"
    ADD CONSTRAINT "Causa_fiscalId_fkey" FOREIGN KEY ("fiscalId") REFERENCES public."Fiscal"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Causa Causa_focoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Causa"
    ADD CONSTRAINT "Causa_focoId_fkey" FOREIGN KEY ("focoId") REFERENCES public."Foco"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Causa Causa_nacionalidadVictimaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Causa"
    ADD CONSTRAINT "Causa_nacionalidadVictimaId_fkey" FOREIGN KEY ("nacionalidadVictimaId") REFERENCES public."Nacionalidad"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Causa Causa_tribunalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Causa"
    ADD CONSTRAINT "Causa_tribunalId_fkey" FOREIGN KEY ("tribunalId") REFERENCES public."Tribunal"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CausasCrimenOrganizado CausasCrimenOrganizado_parametroId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CausasCrimenOrganizado"
    ADD CONSTRAINT "CausasCrimenOrganizado_parametroId_fkey" FOREIGN KEY ("parametroId") REFERENCES public."CrimenOrganizadoParams"(value) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CausasImputados CausasImputados_causaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CausasImputados"
    ADD CONSTRAINT "CausasImputados_causaId_fkey" FOREIGN KEY ("causaId") REFERENCES public."Causa"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CausasImputados CausasImputados_cautelarId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CausasImputados"
    ADD CONSTRAINT "CausasImputados_cautelarId_fkey" FOREIGN KEY ("cautelarId") REFERENCES public."Cautelar"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CausasImputados CausasImputados_imputadoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CausasImputados"
    ADD CONSTRAINT "CausasImputados_imputadoId_fkey" FOREIGN KEY ("imputadoId") REFERENCES public."Imputado"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CausasRelacionadas CausasRelacionadas_causaAristaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CausasRelacionadas"
    ADD CONSTRAINT "CausasRelacionadas_causaAristaId_fkey" FOREIGN KEY ("causaAristaId") REFERENCES public."Causa"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CausasRelacionadas CausasRelacionadas_causaMadreId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CausasRelacionadas"
    ADD CONSTRAINT "CausasRelacionadas_causaMadreId_fkey" FOREIGN KEY ("causaMadreId") REFERENCES public."Causa"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CausasVictimas CausasVictimas_causaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CausasVictimas"
    ADD CONSTRAINT "CausasVictimas_causaId_fkey" FOREIGN KEY ("causaId") REFERENCES public."Causa"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CausasVictimas CausasVictimas_victimaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CausasVictimas"
    ADD CONSTRAINT "CausasVictimas_victimaId_fkey" FOREIGN KEY ("victimaId") REFERENCES public."Victima"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Fotografia Fotografia_imputadoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fotografia"
    ADD CONSTRAINT "Fotografia_imputadoId_fkey" FOREIGN KEY ("imputadoId") REFERENCES public."Imputado"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Genograma Genograma_causaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Genograma"
    ADD CONSTRAINT "Genograma_causaId_fkey" FOREIGN KEY ("causaId") REFERENCES public."Causa"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Imputado Imputado_nacionalidadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Imputado"
    ADD CONSTRAINT "Imputado_nacionalidadId_fkey" FOREIGN KEY ("nacionalidadId") REFERENCES public."Nacionalidad"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MedidaIntrusiva MedidaIntrusiva_causa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MedidaIntrusiva"
    ADD CONSTRAINT "MedidaIntrusiva_causa_id_fkey" FOREIGN KEY (causa_id) REFERENCES public."Causa"(id) ON DELETE RESTRICT;


--
-- Name: MedidaIntrusiva MedidaIntrusiva_fiscal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MedidaIntrusiva"
    ADD CONSTRAINT "MedidaIntrusiva_fiscal_id_fkey" FOREIGN KEY (fiscal_id) REFERENCES public."Fiscal"(id) ON DELETE RESTRICT;


--
-- Name: MedidaIntrusiva MedidaIntrusiva_tipo_medida_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MedidaIntrusiva"
    ADD CONSTRAINT "MedidaIntrusiva_tipo_medida_id_fkey" FOREIGN KEY (tipo_medida_id) REFERENCES public."TipoMedida"(id) ON DELETE RESTRICT;


--
-- Name: MedidaIntrusiva MedidaIntrusiva_tribunal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MedidaIntrusiva"
    ADD CONSTRAINT "MedidaIntrusiva_tribunal_id_fkey" FOREIGN KEY (tribunal_id) REFERENCES public."Tribunal"(id) ON DELETE RESTRICT;


--
-- Name: MedidaIntrusiva MedidaIntrusiva_unidad_policial_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MedidaIntrusiva"
    ADD CONSTRAINT "MedidaIntrusiva_unidad_policial_id_fkey" FOREIGN KEY (unidad_policial_id) REFERENCES public."UnidadPolicial"(id) ON DELETE RESTRICT;


--
-- Name: Medida_Hallazgo Medida_Hallazgo_hallazgo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Medida_Hallazgo"
    ADD CONSTRAINT "Medida_Hallazgo_hallazgo_id_fkey" FOREIGN KEY (hallazgo_id) REFERENCES public."MIHallazgos"(id) ON DELETE CASCADE;


--
-- Name: Medida_Hallazgo Medida_Hallazgo_medida_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Medida_Hallazgo"
    ADD CONSTRAINT "Medida_Hallazgo_medida_id_fkey" FOREIGN KEY (medida_id) REFERENCES public."MedidaIntrusiva"(id) ON DELETE CASCADE;


--
-- Name: MiembrosOrganizacion MiembrosOrganizacion_imputadoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MiembrosOrganizacion"
    ADD CONSTRAINT "MiembrosOrganizacion_imputadoId_fkey" FOREIGN KEY ("imputadoId") REFERENCES public."Imputado"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MiembrosOrganizacion MiembrosOrganizacion_organizacionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MiembrosOrganizacion"
    ADD CONSTRAINT "MiembrosOrganizacion_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES public."OrganizacionDelictual"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrganizacionDelictual OrganizacionDelictual_tipoOrganizacionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrganizacionDelictual"
    ADD CONSTRAINT "OrganizacionDelictual_tipoOrganizacionId_fkey" FOREIGN KEY ("tipoOrganizacionId") REFERENCES public."TipoOrganizacion"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TipoActividad TipoActividad_areaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TipoActividad"
    ADD CONSTRAINT "TipoActividad_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES public."Area"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Victima Victima_nacionalidadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Victima"
    ADD CONSTRAINT "Victima_nacionalidadId_fkey" FOREIGN KEY ("nacionalidadId") REFERENCES public."Nacionalidad"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CorrelativoTipoActividad fkUsuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CorrelativoTipoActividad"
    ADD CONSTRAINT "fkUsuario" FOREIGN KEY (usuario) REFERENCES public.usuarios(id);


--
-- Name: Actividad fk_actividad_usuario_asignado; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Actividad"
    ADD CONSTRAINT fk_actividad_usuario_asignado FOREIGN KEY (usuario_asignado_id) REFERENCES public.usuarios(id);


--
-- Name: TimelineHito fk_causa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TimelineHito"
    ADD CONSTRAINT fk_causa FOREIGN KEY ("causaId") REFERENCES public."Causa"(id) ON DELETE CASCADE;


--
-- Name: Causa fk_causa_atvt; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Causa"
    ADD CONSTRAINT fk_causa_atvt FOREIGN KEY ("atvtId") REFERENCES public."Atvt"(id) NOT VALID;


--
-- Name: sitios fk_sitios_categoria; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sitios
    ADD CONSTRAINT fk_sitios_categoria FOREIGN KEY (categoria_id) REFERENCES public.categorias(id) ON DELETE SET NULL;


--
-- Name: telefonos fk_telefono_proveedor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.telefonos
    ADD CONSTRAINT fk_telefono_proveedor FOREIGN KEY ("idProveedorServicio") REFERENCES public.proveedores(id);


--
-- Name: telefonos fk_telefono_ubicacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.telefonos
    ADD CONSTRAINT fk_telefono_ubicacion FOREIGN KEY (id_ubicacion) REFERENCES public.ubicacion_telefono(id);


--
-- Name: telefonos_causa fk_telefonocausa_causa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.telefonos_causa
    ADD CONSTRAINT fk_telefonocausa_causa FOREIGN KEY ("idCausa") REFERENCES public."Causa"(id);


--
-- Name: telefonos_causa fk_telefonocausa_telefono; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.telefonos_causa
    ADD CONSTRAINT fk_telefonocausa_telefono FOREIGN KEY ("idTelefono") REFERENCES public.telefonos(id);


--
-- Name: usuarios fk_usuario_rol; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT fk_usuario_rol FOREIGN KEY ("rolId") REFERENCES public.roles(id);


--
-- Name: CorrelativoTipoActividad fktipoActividad; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CorrelativoTipoActividad"
    ADD CONSTRAINT "fktipoActividad" FOREIGN KEY ("tipoActividad") REFERENCES public."TipoActividad"(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

