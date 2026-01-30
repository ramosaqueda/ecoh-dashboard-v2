import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {    
    const { id } = await params;
    console.log('DEBUG GET - Iniciando consulta para ID:', id);
    
    // PASO 1: Probar consulta básica de causa
    let causa;
    try {
      causa = await prisma.causa.findUnique({
        where: { id: parseInt(id) },
        include: {
          analista: true,
          tribunal: true,
          delito: {
            select: {
              nombre: true
            }
          },
          foco: true,
          fiscal: {
            select: {
              nombre: true
            }
          },
          atvt: true,
          abogado: true,
          origenCausa: true,
          estadoCausa: true,
          unidadPolicial: true,
          telefonos: {
            include: {
              telefono: {
                include: {
                  proveedorServicio: true
                }
              }
            }
          }
        }
      });
      console.log('DEBUG GET - Causa básica obtenida exitosamente');
    } catch (causaError) {
      console.error('ERROR al obtener causa básica:', causaError);
      throw causaError;
    }

    if (!causa) {
      console.log('Causa no encontrada con ID:', id);
      return NextResponse.json(
        { error: 'Causa no encontrada' },
        { status: 404 }
      );
    }

    // PASO 2: Consulta de parámetros CO
    let causasCrimenOrg: any[] = [];
    
    try {
      console.log('DEBUG GET - Consultando parámetros de crimen organizado...');
      causasCrimenOrg = await prisma.causasCrimenOrganizado.findMany({
        where: { causaId: parseInt(id) },
        include: {
          parametro: true
        }
      }) as any[];
      console.log('Parámetros CO obtenidos:', causasCrimenOrg.length, 'registros');
    } catch (includeError) {
      console.error('ERROR con parámetros CO:', includeError);
      
      // Intento fallback sin include
      try {
        causasCrimenOrg = await prisma.causasCrimenOrganizado.findMany({
          where: { causaId: parseInt(id) }
        }) as any[];
        console.log('Parámetros CO sin include:', causasCrimenOrg.length, 'registros');
      } catch (basicError) {
        console.error('ERROR consulta básica de parámetros CO:', basicError);
        causasCrimenOrg = [];
      }
    }

    // PASO 3: Construir respuesta
    const causaCompleta = {
      ...causa,
      causasCrimenOrg: causasCrimenOrg
    };
    
    console.log('DEBUG GET - Respuesta final construida. Campos:', {
      origenCausaId: causa.origenCausaId,
      estadoCausaId: causa.estadoCausaId,
      unidadPolicialId: causa.unidadPolicialId,
      oficialACargo: causa.oficialACargo
    });
    
    return NextResponse.json(causaCompleta);
  } catch (error) {
    console.error('ERROR GENERAL en GET causa:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Detalles del error:', errorMessage);
    return NextResponse.json(
      { error: 'Error fetching causa', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await req.json();
    const { id } = await params;
    const causaId = parseInt(id);

    console.log('DEBUG PUT - Received data:', data);
    console.log('DEBUG PUT - origenCausaId:', data.origenCausaId);
    console.log('DEBUG PUT - estadoCausaId:', data.estadoCausaId);
    console.log('DEBUG PUT - unidadPolicialId:', data.unidadPolicialId, 'tipo:', typeof data.unidadPolicialId);
    console.log('DEBUG PUT - oficialACargo:', data.oficialACargo, 'tipo:', typeof data.oficialACargo);
    console.log('DEBUG PUT - causasCrimenOrg:', data.causasCrimenOrg);

    const esCrimenOrganizadoValue = data.esCrimenOrganizado === true;

    // Procesar unidadPolicialId correctamente
    let unidadPolicialIdValue: number | null = null;
    if (data.unidadPolicialId !== undefined && data.unidadPolicialId !== null && data.unidadPolicialId !== 0) {
      const parsed = parseInt(data.unidadPolicialId.toString());
      if (!isNaN(parsed) && parsed > 0) {
        unidadPolicialIdValue = parsed;
      }
    }

    // Procesar oficialACargo correctamente
    let oficialACargoValue: string | null = null;
    if (data.oficialACargo && typeof data.oficialACargo === 'string' && data.oficialACargo.trim() !== '') {
      oficialACargoValue = data.oficialACargo.trim();
    }

    console.log('DEBUG PUT - unidadPolicialIdValue procesado:', unidadPolicialIdValue);
    console.log('DEBUG PUT - oficialACargoValue procesado:', oficialACargoValue);

    const updatedCausa = await prisma.causa.update({
      where: { id: causaId },
      data: {
        constituyeSs: data.constituyeSs,
        homicidioConsumado: data.homicidioConsumado ?? false,
        denominacionCausa: data.denominacionCausa,
        ruc: data.ruc,
        foliobw: data.folioBw || data.foliobw,
        coordenadasSs: data.coordenadasSs,
        rit: data.rit,
        numeroIta: data.numeroIta,
        numeroPpp: data.numeroPpp,
        observacion: data.observacion,
        fechaHoraTomaConocimiento: data.fechaHoraTomaConocimiento,
        fechaDelHecho: data.fechaDelHecho,
        fechaIta: data.fechaIta,
        fechaPpp: data.fechaPpp,
        delitoId: data.delitoId,
        focoId: data.focoId,
        tribunalId: data.tribunalId,
        fiscalId: data.fiscalId,
        abogadoId: data.abogadoId,
        analistaId: data.analistaId,
        atvtId: data.atvtId,
        origenCausaId: data.origenCausaId || null,
        estadoCausaId: data.estadoCausaId || null,
        unidadPolicialId: unidadPolicialIdValue,
        oficialACargo: oficialACargoValue,
        esCrimenOrganizado: esCrimenOrganizadoValue
      }
    });

    console.log('Causa básica actualizada correctamente. Nuevos campos:', {
      origenCausaId: updatedCausa.origenCausaId,
      estadoCausaId: updatedCausa.estadoCausaId,
      unidadPolicialId: updatedCausa.unidadPolicialId,
      oficialACargo: updatedCausa.oficialACargo
    });

    // 2. Procesar parámetros de crimen organizado
    console.log('======= INICIO PROCESAMIENTO DE PARAMETROS EN PUT =======');
    
    // Eliminar relaciones existentes
    await prisma.causasCrimenOrganizado.deleteMany({
      where: { causaId: causaId }
    });
    console.log('Relaciones anteriores eliminadas');

    // Procesar nuevos parámetros
    const possibleParams = data.causasCrimenOrg || data.co || [];
    
    if (possibleParams && Array.isArray(possibleParams) && possibleParams.length > 0) {
      console.log('Procesando parámetros:', possibleParams);
      
      for (const paramItem of possibleParams) {
        try {
          let parametroId;
          
          if (typeof paramItem === 'object' && paramItem !== null) {
            parametroId = paramItem.value || paramItem.parametroId;
          } else {
            parametroId = paramItem;
          }
          
          const paramId = Number(parametroId);
          console.log(`Procesando parámetro: valor original=${parametroId}, convertido=${paramId}`);
          
          if (isNaN(paramId)) {
            console.error(`Valor inválido para parametroId: ${parametroId}`);
            continue;
          }
          
          // Verificar que el parámetro existe
          try {
            const paramExists = await prisma.crimenOrganizadoParams.findUnique({
              where: { value: paramId }
            });
            
            if (!paramExists) {
              console.error(`El parámetro con ID ${paramId} no existe en la base de datos`);
              continue;
            }
            
            console.log(`Parámetro ${paramId} verificado, existe en la base de datos`);
          } catch (checkError) {
            console.error(`Error al verificar parámetro ${paramId}:`, checkError);
            continue;
          }
          
          // Crear la relación
          try {
            const createdRelation = await prisma.causasCrimenOrganizado.create({
              data: {
                causaId: causaId,
                parametroId: paramId,
                estado: true
              }
            });
            
            console.log(`Relación actualizada exitosamente para parámetro ${paramId}`);
          } catch (createError) {
            console.error(`Error al crear relación para parámetro ${paramId}:`, createError);
          }
        } catch (paramError) {
          console.error(`Error general al procesar parámetro:`, paramError);
        }
      }
    } else {
      console.log('No se encontraron parámetros de crimen organizado para procesar');
    }
    
    console.log('======= FIN PROCESAMIENTO DE PARAMETROS EN PUT =======');

    // 3. Verificar las relaciones creadas
    try {
      const createdRelations = await prisma.causasCrimenOrganizado.findMany({
        where: { causaId: causaId }
      }) as any[];
      
      console.log(`Se encontraron ${createdRelations.length} relaciones actualizadas:`, createdRelations);
    } catch (checkError) {
      console.error('Error al verificar relaciones creadas:', checkError);
    }

    // 4. Obtener la causa completa actualizada
    const causaCompleta = await prisma.causa.findUnique({
      where: { id: causaId },
      include: {
        delito: true,
        abogado: true,
        analista: true,
        tribunal: true,
        foco: true,
        fiscal: {
          select: {
            nombre: true
          }
        },
        atvt: true,
        origenCausa: true,
        estadoCausa: true,
        unidadPolicial: true,
        _count: {
          select: {
            imputados: true
          }
        }
      }
    });

    // 5. Consultar parámetros de crimen organizado por separado
    const causasCrimenOrg = await prisma.causasCrimenOrganizado.findMany({
      where: { causaId: causaId }
    }) as any[];

    // 6. Combinar resultado final
    const resultado = {
      ...causaCompleta,
      causasCrimenOrg: causasCrimenOrg
    };

    console.log('DEBUG PUT - Causa actualizada completamente. Nuevos campos:', {
      origenCausaId: resultado.origenCausaId,
      estadoCausaId: resultado.estadoCausaId,
      unidadPolicialId: resultado.unidadPolicialId,
      oficialACargo: resultado.oficialACargo
    });

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error updating causa:', error);
    return NextResponse.json(
      { error: 'Error updating causa', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const causaId = parseInt(id);

    // Eliminar relaciones de parámetros CO primero
    await prisma.causasCrimenOrganizado.deleteMany({
      where: { causaId: causaId }
    });

    // Eliminar la causa
    await prisma.causa.delete({
      where: { id: causaId }
    });

    return NextResponse.json({}, { status: 204 });
  } catch (error) {
    console.error('Error deleting causa:', error);
    return NextResponse.json(
      { error: 'Error deleting causa' },
      { status: 500 }
    );
  }
}
