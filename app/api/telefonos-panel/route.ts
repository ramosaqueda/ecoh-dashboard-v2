// src/app/api/telefonos-panel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ruc = searchParams.get('ruc');
    const proveedorId = searchParams.get('proveedorId');
    const ubicacionId = searchParams.get('ubicacionId');
    const solicitudFilter = searchParams.get('solicitud');
    
    // Construir condiciones de filtrado
    const whereConditions: any = {};
    const telefonoCausaWhere: any = {};
    
    if (proveedorId && proveedorId !== 'all') {
      whereConditions.idProveedorServicio = parseInt(proveedorId);
    }
    
    if (ubicacionId && ubicacionId !== 'all') {
      whereConditions.id_ubicacion = parseInt(ubicacionId);
    }
    
    // Filtrar por tipo de solicitud
    if (solicitudFilter === 'trafico') {
      whereConditions.solicitaTrafico = true;
    } else if (solicitudFilter === 'imei') {
      whereConditions.solicitaImei = true;
    } else if (solicitudFilter === 'forense') {
      whereConditions.extraccionForense = true;
    } else if (solicitudFilter === 'custodia') {
      whereConditions.enviar_custodia = true;
    }
    
    // Filtrar por RUC si se proporciona
    if (ruc && ruc.trim() !== '') {
      telefonoCausaWhere.causa = {
        ruc: {
          contains: ruc.trim()
        }
      };
    }
    
    // 1. Obtener teléfonos según los filtros
    const telefonos = await prisma.telefono.findMany({
      where: whereConditions,
      include: {
        proveedorServicio: true,
        ubicacion: true,
        telefonosCausa: {
          where: telefonoCausaWhere,
          include: {
            causa: {
              select: {
                id: true,
                ruc: true,
                denominacionCausa: true,
                delito: {
                  select: {
                    nombre: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        numeroTelefonico: 'asc'
      }
    });
    
    // 2. Obtener proveedores para filtros
    const proveedores = await prisma.proveedor.findMany({
      orderBy: {
        nombre: 'asc'
      }
    });
    
    // 3. Obtener ubicaciones para filtros
    const ubicaciones = await prisma.ubicacionTelefono.findMany({
      orderBy: {
        nombre: 'asc'
      }
    });
    
    // 4. Procesar datos para la respuesta adaptados a la estructura existente
    const telefonosFormateados = telefonos.map(telefono => {
      // Solo incluir teléfonos que tienen al menos una causa asociada
      // que cumple con los filtros (o todos si no hay filtro de RUC)
      if (ruc && ruc.trim() !== '' && telefono.telefonosCausa.length === 0) {
        return null;
      }
      
      return {
        id: telefono.id.toString(),
        numeroTelefonico: telefono.numeroTelefonico || 'Sin número',
        imei: telefono.imei,
        abonado: telefono.abonado,
        proveedorServicio: {
          id: telefono.idProveedorServicio,
          nombre: telefono.proveedorServicio.nombre
        },
        ubicacion: telefono.ubicacion.nombre,
        ubicacionId: telefono.id_ubicacion,
        solicitaTrafico: telefono.solicitaTrafico || false,
        solicitaImei: telefono.solicitaImei || false,
        extraccionForense: telefono.extraccionForense || false,
        enviaCustodia: telefono.enviar_custodia || false,
        observacion: telefono.observacion || '',
        telefonosCausa: telefono.telefonosCausa.map(tc => ({
          id: tc.id,
          causa: {
            id: tc.causa.id,
            ruc: tc.causa.ruc,
            denominacionCausa: tc.causa.denominacionCausa,
            delito: tc.causa.delito?.nombre || 'No especificado'
          }
        }))
      };
    }).filter(Boolean); // Filtrar elementos nulos
    
    // 5. Generar estadísticas
    const estadisticas = {
      totalTelefonos: telefonosFormateados.length,
      porProveedor: proveedores.map(proveedor => ({
        id: proveedor.id,
        nombre: proveedor.nombre,
        //cantidad: telefonosFormateados.filter(t => t.proveedorServicio.id === proveedor.id).length
        cantidad: telefonosFormateados.filter(
          t => t != null && t.proveedorServicio?.id === proveedor.id
        ).length
      })),
      porUbicacion: ubicaciones.map(ubicacion => ({
        id: ubicacion.id,
        nombre: ubicacion.nombre,
        //cantidad: telefonosFormateados.filter(t => t.ubicacionId === ubicacion.id).length
        cantidad: telefonosFormateados.filter(
          t => t != null && t.proveedorServicio?.id === ubicacion.id
        ).length
      })),
      solicitudes: {
        //trafico: telefonosFormateados.filter(t => t.solicitaTrafico).length,
        trafico: telefonosFormateados.filter(t => t != null && t.solicitaTrafico).length,
        imei: telefonosFormateados.filter(t => t != null && t.solicitaImei).length,
        forense: telefonosFormateados.filter(t => t != null && t.extraccionForense).length,
        custodia: telefonosFormateados.filter(t => t != null && t.enviaCustodia).length,
      }
    };

    return NextResponse.json({
      data: telefonosFormateados,
      estadisticas,
      filtros: {
        proveedores,
        ubicaciones
      },
      total: telefonosFormateados.length
    });
  } catch (error) {
    console.error('Error al obtener datos de teléfonos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}