import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

 
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    console.log('userId:', userId);

   
    if (!userId) {
    
      return NextResponse.json({ data: [] });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { clerk_id: userId }
    });

    if (!usuario) {
      return NextResponse.json({ data: [] });
    }
    console.log('usuario encontrado:', usuario);
    const actividades = await prisma.actividad.findMany({
      where: { usuario_id: usuario.id },
      include: {
        causa: true,
        tipoActividad: true,
        usuario: {
          select: {
            email: true
          }
        }
      }
    });
    console.log('actividades encontradas:', actividades.length);
    // Devolver en el mismo formato que el endpoint principal
    return NextResponse.json({ data: actividades });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}