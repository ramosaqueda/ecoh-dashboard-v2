// app/api/reportes/causas-relacionadas/route.ts - CORREGIDA
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(req: NextRequest) {
  try {
   

 

    
    const searchParams = req.nextUrl.searchParams;
    const formato = searchParams.get('formato') || 'detallado';
    const tipoRelacion = searchParams.get('tipo_relacion');
    const fechaDesde = searchParams.get('fecha_desde');
    const fechaHasta = searchParams.get('fecha_hasta');

    console.log('📊 Parámetros:', { formato, tipoRelacion, fechaDesde, fechaHasta });

    // Construir filtros WHERE
    const whereClause: any = {};
    
    if (tipoRelacion) {
      whereClause.tipoRelacion = tipoRelacion;
    }
    
    if (fechaDesde || fechaHasta) {
      whereClause.fechaRelacion = {};
      if (fechaDesde) {
        whereClause.fechaRelacion.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        whereClause.fechaRelacion.lte = new Date(fechaHasta);
      }
    }

    console.log('🔍 Filtros aplicados:', whereClause);

    if (formato === 'resumen') {
      console.log('📊 Generando formato RESUMEN...');
      
      try {
        // 🔥 USAR SOLO PRISMA ORM (no SQL raw)
        
        // 1. Total de relaciones
        console.log('📈 Contando total de relaciones...');
        const totalRelaciones = await prisma.causasRelacionadas.count({ 
          where: whereClause 
        });
        console.log('✅ Total relaciones:', totalRelaciones);

        // 2. Obtener todas las relaciones para análisis
        console.log('📈 Obteniendo todas las relaciones...');
        const todasLasRelaciones = await prisma.causasRelacionadas.findMany({
          where: whereClause,
          select: {
            causaMadreId: true,
            causaAristaId: true,
            tipoRelacion: true
          }
        });
        console.log('✅ Relaciones obtenidas:', todasLasRelaciones.length);

        // 3. Procesar datos en JavaScript
        const causasUnicas = new Set();
        const causasMadre = new Set();
        const causasArista = new Set();
        const conteoTipos: Record<string, number> = {};

        todasLasRelaciones.forEach(rel => {
          // Causas únicas
          causasUnicas.add(rel.causaMadreId);
          causasUnicas.add(rel.causaAristaId);
          
          // Causas madre
          causasMadre.add(rel.causaMadreId);
          
          // Causas arista
          causasArista.add(rel.causaAristaId);
          
          // Contar tipos
          if (rel.tipoRelacion) {
            conteoTipos[rel.tipoRelacion] = (conteoTipos[rel.tipoRelacion] || 0) + 1;
          }
        });

        // 4. Top causas madre (necesitamos más info)
        console.log('📈 Obteniendo top causas madre...');
        const causasMadreConteo: Record<number, number> = {};
        todasLasRelaciones.forEach(rel => {
          causasMadreConteo[rel.causaMadreId] = (causasMadreConteo[rel.causaMadreId] || 0) + 1;
        });

        // Obtener top 5 causas madre
        const topCausasMadreIds = Object.entries(causasMadreConteo)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([id]) => parseInt(id));
           let topCausasMadre: Array<{
              id: number;
              ruc: string | null;
              denominacionCausa: string;
              totalRelaciones: number;
            }> = [];
        if (topCausasMadreIds.length > 0) {
          const causasInfo = await prisma.causa.findMany({
            where: { id: { in: topCausasMadreIds } },
            select: { 
              id: true, 
              ruc: true, 
              denominacionCausa: true  // ✅ Campo correcto
            }
          });

          topCausasMadre = causasInfo.map(causa => ({
            ...causa,
            totalRelaciones: causasMadreConteo[causa.id]
          }));
        }

        // 5. Tipos de relación más comunes
        const tiposRelacionMasComunes = Object.entries(conteoTipos)
          .map(([tipo, count]) => ({
            tipoRelacion: tipo,
            _count: { tipoRelacion: count }
          }))
          .sort((a, b) => b._count.tipoRelacion - a._count.tipoRelacion);

        const resumen = {
          totalCausasConRelaciones: causasUnicas.size,
          totalRelaciones: totalRelaciones,
          causasMadre: causasMadre.size,
          causasArista: causasArista.size,
          topCausasMadre: topCausasMadre,
          tiposRelacionMasComunes: tiposRelacionMasComunes
        };

        console.log('✅ Resumen generado:', resumen);
        return NextResponse.json({ resumen });

      } catch (error) {
        console.error('❌ Error en resumen:', error);
        return NextResponse.json(
          { 
            error: 'Error al generar resumen', 
            details: error instanceof Error ? error.message : 'Error desconocido' 
          },
          { status: 500 }
        );
      }
    }

    // 📋 FORMATO DETALLADO
    console.log('📋 Generando formato DETALLADO...');
    
    try {
      // Obtener todas las relaciones con includes
      const todasLasRelaciones = await prisma.causasRelacionadas.findMany({
        where: whereClause,
        include: {
          causaMadre: {
            select: {
              id: true,
              ruc: true,
              denominacionCausa: true  // ✅ Campo correcto
              // ❌ Removido 'estado' - no existe en el modelo Causa
            }
          },
          causaArista: {
            select: {
              id: true,
              ruc: true,
              denominacionCausa: true  // ✅ Campo correcto
              // ❌ Removido 'estado' - no existe en el modelo Causa
            }
          }
        },
        orderBy: { fechaRelacion: 'desc' }
      });

      console.log('✅ Relaciones detalladas obtenidas:', todasLasRelaciones.length);

      // Agrupar relaciones por causa
      const causasMap = new Map();

      todasLasRelaciones.forEach(relacion => {
        // Procesar causa madre
        const causaMadre = relacion.causaMadre;
        if (!causasMap.has(causaMadre.id)) {
          causasMap.set(causaMadre.id, {
            id: causaMadre.id,
            ruc: causaMadre.ruc,
            denominacionCausa: causaMadre.denominacionCausa,  // ✅ Campo correcto
            comoCausaMadre: { total: 0, relaciones: [] },
            comoCausaHija: { total: 0, relaciones: [] },
            totales: { relacionesTotales: 0, comoMadre: 0, comoHija: 0 }
          });
        }

        const causaMadreData = causasMap.get(causaMadre.id);
        causaMadreData.comoCausaMadre.relaciones.push({
          id: relacion.id,
          causaHija: {
            id: relacion.causaArista.id,
            ruc: relacion.causaArista.ruc,
            denominacionCausa: relacion.causaArista.denominacionCausa  // ✅ Campo correcto
          },
          tipoRelacion: relacion.tipoRelacion,
          fechaRelacion: relacion.fechaRelacion,
          observacion: relacion.observacion
        });

        // Procesar causa arista (hija)
        const causaArista = relacion.causaArista;
        if (!causasMap.has(causaArista.id)) {
          causasMap.set(causaArista.id, {
            id: causaArista.id,
            ruc: causaArista.ruc,
            denominacionCausa: causaArista.denominacionCausa,  // ✅ Campo correcto
            comoCausaMadre: { total: 0, relaciones: [] },
            comoCausaHija: { total: 0, relaciones: [] },
            totales: { relacionesTotales: 0, comoMadre: 0, comoHija: 0 }
          });
        }

        const causaAristaData = causasMap.get(causaArista.id);
        causaAristaData.comoCausaHija.relaciones.push({
          id: relacion.id,
          causaMadre: {
            id: relacion.causaMadre.id,
            ruc: relacion.causaMadre.ruc,
            denominacionCausa: relacion.causaMadre.denominacionCausa  // ✅ Campo correcto
          },
          tipoRelacion: relacion.tipoRelacion,
          fechaRelacion: relacion.fechaRelacion,
          observacion: relacion.observacion
        });
      });

      // Calcular totales
      const causasFormateadas = Array.from(causasMap.values()).map(causa => {
        causa.comoCausaMadre.total = causa.comoCausaMadre.relaciones.length;
        causa.comoCausaHija.total = causa.comoCausaHija.relaciones.length;
        causa.totales = {
          relacionesTotales: causa.comoCausaMadre.total + causa.comoCausaHija.total,
          comoMadre: causa.comoCausaMadre.total,
          comoHija: causa.comoCausaHija.total
        };
        return causa;
      }).sort((a, b) => (a.ruc || '').localeCompare(b.ruc || ''));  // ✅ Manejo de valores null

      // Estadísticas generales
      const estadisticas = {
        totalCausas: causasFormateadas.length,
        totalRelaciones: todasLasRelaciones.length,
        causaConMasRelaciones: causasFormateadas.reduce((max, causa) => 
          causa.totales.relacionesTotales > (max?.totales?.relacionesTotales || 0) ? causa : max, 
          null
        )
      };

      console.log('✅ Detallado generado');
      return NextResponse.json({
        estadisticas,
        causas: causasFormateadas,
        filtros: {
          tipoRelacion,
          fechaDesde,
          fechaHasta,
          formato
        }
      });

    } catch (error) {
      console.error('❌ Error en detallado:', error);
      return NextResponse.json(
        { 
          error: 'Error al generar reporte detallado', 
          details: error instanceof Error ? error.message : 'Error desconocido' 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Error general en reporte:', error);
    return NextResponse.json(
      { 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// OPTIONS para obtener tipos de relación
export async function OPTIONS(req: NextRequest) {
  try {
    console.log('🔍 OPTIONS llamado para tipos de relación');
    
    const tiposRelacion = await prisma.causasRelacionadas.findMany({
      select: { tipoRelacion: true },
      distinct: ['tipoRelacion'],
      where: {
          AND: [
            { tipoRelacion: { not: null } },
            { tipoRelacion: { not: '' } }
          ]
        }
    });

    console.log('📊 Tipos encontrados:', tiposRelacion);

    const tipos = tiposRelacion
      .map(t => t.tipoRelacion)
      .filter(tipo => tipo && tipo.trim().length > 0);

    const response = {
      tiposRelacion: tipos
    };

    console.log('📤 Respuesta OPTIONS:', response);

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('❌ Error en OPTIONS:', error);
    
    return NextResponse.json(
      { 
        message: 'Error al obtener tipos de relación',
        tiposRelacion: [] 
      },
      { status: 500 }
    );
  }
}