// app/api/organizacion/[id]/miembros/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema mejorado con coerción de tipos
const MiembroSchema = z.object({
  imputadoId: z.coerce.number().int().positive(), // Convierte string a number automáticamente
  rol: z.string().optional(),
  fechaIngreso: z.string().refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }, "Fecha de ingreso debe ser una fecha válida"),
  fechaSalida: z.union([
    z.string().refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, "Fecha de salida debe ser una fecha válida"),
    z.null(),
    z.literal("") // Para manejar strings vacíos como null
  ]).optional().nullable(),
  activo: z.coerce.boolean().default(true) // Convierte string a boolean
}).transform((data) => ({
  ...data,
  fechaIngreso: new Date(data.fechaIngreso),
  fechaSalida: data.fechaSalida && data.fechaSalida !== "" ? new Date(data.fechaSalida) : null
}));

// Schema más tolerante para debugging
const MiembroSchemaDebug = z.object({
  imputadoId: z.any(), // Aceptamos cualquier cosa inicialmente
  rol: z.any().optional(),
  fechaIngreso: z.any(),
  fechaSalida: z.any().optional().nullable(),
  activo: z.any().optional()
});

// Schema para actualizar (PUT) - array de miembros
const MiembrosArraySchema = z.array(MiembroSchema);

// GET: Obtener todos los miembros de una organización
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organizacionId = parseInt((await params).id);

    if (isNaN(organizacionId)) {
      return NextResponse.json(
        { error: 'ID de organización inválido' },
        { status: 400 }
      );
    }

    // Verificar si la organización existe
    const organizacion = await prisma.organizacionDelictual.findUnique({
      where: { id: organizacionId }
    });

    if (!organizacion) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      );
    }

    const miembros = await prisma.miembrosOrganizacion.findMany({
      where: {
        organizacionId: organizacionId
      },
      include: {
        imputado: {
          select: {
            id: true,
            nombreSujeto: true,  // ← Corregido: era 'nombre'
            docId: true,         // ← Corregido: era 'rut'
            alias: true,         // ← Campo disponible
            // Agregar otros campos que necesites
          }
        }
      },
      orderBy: {
        fechaIngreso: 'desc'
      }
    });

    return NextResponse.json(miembros);
  } catch (error) {
    console.error('Error en GET miembros:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST: Añadir un nuevo miembro a la organización
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let body: any; // Declarar aquí para que esté disponible en el catch
  
  try {
    const organizacionId = parseInt((await params).id);
    
    if (isNaN(organizacionId)) {
      return NextResponse.json(
        { error: 'ID de organización inválido' },
        { status: 400 }
      );
    }

    body = await req.json();
    
    // Log detallado para debugging
    console.log('=== DEBUGGING POST MIEMBRO ===');
    console.log('organizacionId:', organizacionId);
    console.log('Datos recibidos completos:', JSON.stringify(body, null, 2));
    console.log('Tipos de datos recibidos:');
    Object.entries(body).forEach(([key, value]) => {
      console.log(`  ${key}: ${typeof value} = ${value}`);
    });
    
    // Validación paso a paso para identificar el problema
    try {
      // Primero probamos con el schema debug
      console.log('Probando schema debug...');
      const debugData = MiembroSchemaDebug.parse(body);
      console.log('Schema debug exitoso:', debugData);
      
      // Validación manual paso a paso
      console.log('=== VALIDACIÓN PASO A PASO ===');
      
      // 1. Verificar imputadoId
      console.log('Validando imputadoId...');
      const imputadoId = z.coerce.number().int().positive().safeParse(body.imputadoId);
      console.log('imputadoId resultado:', imputadoId);
      
      // 2. Verificar rol
      console.log('Validando rol...');
      const rol = z.string().optional().safeParse(body.rol);
      console.log('rol resultado:', rol);
      
      // 3. Verificar fechaIngreso
      console.log('Validando fechaIngreso...');
      const fechaIngreso = z.string().safeParse(body.fechaIngreso);
      console.log('fechaIngreso resultado:', fechaIngreso);
      
      // 4. Verificar fechaSalida
      console.log('Validando fechaSalida...');
      const fechaSalida = z.union([z.string(), z.null(), z.literal(""), z.undefined()]).optional().nullable().safeParse(body.fechaSalida);
      console.log('fechaSalida resultado:', fechaSalida);
      
      // 5. Verificar activo
      console.log('Validando activo...');
      const activo = z.coerce.boolean().default(true).safeParse(body.activo);
      console.log('activo resultado:', activo);
      
      // Ahora intentamos el schema completo
      console.log('Intentando validación completa...');
      const validatedData = MiembroSchema.parse(body);
      console.log('Datos validados exitosamente:', validatedData);
    } catch (validationError) {
      console.log('=== ERROR DE VALIDACIÓN ===');
      console.log('Error completo:', validationError);
      if (validationError instanceof z.ZodError) {
        console.log('Errores de Zod:', JSON.stringify(validationError.errors, null, 2));
        validationError.errors.forEach((error, index) => {
          console.log(`Error ${index + 1}:`);
          console.log(`  Path: ${error.path.join('.')}`);
          console.log(`  Message: ${error.message}`);
          console.log(`  Code: ${error.code}`);
          // console.log(`  Received: ${error.received}`); // 'received' does not exist on ZodIssue
          // console.log(`  Expected: ${error.expected}`); // 'expected' does not exist on ZodIssue
        });
      }
      // Re-lanzar el error para que sea manejado por el catch principal
      throw validationError;
    }
    
    const validatedData = MiembroSchema.parse(body);

    // Verificar si la organización existe
    const organizacion = await prisma.organizacionDelictual.findUnique({
      where: { id: organizacionId }
    });

    if (!organizacion) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      );
    }

    // Verificar si el imputado existe
    const imputado = await prisma.imputado.findUnique({
      where: { id: validatedData.imputadoId }
    });

    if (!imputado) {
      return NextResponse.json(
        { error: 'Imputado no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si ya existe un miembro activo con este imputado
    const miembroExistente = await prisma.miembrosOrganizacion.findFirst({
      where: {
        organizacionId,
        imputadoId: validatedData.imputadoId,
        activo: true
      }
    });

    if (miembroExistente) {
      return NextResponse.json(
        { error: 'Este imputado ya es miembro activo de la organización' },
        { status: 400 }
      );
    }

    const miembro = await prisma.miembrosOrganizacion.create({
      data: {
        imputadoId: validatedData.imputadoId,
        organizacionId,
        rol: validatedData.rol,
        fechaIngreso: validatedData.fechaIngreso,
        fechaSalida: validatedData.fechaSalida,
        activo: validatedData.activo
      },
      include: {
        imputado: {
          select: {
            id: true,
            nombreSujeto: true,  // ← Corregido: era 'nombre'
            docId: true,         // ← Corregido: era 'rut'
            alias: true,         // ← Agregado campo disponible
            // apellido no existe en este modelo
          }
        }
      }
    });

    return NextResponse.json(miembro, { status: 201 });
  } catch (error) {
    console.error('=== ERROR COMPLETO EN POST MIEMBROS ===');
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
    
    if (error instanceof z.ZodError) {
      // Formatear errores de validación de manera más legible
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.') || 'root',
        message: err.message,
        code: err.code
        // received: err.received, // 'received' does not exist on ZodIssue
      }));
      
      console.error('Errores de validación formateados:', formattedErrors);
      
      return NextResponse.json(
        { 
          error: 'Datos inválidos', 
          details: formattedErrors,
          receivedData: body || 'No disponible', // Para debugging
          message: 'Por favor revisa los datos enviados. Detalles del error en la consola del servidor.'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// PUT: Actualizar todos los miembros de la organización
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organizacionId = parseInt((await params).id);
    
    if (isNaN(organizacionId)) {
      return NextResponse.json(
        { error: 'ID de organización inválido' },
        { status: 400 }
      );
    }

    const body = await req.json();
    
    console.log('Datos recibidos para PUT:', body);
    
    // Validar el array de miembros
    const miembros = MiembrosArraySchema.parse(body);

    // Verificar si la organización existe
    const organizacion = await prisma.organizacionDelictual.findUnique({
      where: { id: organizacionId }
    });

    if (!organizacion) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que todos los imputados existen
    const imputadoIds = miembros.map(m => m.imputadoId);
    const imputadosExistentes = await prisma.imputado.findMany({
      where: { id: { in: imputadoIds } },
      select: { id: true }
    });

    const idsExistentes = imputadosExistentes.map(i => i.id);
    const idsNoEncontrados = imputadoIds.filter(id => !idsExistentes.includes(id));

    if (idsNoEncontrados.length > 0) {
      return NextResponse.json(
        { error: `Imputados no encontrados: ${idsNoEncontrados.join(', ')}` },
        { status: 404 }
      );
    }

    // Usar una transacción para asegurar la integridad de los datos
    const result = await prisma.$transaction(async (tx) => {
      // 1. Eliminar miembros existentes
      await tx.miembrosOrganizacion.deleteMany({
        where: { organizacionId }
      });

      // 2. Crear los nuevos miembros
      const createdMiembros = await Promise.all(
        miembros.map((miembro) =>
          tx.miembrosOrganizacion.create({
            data: {
              imputadoId: miembro.imputadoId,
              organizacionId,
              rol: miembro.rol,
              fechaIngreso: miembro.fechaIngreso,
              fechaSalida: miembro.fechaSalida,
              activo: miembro.activo
            },
            include: {
              imputado: {
                select: {
                  id: true,
                  nombreSujeto: true,  // ← Corregido: era 'nombre'
                  docId: true,         // ← Corregido: era 'rut'
                  alias: true,         // ← Campo disponible
                }
              }
            }
          })
        )
      );

      return createdMiembros;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error en PUT miembros:', error);
    
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return NextResponse.json(
        { 
          error: 'Datos inválidos', 
          details: formattedErrors
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar un miembro específico (endpoint adicional útil)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organizacionId = parseInt((await params).id);
    const { searchParams } = new URL(req.url);
    const miembroId = searchParams.get('miembroId');

    if (isNaN(organizacionId)) {
      return NextResponse.json(
        { error: 'ID de organización inválido' },
        { status: 400 }
      );
    }

    if (!miembroId) {
      return NextResponse.json(
        { error: 'ID de miembro requerido' },
        { status: 400 }
      );
    }

    const deleted = await prisma.miembrosOrganizacion.delete({
      where: {
        id: parseInt(miembroId),
        organizacionId // Asegurar que el miembro pertenece a esta organización
      }
    });

    return NextResponse.json({ message: 'Miembro eliminado correctamente' });
  } catch (error) {
    console.error('Error en DELETE miembro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}