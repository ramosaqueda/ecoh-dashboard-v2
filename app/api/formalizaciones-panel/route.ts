// src/app/api/formalizaciones-panel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Función helper para convertir fechas de forma segura
function safeDate(fecha: Date | string | null | undefined): Date | null {
  if (!fecha) return null;
  
  if (fecha instanceof Date) {
    return isNaN(fecha.getTime()) ? null : fecha;
  }
  
  if (typeof fecha === 'string') {
    const parsedDate = new Date(fecha);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  }
  
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const delitoId = searchParams.get('delitoId');
    const fiscalId = searchParams.get('fiscalId');
    const estadoId = searchParams.get('estadoId');
    const ruc = searchParams.get('ruc');
    
    // Obtener la fecha actual para calcular plazos
    const fechaActual = new Date();
    
    // Construir condiciones para el filtro de causas
    const causaWhere: any = {};
    
    if (delitoId && delitoId !== 'all') {
      causaWhere.delitoId = parseInt(delitoId);
    }
    
    if (fiscalId && fiscalId !== 'all') {
      causaWhere.fiscalId = parseInt(fiscalId);
    }
    
    if (ruc && ruc.trim() !== '') {
      causaWhere.ruc = {
        contains: ruc.trim()
      };
    }
    
    // Construir condiciones para filtrar CausasImputados
    const imputadosWhere: any = {};
    
    if (estadoId) {
      if (estadoId === 'formalizados') {
        imputadosWhere.formalizado = true;
      } else if (estadoId === 'no_formalizados') {
        imputadosWhere.formalizado = false;
      }
    }
    
    // 1. Obtener causas con sus imputados según los filtros
    const causas = await prisma.causa.findMany({
      where: causaWhere,
      include: {
        delito: true,
        fiscal: true,
        comuna: true,
        imputados: {
          where: imputadosWhere,
          include: {
            imputado: {
              select: {
                id: true,
                nombreSujeto: true,
                docId: true,
                alias: true,
                nacionalidad: {
                  select: {
                    nombre: true
                  }
                }
              }
            },
            cautelar: true
          }
        }
      },
      orderBy: {
        fechaDelHecho: 'desc'
      }
    });
    
    // 2. Extraer y procesar los datos para la respuesta
    const formalizacionesData = causas
      .filter(causa => causa.imputados.length > 0) // Solo causas con imputados
      .map(causa => {
        // Mapear los datos de cada imputado de la causa
        const imputadosData = causa.imputados.map(ci => {
          // Calcular días restantes para vencimiento (si está formalizado y tiene plazo)
          let diasRestantes = null;
          let estado = 'Sin formalizar';
          let alerta = 'ninguna';
          
          if (ci.formalizado && ci.fechaFormalizacion && ci.plazo) {
            // ✅ Usar función helper para convertir fecha
            const fechaFormalizacion = safeDate(ci.fechaFormalizacion);
            
            if (fechaFormalizacion) {
              const fechaVencimiento = new Date(fechaFormalizacion);
              fechaVencimiento.setDate(fechaVencimiento.getDate() + ci.plazo);
              
              const tiempoRestante = fechaVencimiento.getTime() - fechaActual.getTime();
              diasRestantes = Math.ceil(tiempoRestante / (1000 * 3600 * 24));
              
              if (diasRestantes <= 0) {
                estado = 'Vencido';
                alerta = 'vencido';
              } else if (diasRestantes <= 10) {
                estado = 'Por vencer';
                alerta = 'proximo';
              } else {
                estado = 'En plazo';
                alerta = 'normal';
              }
            }
          }
          
          return {
            imputadoId: ci.imputadoId,
            nombreImputado: ci.imputado.nombreSujeto,
            documento: ci.imputado.docId,
            alias: ci.imputado.alias || '',
            nacionalidad: ci.imputado.nacionalidad?.nombre || 'No especificada',
            formalizado: ci.formalizado,
            fechaFormalizacion: ci.fechaFormalizacion,
            plazo: ci.plazo || null,
            diasRestantes: diasRestantes,
            medidaCautelar: ci.cautelar?.nombre || 'Sin medida cautelar',
            cautelarId: ci.cautelarId,
            estado,
            alerta
          };
        });
        
        // Calcular estadísticas para esta causa
        const totalImputados = imputadosData.length;
        const formalizados = imputadosData.filter(i => i.formalizado).length;
        const porVencer = imputadosData.filter(i => i.alerta === 'proximo').length;
        const vencidos = imputadosData.filter(i => i.alerta === 'vencido').length;
        
        return {
          causaId: causa.id,
          ruc: causa.ruc || 'Sin RUC',
          denominacion: causa.denominacionCausa,
          fechaHecho: causa.fechaDelHecho,
          delito: causa.delito?.nombre || 'No especificado',
          fiscal: causa.fiscal?.nombre || 'No asignado',
          comuna: causa.comuna?.nombre || 'No especificada',
          imputados: imputadosData,
          estadisticas: {
            totalImputados,
            formalizados,
            noFormalizados: totalImputados - formalizados,
            porcentajeFormalizados: totalImputados > 0 ? (formalizados / totalImputados) * 100 : 0,
            porVencer,
            vencidos
          },
          // Determinar la alerta general de la causa
          alertaGeneral: vencidos > 0 ? 'vencido' : porVencer > 0 ? 'proximo' : 'normal'
        };
      });
    
    // 3. Obtener delitos y fiscales para filtros
    const delitos = await prisma.delito.findMany({
      orderBy: {
        nombre: 'asc'
      }
    });
    
    const fiscales = await prisma.fiscal.findMany({
      orderBy: {
        nombre: 'asc'
      }
    });
    
    // 4. Calcular métricas globales
    const totalCausas = formalizacionesData.length;
    const causasConFormalizados = formalizacionesData.filter(c => c.estadisticas.formalizados > 0).length;
    const causasSinFormalizados = formalizacionesData.filter(c => c.estadisticas.formalizados === 0).length;
    
    const totalImputados = formalizacionesData.reduce((sum, c) => sum + c.estadisticas.totalImputados, 0);
    const totalFormalizados = formalizacionesData.reduce((sum, c) => sum + c.estadisticas.formalizados, 0);
    const totalPorVencer = formalizacionesData.reduce((sum, c) => sum + c.estadisticas.porVencer, 0);
    const totalVencidos = formalizacionesData.reduce((sum, c) => sum + c.estadisticas.vencidos, 0);
    
    // 5. Calcular distribución por delito
    const distribucionPorDelito = delitos.map(delito => {
      const causasDelDelito = formalizacionesData.filter(c => c.delito === delito.nombre);
      const imputadosFormalizados = causasDelDelito.reduce((sum, c) => sum + c.estadisticas.formalizados, 0);
      const imputadosTotal = causasDelDelito.reduce((sum, c) => sum + c.estadisticas.totalImputados, 0);
      
      return {
        delitoId: delito.id,
        nombre: delito.nombre,
        causas: causasDelDelito.length,
        imputados: imputadosTotal,
        formalizados: imputadosFormalizados,
        porcentaje: imputadosTotal > 0 ? (imputadosFormalizados / imputadosTotal) * 100 : 0
      };
    }).filter(d => d.causas > 0);
    
    // 6. Calcular tiempos promedio entre hecho y formalización
    let sumaDias = 0;
    let conteoFormalizados = 0;
    
    formalizacionesData.forEach(causa => {
      // ✅ Usar la función helper para convertir fecha de forma segura
      const fechaHecho = safeDate(causa.fechaHecho);
      
      if (fechaHecho) {
        causa.imputados.forEach(imputado => {
          if (imputado.formalizado && imputado.fechaFormalizacion) {
            // ✅ También convertir fecha de formalización de forma segura
            const fechaFormalizacion = safeDate(imputado.fechaFormalizacion);
            
            if (fechaFormalizacion) {
              const diasDiferencia = Math.floor(
                (fechaFormalizacion.getTime() - fechaHecho.getTime()) / (1000 * 3600 * 24)
              );
              
              if (diasDiferencia >= 0) { // Solo contar si la formalización es posterior al hecho
                sumaDias += diasDiferencia;
                conteoFormalizados++;
              }
            }
          }
        });
      }
    });
    
    const promedioDiasFormalizacion = conteoFormalizados > 0 ? Math.round(sumaDias / conteoFormalizados) : 0;

    // 7. Ordenar causas por prioridad de alerta (vencidos, proximos, normales)
    formalizacionesData.sort((a, b) => {
      const prioridad: Record<string, number> = { vencido: 0, proximo: 1, normal: 2 };
      return prioridad[a.alertaGeneral] - prioridad[b.alertaGeneral];
    });
    
    return NextResponse.json({
      data: formalizacionesData,
      metricas: {
        totalCausas,
        causasConFormalizados,
        causasSinFormalizados,
        totalImputados,
        totalFormalizados,
        noFormalizados: totalImputados - totalFormalizados,
        porcentajeFormalizados: totalImputados > 0 ? (totalFormalizados / totalImputados) * 100 : 0,
        alertas: {
          porVencer: totalPorVencer,
          vencidos: totalVencidos
        },
        promedioDiasFormalizacion
      },
      distribucionPorDelito,
      filtros: {
        delitos,
        fiscales
      }
    });
  } catch (error) {
    console.error('Error al obtener datos de formalizaciones:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}