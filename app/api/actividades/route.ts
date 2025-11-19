import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EstadoActividad } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

// 🔧 Helper para timeout en peticiones
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs);
  });
  return Promise.race([promise, timeout]);
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🔍 [API] GET /api/actividades - Iniciando...');
    
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    const ruc = searchParams.get('ruc');
    const tipo_actividad_id = searchParams.get('tipo_actividad_id');
    const estado = searchParams.get('estado');
    const usuario_asignado_id = searchParams.get('usuario_asignado_id');
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const includeAssigned = searchParams.get('include_assigned') === 'true';
    const creadasPorMi = searchParams.get('creadas_por_mi') === 'true';
    const asignadasAMi = searchParams.get('asignadas_a_mi') === 'true';

    console.log('📋 [API] Parámetros:', { 
      creadasPorMi, 
      asignadasAMi, 
      includeAssigned, 
      limit 
    });

    // 🔧 Configuración de includes
    const includeConfig: any = {
      causa: {
        select: {
          id: true,
          ruc: true,
          denominacionCausa: true
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
          clerk_id: true,
          rol: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      };
    }

    // 🔧 CASO 1: Buscar por ID específico
    if (id) {
      console.log('🔍 [API] Buscando actividad por ID:', id);
      
      const actividad = await withTimeout(
        prisma.actividad.findUnique({
          where: { id: Number(id) },
          include: includeConfig,
        }),
        5000 // 5 segundos timeout
      );

      if (!actividad) {
        return NextResponse.json(
          { message: 'Actividad no encontrada' },
          { status: 404 }
        );
      }

      console.log(`✅ [API] Actividad encontrada en ${Date.now() - startTime}ms`);
      return NextResponse.json(actividad);
    }

    // 🔧 CASO 2: Listado con filtros
    let currentUser = null;
    
    // Solo buscar usuario si es necesario
    if (creadasPorMi || asignadasAMi) {
      try {
        console.log('🔐 [API] Obteniendo autenticación...');
        
        // 🔧 Agregar timeout a auth()
        const authResult = await withTimeout(auth(), 3000);
        const { userId } = authResult;
        
        console.log('🔐 [API] Auth result:', { 
          hasUserId: !!userId, 
          userId: userId ? `${userId.substring(0, 12)}...` : 'null' 
        });

        if (userId) {
          console.log('👤 [API] Buscando usuario en BD...');
          currentUser = await withTimeout(
            prisma.usuario.findUnique({
              where: { clerk_id: userId },
              select: {
                id: true,
                nombre: true,
                clerk_id: true
              }
            }),
            3000
          );
          console.log('👤 [API] Usuario encontrado:', currentUser?.nombre || 'No encontrado');
        } else {
          console.warn('⚠️ [API] No hay userId en auth()');
        }
      } catch (authError) {
        console.error('❌ [API] Error en autenticación:', authError);
        // Si falla auth, retornar error apropiado
        return NextResponse.json(
          { 
            message: 'Error de autenticación', 
            details: authError instanceof Error ? authError.message : 'Unknown error'
          },
          { status: 401 }
        );
      }
    }

    // 🔧 Construir condiciones WHERE
    const whereConditions: any[] = [];

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

    // 🔧 Filtros específicos del dashboard
    if (creadasPorMi) {
      if (!currentUser) {
        console.warn('⚠️ [API] creadas_por_mi=true pero no hay usuario autenticado');
        return NextResponse.json({
          data: [],
          metadata: {
            total: 0,
            page,
            limit,
            hasMore: false
          }
        });
      }
      console.log(`🔍 [API] Filtrando por usuario_id: ${currentUser.id}`);
      whereConditions.push({ usuario_id: currentUser.id });
    }

    if (asignadasAMi) {
      if (!currentUser) {
        console.warn('⚠️ [API] asignadas_a_mi=true pero no hay usuario autenticado');
        return NextResponse.json({
          data: [],
          metadata: {
            total: 0,
            page,
            limit,
            hasMore: false
          }
        });
      }
      console.log(`🔍 [API] Filtrando por usuario_asignado_id: ${currentUser.id}`);
      whereConditions.push({ usuario_asignado_id: currentUser.id });
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    console.log('🔍 [API] Ejecutando consultas a BD...');
    console.log('🔍 [API] Where conditions:', JSON.stringify(where, null, 2));

    // 🔧 Ejecutar count y findMany en paralelo con timeout
    const [total, actividades] = await withTimeout(
      Promise.all([
        prisma.actividad.count({ where }),
        prisma.actividad.findMany({
          where,
          include: includeConfig,
          orderBy: {
            fechaInicio: 'desc',
          },
          skip,
          take: limit,
        })
      ]),
      8000 // 8 segundos timeout total para ambas queries
    );

    const duration = Date.now() - startTime;
    console.log(`✅ [API] Consulta completada en ${duration}ms`);
    console.log(`📊 [API] Resultados: ${actividades.length} de ${total} total`);

    return NextResponse.json({
      data: actividades,
      metadata: {
        total,
        page,
        limit,
        hasMore: skip + actividades.length < total,
        duration
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [API] Error en GET /api/actividades (${duration}ms):`, error);
    
    // Mejor manejo de errores
    if (error instanceof Error) {
      console.error('❌ [API] Error name:', error.name);
      console.error('❌ [API] Error message:', error.message);
      
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { 
            message: 'Request timeout - La consulta tardó demasiado',
            duration
          },
          { status: 504 }
        );
      }
    }

    return NextResponse.json(
      { 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      },
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

    // ✅ Preparar data de creación con validación de causa
    const createData: any = {
      tipo_actividad_id: parseInt(data.tipoActividadId),
      usuario_id: usuario.id,
      usuario_asignado_id: finalUsuarioAsignadoId,
      fechaInicio: new Date(data.fechaInicio),
      fechaTermino: new Date(data.fechaTermino),
      estado: data.estado as EstadoActividad,
      observacion: data.observacion,
      glosa_cierre: data.glosa_cierre || null,
      esActividadApoyo: data.esActividadApoyo || false // ✅ NUEVO CAMPO
    };

    // ✅ Solo agregar causa_id si NO es actividad de apoyo
    if (!data.esActividadApoyo && data.causaId) {
      createData.causa_id = parseInt(data.causaId);
    }

    // Crear la actividad
    const actividad = await (prisma.actividad as any).create({
      data: createData,
      include: {
        causa: {
          select: {
            id: true,
            ruc: true,
            denominacionCausa: true
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
            clerk_id: true,
            rol: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        }
      },
    });

    // 🔔 CREAR NOTIFICACIÓN si se asigna a otro usuario
    const isAssignedToDifferentUser = finalUsuarioAsignadoId !== usuario.id;
    
    if (isAssignedToDifferentUser && actividad.usuarioAsignado) {
      try {
        console.log(`🔔 Creando notificación para usuario ${actividad.usuarioAsignado.nombre}`);

        const notificationId = `actividad-nueva-${actividad.id}-${Date.now()}`;

        // ✅ Construir mensaje apropiado según si tiene causa o no
        const message = actividad.causa 
          ? `${usuario.nombre} te ha asignado la actividad "${actividad.tipoActividad.nombre}" para la causa ${actividad.causa.ruc}`
          : `${usuario.nombre} te ha asignado la actividad de apoyo "${actividad.tipoActividad.nombre}"`;

        await prisma.notification.create({
          data: {
            id: notificationId,
            type: 'actividad_nueva',
            title: 'Nueva Actividad Asignada',
            message,
            priority: 'medio',
            userId: actividad.usuarioAsignado.id,
            userEmail: actividad.usuarioAsignado.email,
            actividadId: actividad.id,
            metadata: {
              causaRuc: actividad.causa?.ruc || null, // ✅ Puede ser null
              tipoActividad: actividad.tipoActividad.nombre,
              actionUrl: `/dashboard/todo?highlight=${actividad.id}`,
              asignadoPor: usuario.nombre,
              esActividadApoyo: actividad.esActividadApoyo // ✅ NUEVO CAMPO
            }
          }
        });

        console.log(`✅ Notificación creada exitosamente`);
      } catch (notificationError) {
        console.error('❌ Error creando notificación:', notificationError);
      }
    }

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

    const actividadAnterior = await prisma.actividad.findUnique({
      where: { id: Number(id) },
      include: {
        usuario: { select: { clerk_id: true, nombre: true } },
        usuarioAsignado: { select: { clerk_id: true, nombre: true } },
        causa: { select: { ruc: true } },
        tipoActividad: { select: { nombre: true } }
      }
    });

    if (!actividadAnterior) {
      return NextResponse.json(
        { message: 'Actividad no encontrada' },
        { status: 404 }
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
    
    let estadoCambio = false;
    let estadoAnterior = '';
    let estadoNuevo = '';
    
    if (data.estado && data.estado !== actividadAnterior.estado) {
      estadoCambio = true;
      estadoAnterior = actividadAnterior.estado;
      estadoNuevo = data.estado;
      updateData.estado = data.estado as EstadoActividad;
    }
    
    if (data.observacion !== undefined) {
      updateData.observacion = data.observacion;
    }

    if (data.glosa_cierre !== undefined) {
      updateData.glosa_cierre = data.glosa_cierre || null;
    }

    // ✅ NUEVO: Manejar esActividadApoyo
    if (data.esActividadApoyo !== undefined) {
      updateData.esActividadApoyo = data.esActividadApoyo;
      // Si cambia a actividad de apoyo, quitar la causa
      if (data.esActividadApoyo) {
        updateData.causa_id = null;
      }
    }

    // ✅ NUEVO: Si cambia a actividad regular, requerir causa
    if (data.causaId && !data.esActividadApoyo) {
      updateData.causa_id = parseInt(data.causaId);
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

    const actividad = await (prisma.actividad as any).update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        causa: {
          select: {
            id: true,
            ruc: true,
            denominacionCausa: true
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
            email: true,
            clerk_id: true
          }
        },
        usuarioAsignado: {
          select: {
            id: true,
            nombre: true,
            email: true,
            clerk_id: true,
            rol: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        }
      },
    });

    const shouldNotifyCreator = estadoCambio && 
                               actividad.usuario.clerk_id !== actividad.usuarioAsignado?.clerk_id;

    let notificationData = null;
    if (shouldNotifyCreator) {
      const estadosMap: Record<string, string> = {
        'inicio': 'Iniciada',
        'en_proceso': 'En Proceso', 
        'terminado': 'Terminada'
      };

      notificationData = {
        shouldTrigger: true,
        actividadId: actividad.id,
        causaRuc: actividad.causa.ruc,
        tipoActividad: actividad.tipoActividad.nombre,
        estadoAnterior: estadosMap[estadoAnterior] || estadoAnterior,
        estadoNuevo: estadosMap[estadoNuevo] || estadoNuevo,
        usuarioQueActualizo: actividad.usuarioAsignado?.nombre || 'Usuario',
        targetUserClerkId: actividad.usuario.clerk_id
      };
    }

    return NextResponse.json({
      ...actividad,
      _statusNotification: notificationData
    });

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