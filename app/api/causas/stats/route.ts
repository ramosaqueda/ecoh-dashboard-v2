import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

/**
 * GET /api/causas/stats
 * Retorna estadísticas de causas del sistema
 * 
 * Respuesta:
 * {
 *   total: number,
 *   activas: number,
 *   cerradas: number
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    console.log('📊 [API /causas/stats] Calculando estadísticas de causas...');

    // Contar total de causas
    const total = await prisma.causa.count();

    // Obtener todos los estados para clasificar correctamente
    const estadosActivos = await prisma.estadoCausa.findMany({
      where: {
        codigo: 'INICIO_INV'
      },
      select: { id: true }
    });

    const estadosCerrados = await prisma.estadoCausa.findMany({
      where: {
        codigo: {
          in: ['INV_CERRADA', 'CERR_SENTENCIA', 'CERR_OTRAS']
        }
      },
      select: { id: true }
    });

    // Contar causas activas
    let activas = 0;
    if (estadosActivos.length > 0) {
      activas = await prisma.causa.count({
        where: {
          estadoCausaId: {
            in: estadosActivos.map(e => e.id)
          }
        }
      });
    }

    // Contar causas cerradas
    let cerradas = 0;
    if (estadosCerrados.length > 0) {
      cerradas = await prisma.causa.count({
        where: {
          estadoCausaId: {
            in: estadosCerrados.map(e => e.id)
          }
        }
      });
    }

    // Calcular causas sin estado
    const sinEstado = total - activas - cerradas;

    const stats = {
      total,
      activas,
      cerradas
    };

    console.log('✅ [API /causas/stats] Estadísticas calculadas:', {
      ...stats,
      sinEstado // Log adicional para debug
    });

    return NextResponse.json(stats);

  } catch (error) {
    console.error('❌ [API /causas/stats] Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Error al obtener estadísticas de causas',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}