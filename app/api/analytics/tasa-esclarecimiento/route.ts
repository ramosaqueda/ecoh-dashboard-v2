import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Obtener parámetros de la consulta
    const yearParam = req.nextUrl.searchParams.get('year');
    const tipoDelito = req.nextUrl.searchParams.get('tipoDelito');
    const homicidioConsumado = req.nextUrl.searchParams.get('homicidioConsumado') === 'true';
    const origenCausaId = req.nextUrl.searchParams.get('origenCausaId'); // ✨ NUEVO: Filtro opcional por origen

    // ✅ Definir las condiciones base de la consulta
    const whereConditions: any = {};

    // ✅ Filtrar por año si no es "todos"
    if (yearParam && yearParam !== 'todos') {
      const year = parseInt(yearParam);
      
      if (isNaN(year)) {
        return NextResponse.json(
          { error: 'El parámetro year debe ser un número válido' },
          { status: 400 }
        );
      }
      
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

      whereConditions.fechaDelHecho = {
        gte: startDate,
        lte: endDate
      };
    }

    // ✨ NUEVO: Filtro opcional por origen de causa
    // Si no se especifica, calcula para TODAS las causas
    if (origenCausaId && origenCausaId !== 'todos') {
      whereConditions.origenCausaId = parseInt(origenCausaId);
    }
    
    // ✅ Filtrar por tipo de delito si se especifica
    if (tipoDelito && tipoDelito !== 'todos') {
      whereConditions.delitoId = parseInt(tipoDelito);
    }
    
    // ✅ Filtrar solo homicidios consumados si se activa el switch
    if (homicidioConsumado) {
      whereConditions.homicidioConsumado = true;
    }

    // ✅ Contar total de causas con estos filtros
    const totalCausas = await prisma.causa.count({
      where: whereConditions
    });

    // ✅ Obtener causas con imputados para análisis de esclarecimiento
    const causasImputados = await prisma.causa.findMany({
      where: whereConditions,
      include: {
        imputados: {
          include: {
            cautelar: true,
            imputado: true
          }
        },
        origenCausa: { // ✨ Incluir origen para información adicional
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    // ✅ Analizar los datos para el esclarecimiento
    const causasFormalizadasSet = new Set();
    const causasConCautelarSet = new Set();
    const causasAmbasSituacionesSet = new Set();
    const causasEsclarecidasSet = new Set();

    causasImputados.forEach((causa) => {
      const tieneFormalizados = causa.imputados.some(imp => imp.formalizado);
      const tieneCautelar = causa.imputados.some(imp => imp.cautelarId !== null);

      if (tieneFormalizados) {
        causasFormalizadasSet.add(causa.id);
      }

      if (tieneCautelar) {
        causasConCautelarSet.add(causa.id);
      }

      if (tieneFormalizados && tieneCautelar) {
        causasAmbasSituacionesSet.add(causa.id);
      }

      // ✅ Causa esclarecida: tiene formalizados O tiene cautelares
      if (tieneFormalizados || tieneCautelar) {
        causasEsclarecidasSet.add(causa.id);
      }
    });

    // ✅ Calcular porcentaje
    const porcentaje = totalCausas > 0 
      ? (causasEsclarecidasSet.size / totalCausas) * 100 
      : 0;

    // ✨ NUEVO: Información de origen aplicado (si hay)
    const filtroAplicado: any = {
      year: yearParam || 'todos',
      tipoDelito: tipoDelito || 'todos',
      homicidioConsumado,
      origenCausa: origenCausaId || 'todos'
    };

    return NextResponse.json({
      totalCausas,
      causasEsclarecidas: causasEsclarecidasSet.size,
      porcentaje,
      detalles: {
        causasFormalizadas: causasFormalizadasSet.size,
        causasConCautelar: causasConCautelarSet.size,
        causasAmbasSituaciones: causasAmbasSituacionesSet.size
      },
      filtros: filtroAplicado // ✨ Información de qué filtros se aplicaron
    });
  } catch (error) {
    console.error('Error fetching tasa esclarecimiento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}