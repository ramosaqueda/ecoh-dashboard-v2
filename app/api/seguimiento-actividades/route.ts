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
    
    // CAMBIO: Usar usuario_asignado_id en lugar de usuario_id
    if (usuarioId && usuarioId !== 'all') {
      whereConditions.usuario_asignado_id = parseInt(usuarioId);
    }
    
    if (tipoActividadId && tipoActividadId !== 'all') {
      whereConditions.tipo_actividad_id = parseInt(tipoActividadId);
    }
    
    if (ruc && ruc.trim() !== '') {
      whereConditions.causa = {
        ruc: {
          contains: ruc,
        },
      };
    }
    
    // Log para debugging - mostrar la consulta que se está ejecutando
    console.log('=== CONSULTA DE ACTIVIDADES ===');
    console.log('Filtros aplicados:', {
      fechaInicio,
      fechaFin,
      usuarioId,
      tipoActividadId,
      ruc
    });
    console.log('Condiciones WHERE:', JSON.stringify(whereConditions, null, 2));
    
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
        // CAMBIO: Incluir usuarioAsignado en lugar de usuario
        // CAMBIO: Incluir usuarioAsignado en lugar de usuario
        usuarios_Actividad_usuario_asignado_idTousuarios: {
          select: {
            id: true,
            nombre: true,
            email: true,
            cargo: true,
          },
        },
        usuarios_Actividad_usuario_idTousuarios: {
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
    
    console.log(`Total de actividades encontradas: ${actividades.length}`);
    
    // 2. Agrupar actividades por causa (incluyendo actividades de apoyo)
    const actividadesPorCausa: Record<string, typeof actividades> = {};
    const APOYO_KEY = 'apoyo'; // Clave especial para actividades sin causa
    
    for (const actividad of actividades) {
      const causaId = actividad.causa_id;
      const key = causaId !== null ? causaId.toString() : APOYO_KEY; // ✅ Manejar null
      
      if (!actividadesPorCausa[key]) {
        actividadesPorCausa[key] = [];
      }
      actividadesPorCausa[key].push(actividad);
    }
    
    // 3. Obtener todos los IDs de causas (excluyendo actividades de apoyo)
    const causasIds = Object.keys(actividadesPorCausa)
      .filter(id => id !== APOYO_KEY)
      .map(id => parseInt(id));
    
    // 4. Calcular estadísticas por causa (incluyendo actividades de apoyo)
    const estadosPorCausa: Record<string, { 
      total: number, 
      iniciadas: number, 
      enProceso: number, 
      terminadas: number,
      porcentajeCompletado: number
    }> = {};
    
    for (const [causaKey, actividadesDeCausa] of Object.entries(actividadesPorCausa)) {
      const total = actividadesDeCausa.length;
      const iniciadas = actividadesDeCausa.filter(a => a.estado === 'inicio').length;
      const enProceso = actividadesDeCausa.filter(a => a.estado === 'en_proceso').length;
      const terminadas = actividadesDeCausa.filter(a => a.estado === 'terminado').length;
      
      estadosPorCausa[causaKey] = {
        total,
        iniciadas,
        enProceso,
        terminadas,
        porcentajeCompletado: total > 0 ? (terminadas / total) * 100 : 0
      };
    }
    
    // 5. Obtener estadísticas por tipo de actividad (Reemplaza a tiempo promedio)
    const statsPorTipo: Record<number, {
      total: number;
      completadas: number;
      enProceso: number;
      iniciadas: number;
      diasPromedioSum: number;
      diasPromedioCount: number;
    }> = {};

    for (const actividad of actividades) {
      const tipoId = actividad.tipo_actividad_id;
      if (!statsPorTipo[tipoId]) {
        statsPorTipo[tipoId] = {
          total: 0,
          completadas: 0,
          enProceso: 0,
          iniciadas: 0,
          diasPromedioSum: 0,
          diasPromedioCount: 0
        };
      }
      
      statsPorTipo[tipoId].total++;
      
      if (actividad.estado === 'terminado') {
        statsPorTipo[tipoId].completadas++;
        
        const fechaInicio = new Date(actividad.fechaInicio);
        const fechaTermino = new Date(actividad.fechaTermino);
        const diffTime = Math.abs(fechaTermino.getTime() - fechaInicio.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        statsPorTipo[tipoId].diasPromedioSum += diffDays;
        statsPorTipo[tipoId].diasPromedioCount++;
      } else if (actividad.estado === 'en_proceso') {
        statsPorTipo[tipoId].enProceso++;
      } else {
        statsPorTipo[tipoId].iniciadas++;
      }
    }

    // 6. Calcular distribución por usuario asignado, estamento y tipo de actividad
    const distribucionPorUsuario: Record<number, number> = {};
    const distribucionPorEstamento: Record<string, number> = {};
    const actividadesPorUsuarioYTipo: Record<number, Record<string, number>> = {};
    
    console.log('=== CALCULANDO DISTRIBUCIÓN POR USUARIO ===');
    
    for (const actividad of actividades) {
      const usuarioAsignadoId = actividad.usuario_asignado_id || actividad.usuario_id;
      const usuarioObj = actividad.usuarios_Actividad_usuario_asignado_idTousuarios || actividad.usuarios_Actividad_usuario_idTousuarios;
      const tipoNombre = actividad.tipoActividad.nombre;
      
      if (usuarioAsignadoId) {
        // Contar total por usuario
        if (!distribucionPorUsuario[usuarioAsignadoId]) {
          distribucionPorUsuario[usuarioAsignadoId] = 0;
        }
        distribucionPorUsuario[usuarioAsignadoId]++;
        
        // Contar por tipo de actividad para cada usuario
        if (!actividadesPorUsuarioYTipo[usuarioAsignadoId]) {
          actividadesPorUsuarioYTipo[usuarioAsignadoId] = {};
        }
        if (!actividadesPorUsuarioYTipo[usuarioAsignadoId][tipoNombre]) {
          actividadesPorUsuarioYTipo[usuarioAsignadoId][tipoNombre] = 0;
        }
        actividadesPorUsuarioYTipo[usuarioAsignadoId][tipoNombre]++;
      }

      // Agrupar por estamento (cargo)
      if (usuarioObj && usuarioObj.cargo) {
        const cargo = usuarioObj.cargo;
        if (!distribucionPorEstamento[cargo]) {
          distribucionPorEstamento[cargo] = 0;
        }
        distribucionPorEstamento[cargo]++;
      } else {
        const sinCargo = 'Sin Estamento';
        if (!distribucionPorEstamento[sinCargo]) {
          distribucionPorEstamento[sinCargo] = 0;
        }
        distribucionPorEstamento[sinCargo]++;
      }
    }
    
    console.log('Distribución calculada:', distribucionPorUsuario);
    console.log('Total de usuarios con actividades:', Object.keys(distribucionPorUsuario).length);
    console.log('=== DISTRIBUCIÓN POR ESTAMENTO (RAW) ===');
    console.log('distribucionPorEstamento (objeto):', distribucionPorEstamento);
    console.log('Cantidad de estamentos:', Object.keys(distribucionPorEstamento).length);
    
    // 7. Obtener información de usuarios asignados
    const usuariosAsignadosIds = Array.from(new Set(
      actividades
        .map(a => a.usuario_asignado_id || a.usuario_id)
        .filter(id => id !== null)
    )) as number[];
    
    const usuarios = await prisma.usuarios.findMany({
      where: {
        id: {
          in: usuariosAsignadosIds,
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
    const tiposActividadIds = Array.from(new Set(actividades.map(a => a.tipo_actividad_id)));
    
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
    
    const todosUsuarios = await prisma.usuarios.findMany({
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
    
    // Definir fecha actual para detectar actividades vencidas
    const hoy = new Date();

    // 8. Preparar array de Tipos de Actividad con estadísticas
    const totalPorTipo = tiposActividad.map(tipo => {
      const stats = statsPorTipo[tipo.id] || {
        total: 0,
        completadas: 0,
        enProceso: 0,
        iniciadas: 0,
        diasPromedioSum: 0,
        diasPromedioCount: 0
      };

      return {
        tipoActividadId: tipo.id,
        nombre: tipo.nombre,
        area: tipo.area.nombre,
        totalActividades: stats.total,
        completadas: stats.completadas,
        enProceso: stats.enProceso,
        iniciadas: stats.iniciadas,
        porcentajeCompletado: stats.total > 0 ? (stats.completadas / stats.total) * 100 : 0,
        diasPromedio: stats.diasPromedioCount > 0 ? parseFloat((stats.diasPromedioSum / stats.diasPromedioCount).toFixed(1)) : 0
      };
    }).filter(t => t.totalActividades > 0).sort((a, b) => b.totalActividades - a.totalActividades);

    // 9. Preparar resultados por causa (incluyendo actividades de apoyo)
    const resultados = Object.keys(actividadesPorCausa).map(causaKey => {
      const actividadesDeCausa = actividadesPorCausa[causaKey];
      const primerActividad = actividadesDeCausa[0];
      
      // Determinar si es actividad de apoyo
      const esActividadApoyo = causaKey === APOYO_KEY;
      
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
        causaId: esActividadApoyo ? null : parseInt(causaKey),
        ruc: esActividadApoyo ? 'APOYO' : (primerActividad?.causa?.ruc || 'N/A'),
        denominacionCausa: esActividadApoyo 
          ? 'Actividades de Apoyo Externo' 
          : (primerActividad?.causa?.denominacionCausa || 'N/A'),
        delito: esActividadApoyo 
          ? 'N/A' 
          : (primerActividad?.causa?.delito?.nombre || 'No especificado'),
        esActividadApoyo,
        estadisticas: estadosPorCausa[causaKey],
        actividades: actividadesDeCausa.map(act => {
          const responsable = act.usuarios_Actividad_usuario_asignado_idTousuarios || act.usuarios_Actividad_usuario_idTousuarios;
          return {
            id: act.id,
            tipoActividad: act.tipoActividad.nombre,
            area: act.tipoActividad.area.nombre,
            fechaInicio: act.fechaInicio,
            fechaTermino: act.fechaTermino,
            estado: act.estado,
            usuario: responsable?.nombre || 'Sin asignar',
            observacion: act.observacion || '',
            vencida: new Date(act.fechaTermino) < hoy && act.estado !== 'terminado'
          };
        }),
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
          cantidadActividades: distribucionPorUsuario[usuario.id] || 0,
          actividadesPorTipo: actividadesPorUsuarioYTipo[usuario.id] || {}
        };
      }).sort((a, b) => b.cantidadActividades - a.cantidadActividades),
      totalPorTipo: totalPorTipo, // ✅ Usamos los datos reales calculados
      distribucionPorEstamento: Object.entries(distribucionPorEstamento).map(([estamento, cantidad]) => ({
        estamento,
        cantidad
      })).sort((a, b) => b.cantidad - a.cantidad) // ✅ Nueva métrica
    };
    
    console.log('=== DISTRIBUCIÓN POR ESTAMENTO ===');
    console.log('distribucionPorEstamento:', metricasGlobales.distribucionPorEstamento);

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