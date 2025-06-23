// app/api/correlativos/historial/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

 
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const tipoActividadId = searchParams.get('tipoActividadId');
    const año = searchParams.get('año'); // Opcional: filtrar por año específico

    // Filtro por año (por defecto año actual)
    const targetYear = año ? parseInt(año) : new Date().getFullYear();
    
    const whereClause: any = {
      createdAt: {
        gte: new Date(`${targetYear}-01-01`),
        lt: new Date(`${targetYear + 1}-01-01`)
      },
      ...(tipoActividadId && { tipoActividad: parseInt(tipoActividadId) })
    };

    const [correlativos, total] = await Promise.all([
      prisma.correlativoTipoActividad.findMany({
        where: whereClause,
        orderBy: [
          { createdAt: 'desc' },
          { numero: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.correlativoTipoActividad.count({
        where: whereClause,
      }),
    ]);

    // Obtener información adicional manualmente para mayor control
    const correlativosConInfo = await Promise.all(
      correlativos.map(async (correlativo) => {
        // Obtener tipo de actividad
        const tipoActividad = await prisma.tipoActividad.findUnique({
          where: { id: correlativo.tipoActividad },
          select: { 
            nombre: true,
            siglainf: true 
          }
        });

        // Obtener usuario
        let usuario = null;
        if (correlativo.usuario) {
          try {
            // Buscar en la tabla de usuarios
            const userQuery = await prisma.$queryRaw`
              SELECT email, nombre FROM usuarios WHERE id = ${correlativo.usuario} LIMIT 1
            `;
            
            if (Array.isArray(userQuery) && userQuery.length > 0) {
              usuario = userQuery[0] as { email: string; nombre?: string };
            }
          } catch (error) {
            console.log('No se pudo obtener información del usuario:', error);
          }
        }

        return {
          id: correlativo.id,
          numero: correlativo.numero,
          sigla: correlativo.sigla,
          tipoActividadRelation: {
            nombre: tipoActividad?.nombre || 'Tipo no encontrado',
            siglainf: tipoActividad?.siglainf || correlativo.sigla || 'ACT'
          },
          usuarioRelation: {
            email: usuario?.email || 'usuario@sistema.com',
            nombre: usuario?.nombre || null
          },
          createdAt: correlativo.createdAt?.toISOString() || new Date().toISOString(),
          correlativoCompleto: `${correlativo.sigla}-${String(correlativo.numero).padStart(3, '0')}`
        };
      })
    );

    const hasMore = page * limit < total;

    return NextResponse.json({
      data: correlativosConInfo,
      metadata: {
        total,
        page,
        limit,
        hasMore,
        año: targetYear,
      },
    });

  } catch (error) {
    console.error('Error al obtener historial de correlativos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}