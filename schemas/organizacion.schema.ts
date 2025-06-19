// schemas/organizacion.schema.ts
import * as z from 'zod';

export const organizacionSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  fechaIdentificacion: z.date({
    required_error: 'La fecha de identificación es requerida'
  }),
  activa: z.boolean().default(true),
  tipoOrganizacionId: z.string().min(1, 'El tipo de organización es requerido'),
  miembros: z
    .array(
      z.object({
        imputadoId: z.string().min(1, 'El imputado es requerido'),
        rol: z.string().optional(),
        orden: z.number().int().min(0).default(0),
        fechaIngreso: z.date(),
        fechaSalida: z.date().optional().nullable()
      })
    )
    .optional()
});
