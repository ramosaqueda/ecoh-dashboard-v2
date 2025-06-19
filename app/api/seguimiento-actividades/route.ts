// src/app/api/seguimiento-actividades/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    const usuarioId = searchParams.get('usuarioId');
    const tipoActividadId = searchParams.get('tipoActividadId');
    const ruc = searchParams.get('ruc');
    
    // Construir condiciones de filtrado
    const whereConditions: any = {};
    
    if (fechaInicio && fechaFin) {
      whereConditions.fechaInicio = {
        gte: new Date(fechaInicio),
      };
      whereConditions.fechaTermino = {
        lte: new Date(fechaFin),
      };
    }
    
    if (usuarioId && usuarioId !== 'all') {
      whereConditions.usuario_id = parseInt(usuarioId);
    }
    
    if (tipoActividadId && tipoActividadId !== 'all') {
      whereConditions.tipo_actividad_id = parseInt(tipoActividadId);
    }
    
    if (ruc && ruc.trim() !== '') {
      // Buscar la causa por RUC y luego filtrar actividades
      whereConditions.causa = {
        ruc: {
          contains: ruc,
        },
      };
    }
    
    // 1. Obtener actividades según los filtros
    const actividades = await prisma.actividad.findMany({
      where: whereConditions,
      include: {
        causa: {
          select: {
            id: true,
            ruc: true,
            denominacionCausa: true,
            delito: {
              select: {
                nombre: true,
              },
            },
          },
        },
        tipoActividad: {
          select: {
            id: true,
            nombre: true,
            area: {
              select: {
                nombre: true,
              },
            },
          },
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            cargo: true,
          },
        },
      },
      orderBy: {
        fechaTermino: 'asc',
      },
    });
    
    // 2. Agrupar actividades por causa
    const actividadesPorCausa: Record<number, typeof actividades> = {};
    
    for (const actividad of actividades) {
      const causaId = actividad.causa_id;
      if (!actividadesPorCausa[causaId]) {
        actividadesPorCausa[causaId] = [];
      }
      actividadesPorCausa[causaId].push(actividad);
    }
    
    // 3. Obtener todos los IDs de causas
    const causasIds = Object.keys(actividadesPorCausa).map(id => parseInt(id));
    
    // 4. Calcular estadísticas por causa
    const estadosPorCausa: Record<number, { 
      total: number, 
      iniciadas: number, 
      enProceso: number, 
      terminadas: number,
      porcentajeCompletado: number
    }> = {};
    
    for (const [causaIdStr, actividadesDeCausa] of Object.entries(actividadesPorCausa)) {
      const causaId = parseInt(causaIdStr);
      const total = actividadesDeCausa.length;
      const iniciadas = actividadesDeCausa.filter(a => a.estado === 'inicio').length;
      const enProceso = actividadesDeCausa.filter(a => a.estado === 'en_proceso').length;
      const terminadas = actividadesDeCausa.filter(a => a.estado === 'terminado').length;
      
      estadosPorCausa[causaId] = {
        total,
        iniciadas,
        enProceso,
        terminadas,
        porcentajeCompletado: total > 0 ? (terminadas / total) * 100 : 0
      };
    }
    
    // 5. Obtener tiempo promedio por tipo de actividad
    const tiempoPromedio: Record<number, number> = {};
    const tiempoPromedioConteo: Record<number, number> = {};
    
    for (const actividad of actividades) {
      if (actividad.estado === 'terminado') {
        const tipoId = actividad.tipo_actividad_id;
        const fechaInicio = new Date(actividad.fechaInicio);
        const fechaTermino = new Date(actividad.fechaTermino);
        const diffTime = Math.abs(fechaTermino.getTime() - fechaInicio.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (!tiempoPromedio[tipoId]) {
          tiempoPromedio[tipoId] = 0;
          tiempoPromedioConteo[tipoId] = 0;
        }
        
        tiempoPromedio[tipoId] += diffDays;
        tiempoPromedioConteo[tipoId]++;
      }
    }
    
    // Calcular promedios finales
    const tiemposPromedioFinal: Record<number, number> = {};
    for (const [tipoIdStr, total] of Object.entries(tiempoPromedio)) {
      const tipoId = parseInt(tipoIdStr);
      const conteo = tiempoPromedioConteo[tipoId];
      tiemposPromedioFinal[tipoId] = conteo > 0 ? total / conteo : 0;
    }
    
    // 6. Calcular distribución por usuario
    const distribucionPorUsuario: Record<number, number> = {};
    
    for (const actividad of actividades) {
      const usuarioId = actividad.usuario_id;
      if (!distribucionPorUsuario[usuarioId]) {
        distribucionPorUsuario[usuarioId] = 0;
      }
      distribucionPorUsuario[usuarioId]++;
    }
    
    // 7. Obtener información de usuarios
    //const usuariosIds = [...new Set(actividades.map(a => a.usuario_id))];
    const usuariosIds = Array.from(new Set(actividades.map(a => a.usuario_id)));

    
    const usuarios = await prisma.usuario.findMany({
      where: {
        id: {
          in: usuariosIds,
        },
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        cargo: true,
      },
    });
    
    // 8. Obtener todos los tipos de actividad
    //const tiposActividadIds = [...new Set(actividades.map(a => a.tipo_actividad_id))];
    const tiposActividadIds = Array.from(new Set(actividades.map(a => a.tipo_actividad_id)));
    //const usuariosIds = Array.from(new Set(actividades.map(a => a.usuario_id)));

    
    const tiposActividad = await prisma.tipoActividad.findMany({
      where: {
        id: {
          in: tiposActividadIds
        }
      },
      include: {
        area: {
          select: {
            nombre: true,
          },
        },
      },
    });
    
    // Cargar todos los tipos de actividad para filtros
    const todosTiposActividad = await prisma.tipoActividad.findMany({
      include: {
        area: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });
    
    const todosUsuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        cargo: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });
    
    // 9. Detectar actividades vencidas
    const hoy = new Date();
    
    // Preparar resultados por causa
    const resultados = causasIds.map(causaId => {
      const actividadesDeCausa = actividadesPorCausa[causaId];
      const primerActividad = actividadesDeCausa[0]; // Para obtener info de la causa
      
      // Calcular días promedio de actividades terminadas
      const actividadesTerminadas = actividadesDeCausa.filter(act => act.estado === 'terminado');
      let diasPromedio = 0;
      
      if (actividadesTerminadas.length > 0) {
        const sumaDias = actividadesTerminadas.reduce((sum, act) => {
          const fechaInicio = new Date(act.fechaInicio);
          const fechaTermino = new Date(act.fechaTermino);
          const diffTime = Math.abs(fechaTermino.getTime() - fechaInicio.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return sum + diffDays;
        }, 0);
        
        diasPromedio = sumaDias / actividadesTerminadas.length;
      }
      
      return {
        causaId,
        ruc: primerActividad?.causa.ruc || 'N/A',
        denominacionCausa: primerActividad?.causa.denominacionCausa || 'N/A',
        delito: primerActividad?.causa.delito?.nombre || 'No especificado',
        estadisticas: estadosPorCausa[causaId],
        actividades: actividadesDeCausa.map(act => ({
          id: act.id,
          tipoActividad: act.tipoActividad.nombre,
          area: act.tipoActividad.area.nombre,
          fechaInicio: act.fechaInicio,
          fechaTermino: act.fechaTermino,
          estado: act.estado,
          usuario: act.usuario.nombre,
          observacion: act.observacion || '',
          vencida: new Date(act.fechaTermino) < hoy && act.estado !== 'terminado'
        })),
        diasPromedio: parseFloat(diasPromedio.toFixed(1))
      };
    });
    
    // Calcular métricas globales
    const metricasGlobales = {
      totalActividades: actividades.length,
      actividadesCompletadas: actividades.filter(a => a.estado === 'terminado').length,
      actividadesEnProceso: actividades.filter(a => a.estado === 'en_proceso').length,
      actividadesIniciadas: actividades.filter(a => a.estado === 'inicio').length,
      actividadesVencidas: actividades.filter(a => 
        new Date(a.fechaTermino) < hoy && a.estado !== 'terminado'
      ).length,
      porcentajeGlobalCompletado: actividades.length > 0 
        ? (actividades.filter(a => a.estado === 'terminado').length / actividades.length) * 100 
        : 0,
      distribucionPorUsuario: usuarios.map(usuario => {
        return {
          usuarioId: usuario.id,
          nombre: usuario.nombre,
          cargo: usuario.cargo || 'No especificado',
          cantidadActividades: distribucionPorUsuario[usuario.id] || 0
        };
      }).sort((a, b) => b.cantidadActividades - a.cantidadActividades),
      tiempoPromedioPorTipo: tiposActividad.map(tipo => {
        return {
          tipoActividadId: tipo.id,
          nombre: tipo.nombre,
          area: tipo.area.nombre,
          diasPromedio: tiemposPromedioFinal[tipo.id] 
            ? parseFloat(tiemposPromedioFinal[tipo.id].toFixed(1)) 
            : 0
        };
      }).filter(t => t.diasPromedio > 0)
    };

    // Ordenar resultados por porcentaje completado (ascendente)
    resultados.sort((a, b) => a.estadisticas.porcentajeCompletado - b.estadisticas.porcentajeCompletado);

    return NextResponse.json({
      data: resultados,
      metricas: metricasGlobales,
      filtros: {
        tiposActividad: todosTiposActividad,
        usuarios: todosUsuarios
      },
      total: resultados.length
    });
  } catch (error) {
    console.error('Error al obtener datos de seguimiento de actividades:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}