// app/api/correlativos/route.ts
import { NextRequest, NextResponse } from 'next/server';
 
import { prisma } from '@/lib/prisma';
 
// Obtener correlativo actual por tipo de actividad
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipoActividadId = searchParams.get('tipoActividadId');

    if (!tipoActividadId) {
      return NextResponse.json(
        { error: 'tipoActividadId es requerido' },
        { status: 400 }
      );
    }

    const currentYear = new Date().getFullYear();

    // Buscar el correlativo más alto para este tipo y año actual
    const correlativo = await prisma.correlativoTipoActividad.findFirst({
      where: {
        tipoActividad: parseInt(tipoActividadId),
        createdAt: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`)
        }
      },
      orderBy: {
        numero: 'desc',
      },
    });

    // Obtener información del tipo de actividad
    const tipoActividad = await prisma.tipoActividad.findUnique({
      where: {
        id: parseInt(tipoActividadId),
      },
      select: {
        nombre: true,
        siglainf: true,
      },
    });

    if (!tipoActividad) {
      return NextResponse.json(
        { error: 'Tipo de actividad no encontrado' },
        { status: 404 }
      );
    }

    if (!tipoActividad.siglainf) {
      return NextResponse.json(
        { error: 'El tipo de actividad no tiene sigla de informe configurada' },
        { status: 400 }
      );
    }

    const numeroActual = correlativo?.numero || 0;
    const siguienteNumero = numeroActual + 1;

    return NextResponse.json({
      numeroActual,
      siguienteNumero,
      sigla: tipoActividad.siglainf,
      correlativoCompleto: `${tipoActividad.siglainf}-${String(siguienteNumero).padStart(3, '0')}`,
      año: currentYear,
    });

  } catch (error) {
    console.error('Error al obtener correlativo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Incrementar correlativo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipoActividadId, usuarioId } = body;

    if (!tipoActividadId || !usuarioId) {
      return NextResponse.json(
        { error: 'tipoActividadId y usuarioId son requeridos' },
        { status: 400 }
      );
    }

    const currentYear = new Date().getFullYear();

    // Obtener el número actual para este año
    const correlativoActual = await prisma.correlativoTipoActividad.findFirst({
      where: {
        tipoActividad: parseInt(tipoActividadId),
        createdAt: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`)
        }
      },
      orderBy: {
        numero: 'desc',
      },
    });

    const nuevoNumero = (correlativoActual?.numero || 0) + 1;

    // Obtener la sigla del tipo de actividad
    const tipoActividad = await prisma.tipoActividad.findUnique({
      where: {
        id: parseInt(tipoActividadId),
      },
      select: {
        siglainf: true,
        nombre: true,
      },
    });

    if (!tipoActividad) {
      return NextResponse.json(
        { error: 'Tipo de actividad no encontrado' },
        { status: 404 }
      );
    }

    if (!tipoActividad.siglainf) {
      return NextResponse.json(
        { error: 'El tipo de actividad no tiene sigla de informe configurada' },
        { status: 400 }
      );
    }

    // Crear el nuevo correlativo
    const nuevoCorrelativo = await prisma.correlativoTipoActividad.create({
      data: {
        numero: nuevoNumero,
        sigla: tipoActividad.siglainf,
        tipoActividad: parseInt(tipoActividadId),
        usuario: parseInt(usuarioId),
      },
    });

    const correlativoCompleto = `${tipoActividad.siglainf}-${String(nuevoNumero).padStart(3, '0')}`;

    return NextResponse.json({
      id: nuevoCorrelativo.id,
      numero: nuevoNumero,
      sigla: tipoActividad.siglainf,
      correlativoCompleto,
      año: currentYear,
      fechaGeneracion: nuevoCorrelativo.createdAt,
      mensaje: 'Correlativo generado exitosamente',
    });

  } catch (error) {
    console.error('Error al generar correlativo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}