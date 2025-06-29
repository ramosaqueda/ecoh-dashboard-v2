import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EstadoActividad } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    const ruc = searchParams.get('ruc');
    const tipo_actividad_id = searchParams.get('tipo_actividad_id');
    const estado = searchParams.get('estado');
    const usuario_asignado_id = searchParams.get('usuario_asignado_id');
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');
    
    // 🔥 NUEVOS FILTROS
    const origen_id = searchParams.get('origen_id');
    const estado_causa_id = searchParams.get('estado_causa_id');
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const includeAssigned = searchParams.get('include_assigned') === 'true';

    // 🔥 INCLUDE ACTUALIZADO con nuevas relaciones
    const includeConfig: any = {
      causa: {
        select: {
          id: true,
          ruc: true,
          denominacionCausa: true,
          // 🔥 NUEVAS RELACIONES
          origen: {
            select: {
              id: true,
              codigo: true,
              nombre: true
            }
          },
          estado: {
            select: {
              id: true,
              codigo: true,
              nombre: true
            }
          },
          // Mantener campos antiguos temporalmente para compatibilidad
          causaEcoh: true,
          causaLegada: true
        }
      },
      tipoActividad: {
        include: {
          area: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      },
      usuario: {
        select: {
          id: true,
          nombre: true,
          email: true
        }
      },
    };

    if (includeAssigned) {
      includeConfig.usuarioAsignado = {
        select: {
          id: true,
          nombre: true,
          email: true,
          rol: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      };
    }

    if (id) {
      const actividad = await prisma.actividad.findUnique({
        where: { id: Number(id) },
        include: includeConfig,
      });

      if (!actividad) {
        return NextResponse.json(
          { message: 'Actividad no encontrada' },
          { status: 404 }
        );
      }

      return NextResponse.json(actividad);
    }

    // 🔥 WHERE CONDITIONS ACTUALIZADAS
    const whereConditions = [];

    if (ruc) {
      whereConditions.push({ causa: { ruc } });
    }

    if (tipo_actividad_id) {
      whereConditions.push({ tipo_actividad_id: Number(tipo_actividad_id) });
    }

    if (estado) {
      whereConditions.push({ estado: estado as EstadoActividad });
    }

    if (usuario_asignado_id) {
      whereConditions.push({ usuario_asignado_id: Number(usuario_asignado_id) });
    }

    if (fechaDesde) {
      whereConditions.push({ fechaInicio: { gte: new Date(fechaDesde) } });
    }

    if (fechaHasta) {
      whereConditions.push({ fechaTermino: { lte: new Date(fechaHasta) } });
    }

    // 🔥 NUEVOS FILTROS POR ORIGEN Y ESTADO DE CAUSA
    if (origen_id) {
      whereConditions.push({ causa: { idOrigen: Number(origen_id) } });
    }

    if (estado_causa_id) {
      whereConditions.push({ causa: { idEstado: Number(estado_causa_id) } });
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    const total = await prisma.actividad.count({ where });

    const actividades = await prisma.actividad.findMany({
      where,
      include: includeConfig,
      orderBy: {
        fechaInicio: 'desc',
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      data: actividades,
      metadata: {
        total,
        page,
        limit,
        hasMore: skip + actividades.length < total
      }
    });
  } catch (error) {
    console.error('Error en GET /api/actividades:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { clerk_id: userId }
    });

    if (!usuario) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const data = await req.json();
    
    let finalUsuarioAsignadoId = usuario.id;

    if (data.usuarioAsignadoId && data.usuarioAsignadoId.trim() !== '') {
      const usuarioAsignado = await prisma.usuario.findUnique({
        where: { id: parseInt(data.usuarioAsignadoId) }
      });
      
      if (usuarioAsignado) {
        finalUsuarioAsignadoId = parseInt(data.usuarioAsignadoId);
      }
    }

    // 🔥 INCLUDE ACTUALIZADO para la respuesta
    const includeConfigResponse = {
      causa: {
        select: {
          id: true,
          ruc: true,
          denominacionCausa: true,
          origen: {
            select: {
              id: true,
              codigo: true,
              nombre: true
            }
          },
          estado: {
            select: {
              id: true,
              codigo: true,
              nombre: true
            }
          }
        }
      },
      tipoActividad: {
        include: {
          area: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      },
      usuario: {
        select: {
          id: true,
          nombre: true,
          email: true
        }
      },
      usuarioAsignado: {
        select: {
          id: true,
          nombre: true,
          email: true,
          rol: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      }
    };

    const actividad = await (prisma.actividad as any).create({
      data: {
        causa_id: parseInt(data.causaId),
        tipo_actividad_id: parseInt(data.tipoActividadId),
        usuario_id: usuario.id,
        usuario_asignado_id: finalUsuarioAsignadoId,
        fechaInicio: new Date(data.fechaInicio),
        fechaTermino: new Date(data.fechaTermino),
        estado: data.estado as EstadoActividad,
        observacion: data.observacion,
        glosa_cierre: data.glosa_cierre || null
      },
      include: includeConfigResponse,
    });

    return NextResponse.json(actividad, { status: 201 });

  } catch (error) {
    console.error('Error en POST /api/actividades:', error);
    return NextResponse.json(
      { 
        message: 'Error interno del servidor', 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { message: 'ID no proporcionado' },
        { status: 400 }
      );
    }

    const data = await req.json();
    
    const updateData: any = {};

    if (data.tipoActividadId) {
      updateData.tipo_actividad_id = parseInt(data.tipoActividadId);
    }
    
    if (data.fechaInicio) {
      updateData.fechaInicio = new Date(data.fechaInicio);
    }
    
    if (data.fechaTermino) {
      updateData.fechaTermino = new Date(data.fechaTermino);
    }
    
    if (data.estado) {
      updateData.estado = data.estado as EstadoActividad;
    }
    
    if (data.observacion !== undefined) {
      updateData.observacion = data.observacion;
    }

    if (data.glosa_cierre !== undefined) {
      updateData.glosa_cierre = data.glosa_cierre || null;
    }

    if (data.usuarioAsignadoId !== undefined) {
      if (data.usuarioAsignadoId && data.usuarioAsignadoId.trim() !== '') {
        const usuarioAsignado = await prisma.usuario.findUnique({
          where: { id: parseInt(data.usuarioAsignadoId) }
        });
        
        if (usuarioAsignado) {
          updateData.usuario_asignado_id = parseInt(data.usuarioAsignadoId);
        }
      } else {
        const { userId } = await auth();
        if (userId) {
          const currentUser = await prisma.usuario.findUnique({
            where: { clerk_id: userId }
          });
          if (currentUser) {
            updateData.usuario_asignado_id = currentUser.id;
          }
        }
      }
    }

    // 🔥 INCLUDE ACTUALIZADO para la respuesta
    const includeConfigResponse = {
      causa: {
        select: {
          id: true,
          ruc: true,
          denominacionCausa: true,
          origen: {
            select: {
              id: true,
              codigo: true,
              nombre: true
            }
          },
          estado: {
            select: {
              id: true,
              codigo: true,
              nombre: true
            }
          }
        }
      },
      tipoActividad: {
        include: {
          area: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      },
      usuario: {
        select: {
          id: true,
          nombre: true,
          email: true
        }
      },
      usuarioAsignado: {
        select: {
          id: true,
          nombre: true,
          email: true,
          rol: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      }
    };

    const actividad = await (prisma.actividad as any).update({
      where: { id: Number(id) },
      data: updateData,
      include: includeConfigResponse,
    });

    return NextResponse.json(actividad);

  } catch (error) {
    console.error('Error en PUT /api/actividades:', error);
    if (error instanceof Error && error.name === 'PrismaClientKnownRequestError' && (error as any).code === 'P2025') {
      return NextResponse.json(
        { message: 'Actividad no encontrada' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'ID no proporcionado' },
        { status: 400 }
      );
    }

    await prisma.actividad.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(
      { message: 'Actividad eliminada correctamente' }
    );
  } catch (error) {
    console.error('Error en DELETE /api/actividades:', error);
    if (error instanceof Error && error.name === 'PrismaClientKnownRequestError' && (error as any).code === 'P2025') {
      return NextResponse.json(
        { message: 'Actividad no encontrada' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}