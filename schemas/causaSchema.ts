import { z } from 'zod';

export const causaSchema = z.object({
  // 🔥 NUEVOS CAMPOS OBLIGATORIOS
  idOrigen: z.number().min(1, 'Debe seleccionar un origen de causa'),
  idEstado: z.number().min(1, 'Debe seleccionar un estado de causa'),
  
  // Campos antiguos (mantener temporalmente como opcionales)
  causaEcoh: z.boolean().optional(),
  causaLegada: z.boolean().optional(),
  
  // Campos obligatorios existentes
  denominacionCausa: z.string().min(1, 'La denominación de la causa es requerida'),
  fechaHoraTomaConocimiento: z.string().min(1, 'La fecha y hora de toma de conocimiento es requerida'),
  fechaDelHecho: z.string().min(1, 'La fecha del hecho es requerida'),
  delito: z.number().min(1, 'Debe seleccionar un delito'),
  
  // Campos opcionales existentes
  ruc: z.string().optional(),
  folioBw: z.string().optional(),
  rit: z.string().optional(),
  coordenadasSs: z.string().optional(),
  foco: z.number().optional(),
  tribunal: z.number().optional(),
  fiscalACargo: z.number().optional(),
  abogado: z.number().optional(),
  analista: z.number().optional(),
  atvt: z.number().optional(),
  
  // Campos de fechas opcionales
  fechaIta: z.string().nullable().optional(),
  fechaPpp: z.string().nullable().optional(),
  
  // Campos de números de registro
  numeroIta: z.string().optional(),
  numeroPpp: z.string().optional(),
  
  // Campos de víctima
  victima: z.string().optional(),
  rut: z.string().optional(),
  nacionalidadVictima: z.number().optional(),
  
  // Campos booleanos
  constituyeSs: z.boolean().default(false),
  homicidioConsumado: z.boolean().optional(),
  esCrimenOrganizado: z.boolean().default(false),
  
  // Observaciones
  observacion: z.string().optional(),
  
  // Crimen organizado
  causasCrimenOrg: z.array(z.number()).default([]),
  
  // Campo ID para edición
  causaId: z.union([z.string(), z.number()]).optional(),
});

export type CausaFormData = z.infer<typeof causaSchema>;