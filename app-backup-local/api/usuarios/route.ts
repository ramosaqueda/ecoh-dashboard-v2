// app/api/usuarios/route.ts
// NUEVO endpoint para complementar tu /api/usuarios/roles existente
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rolesParam = searchParams.get('roles');

    let whereClause = {};

    // Si se especifican roles, filtrar por ellos (ej: ?roles=2,3,4)
    if (rolesParam) {
      const roleIds = rolesParam.split(',').map(id => parseInt(id.trim()));
      whereClause = {
        rolId: {
          in: roleIds
        }
      };
    }

    // Obtener usuarios con sus roles
    const usuarios = await prisma.usuario.findMany({
      where: whereClause,
      include: {
        rol: {
          select: {
            id: true,
            nombre: true
          }
        }
      },
      orderBy: [
        { nombre: 'asc' },
        { email: 'asc' }
      ]
    });

    // Formatear respuesta sin datos sensibles
    const usuariosFormatted = usuarios.map(usuario => ({
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol
    }));

    return NextResponse.json(usuariosFormatted);

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}