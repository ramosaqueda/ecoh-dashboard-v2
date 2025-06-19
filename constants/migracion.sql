-- Migrations will appear here as you chat with AI

alter table causas
alter column homicidio_consumado type boolean using homicidio_consumado = 'VERDADERO',
alter column constituye_ss type boolean using constituye_ss = 'VERDADERO',
alter column sin_llamado_ecoh type boolean using sin_llamado_ecoh = 'VERDADERO',
alter column causa_ecoh type boolean using causa_ecoh = 'VERDADERO',
alter column causa_legada type boolean using causa_legada = 'VERDADERO';

alter table causas
drop fecha_audiencia_formalizacion,
drop medida_cautelar,
drop plazo_investigacion,
drop audiencias,
drop fecha_formalizacion,
drop plazo_reserva,
drop alerta_plazo_reserva,
drop nombre_imputado,
drop rut_imputado,
drop nacionalidad_imputado;

alter table causas
drop fecha_rac,
drop numero_rac;

create table analistas (
  id bigint primary key generated always as identity,
  nombre text not null
);

create table fiscales (
  id bigint primary key generated always as identity,
  nombre text not null
);

create table focos (
  id bigint primary key generated always as identity,
  nombre text not null
);

create table delitos (
  id bigint primary key generated always as identity,
  nombre text not null
);

create table abogados (
  id bigint primary key generated always as identity,
  nombre text not null
);

create table tribunales (
  id bigint primary key generated always as identity,
  nombre text not null
);

alter table causas
add column analista_id bigint,
add column fiscal_id bigint,
add column foco_id bigint,
add column delito_id bigint,
add column abogado_id bigint,
add column tribunal_id bigint,
add constraint fk_analista foreign key (analista_id) references analistas (id),
add constraint fk_fiscal foreign key (fiscal_id) references fiscales (id),
add constraint fk_foco foreign key (foco_id) references focos (id),
add constraint fk_delito foreign key (delito_id) references delitos (id),
add constraint fk_abogado foreign key (abogado_id) references abogados (id),
add constraint fk_tribunal foreign key (tribunal_id) references tribunales (id);

alter table causas
drop analista,
drop fiscal_a_cargo,
drop foco,
drop delito,
drop abogado,
drop tribunal;

create table imputados (
  id bigint primary key generated always as identity,
  nombre_sujeto text not null,
  doc_id text not null
);

create table causas_imputados (
  causa_id bigint not null,
  imputado_id bigint not null,
  primary key (causa_id, imputado_id),
  foreign key (causa_id) references causas (id),
  foreign key (imputado_id) references imputados (id)
);

create table nacionalidades (
  id bigint primary key generated always as identity,
  nombre text not null
);

alter table imputados
add column nacionalidad_id bigint,
add constraint fk_nacionalidad foreign key (nacionalidad_id) references nacionalidades (id);

alter table causas
add column nacionalidad_victima_id bigint,
add constraint fk_nacionalidad_victima foreign key (nacionalidad_victima_id) references nacionalidades (id);

alter table causas
drop nacionalidad_victima;