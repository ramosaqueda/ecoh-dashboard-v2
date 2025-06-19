// schemas/causaSchema.ts
import * as z from 'zod';

export const causaSchema = z.object({
  // Campos booleanos
  causaEcoh: z.boolean().default(false),
  causaLegada: z.boolean().default(false),
  constituyeSs: z.boolean().default(false),
  homicidioConsumado: z.boolean().optional(),
  // Campos requeridos
  fechaHoraTomaConocimiento: z
    .string()
    .min(1, 'La fecha y hora de toma de conocimiento es requerida'),
  fechaDelHecho: z.string().min(1, 'La fecha del hecho es requerida'),
  denominacionCausa: z.string().min(1, 'Este campo es requerido'),
  delito: z
    .union([z.number(), z.string().transform((val) => parseInt(val, 10))])
    .refine((val) => !isNaN(val), {
      message: 'Debe seleccionar un delito válido'
    }),

  // Campos opcionales de texto
  ruc: z.string().optional(),
  foliobw: z.string().optional(),
  coordenadasSs: z.string().optional(),
  rit: z.string().optional(),
  numeroIta: z.string().optional(),
  numeroPpp: z.string().optional(),
  observacion: z.string().optional(),

  // Fechas opcionales
  fechaIta: z.string().optional().nullable(),
  fechaPpp: z.string().optional().nullable(),

  // Relaciones opcionales
  foco: z
    .union([
      z.number(),
      z.string().transform((val) => parseInt(val, 10)),
      z.null()
    ])
    .optional()
    .nullable(),

  tribunal: z
    .union([
      z.number(),
      z.string().transform((val) => parseInt(val, 10)),
      z.null()
    ])
    .optional()
    .nullable(),

  fiscalACargo: z
    .union([
      z.number(),
      z.string().transform((val) => parseInt(val, 10)),
      z.null()
    ])
    .optional()
    .nullable(),

  abogado: z
    .union([
      z.number(),
      z.string().transform((val) => parseInt(val, 10)),
      z.null()
    ])
    .optional()
    .nullable(),

  analista: z
    .union([
      z.number(),
      z.string().transform((val) => parseInt(val, 10)),
      z.null()
    ])
    .optional()
    .nullable(),
    
  atvt: z
    .union([
      z.number(),
      z.string().transform((val) => parseInt(val, 10)),
      z.null()
    ])
    .optional()
    .nullable(),

  // Parámetros de crimen organizado
  causasCrimenOrg: z.array(
    z.union([
      z.number(),
      z.string().transform(val => parseInt(val, 10))
    ])
  ).optional().default([]),
  
  // Estado de crimen organizado
  esCrimenOrganizado: z.any().optional().nullable()
});

export type CausaFormData = z.infer<typeof causaSchema>;