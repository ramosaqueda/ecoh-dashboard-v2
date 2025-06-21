import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// Crear una nueva asociación entre causa y organización
export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Validar datos requeridos
    if (!data.organizacionId || !data.causaId) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: organizacionId y causaId son obligatorios' },
        { status: 400 }
      );
    }

    // Verificar si la asociación ya existe
    const existingRelation = await prisma.causaOrganizacion.findFirst({
      where: {
        organizacionId: data.organizacionId,
        causaId: data.causaId
      }
    });

    if (existingRelation) {
      return NextResponse.json(
        { error: 'Esta causa ya está asociada a la organización' },
        { status: 400 }
      );
    }

    // Verificar que la organización existe
    const organizacion = await prisma.organizacionDelictual.findUnique({
      where: { id: data.organizacionId }
    });

    if (!organizacion) {
      return NextResponse.json(
        { error: 'La organización especificada no existe' },
        { status: 404 }
      );
    }

    // Verificar que la causa existe
    const causa = await prisma.causa.findUnique({
      where: { id: data.causaId }
    });

    if (!causa) {
      return NextResponse.json(
        { error: 'La causa especificada no existe' },
        { status: 404 }
      );
    }

    // Crear nueva relación
    const newRelation = await prisma.causaOrganizacion.create({
      data: {
        organizacionId: data.organizacionId,
        causaId: data.causaId,
        fechaAsociacion: data.fechaAsociacion ? new Date(data.fechaAsociacion) : new Date(),
        observacion: data.observacion
      }
    });

    return NextResponse.json(newRelation);
  } catch (error) {
    console.error('Error al guardar relación causa-organización:', error);
    return NextResponse.json(
      { error: 'Error al guardar relación causa-organización' },
      { status: 500 }
    );
  }
}