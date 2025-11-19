import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {    
    const { id } = await params;
    console.log('ðŸ” DEBUG GET - Iniciando consulta para ID:', id);
    
    // âœ… PASO 1: Probar consulta bÃ¡sica de causa
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
          estadoCausa: true
        }
      });
      console.log('ðŸ” DEBUG GET - Causa bÃ¡sica obtenida exitosamente');
    } catch (causaError) {
      console.error('âŒ ERROR al obtener causa bÃ¡sica:', causaError);
      throw causaError;
    }

    if (!causa) {
      console.log('âŒ Causa no encontrada con ID:', id);
      return NextResponse.json(
        { error: 'Causa no encontrada' },
        { status: 404 }
      );
    }

    // âœ… PASO 2: Consulta de parÃ¡metros CO
    let causasCrimenOrg: any[] = [];
    
    try {
      console.log('ðŸ” DEBUG GET - Consultando parÃ¡metros de crimen organizado...');
      causasCrimenOrg = await prisma.causasCrimenOrganizado.findMany({
        where: { causaId: parseInt(id) },
        include: {
          parametro: true
        }
      }) as any[];
      console.log('âœ… ParÃ¡metros CO obtenidos:', causasCrimenOrg.length, 'registros');
    } catch (includeError) {
      console.error('âŒ ERROR con parÃ¡metros CO:', includeError);
      
      // Intento fallback sin include
      try {
        causasCrimenOrg = await prisma.causasCrimenOrganizado.findMany({
          where: { causaId: parseInt(id) }
        }) as any[];
        console.log('âœ… ParÃ¡metros CO sin include:', causasCrimenOrg.length, 'registros');
      } catch (basicError) {
        console.error('âŒ ERROR consulta bÃ¡sica de parÃ¡metros CO:', basicError);
        causasCrimenOrg = [];
      }
    }

    // âœ… PASO 3: Construir respuesta incluyendo causaSacfi
    const causaCompleta = {
      ...causa,
      causasCrimenOrg: causasCrimenOrg
    };
    
    console.log('ðŸ” DEBUG GET - Respuesta final construida. Nuevos campos:', {
      origenCausaId: causa.origenCausaId,
      estadoCausaId: causa.estadoCausaId
    });
    
    return NextResponse.json(causaCompleta);
  } catch (error) {
    console.error('âŒ ERROR GENERAL en GET causa:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('âŒ Detalles del error:', errorMessage);
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

    console.log('ðŸ” DEBUG PUT - Received data:', data);
    console.log('ðŸ” DEBUG PUT - origenCausaId:', data.origenCausaId);
    console.log('ðŸ” DEBUG PUT - estadoCausaId:', data.estadoCausaId);
    console.log('ðŸ” DEBUG PUT - causasCrimenOrg:', data.causasCrimenOrg);

    
    const esCrimenOrganizadoValue = data.esCrimenOrganizado === true;

      

    const updatedCausa = await prisma.causa.update({
      where: { id: causaId },
      data: {
        constituyeSs: data.constituyeSs,
        homicidioConsumado: data.homicidioConsumado ?? false,
        denominacionCausa: data.denominacionCausa,
        ruc: data.ruc,
        foliobw: data.foliobw,
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
        esCrimenOrganizado: esCrimenOrganizadoValue
      }
    });

    console.log('Causa bÃ¡sica actualizada correctamente. Nuevos campos:', {
      origenCausaId: updatedCausa.origenCausaId,
      estadoCausaId: updatedCausa.estadoCausaId
    });

    // âœ… 2. Procesar parÃ¡metros de crimen organizado
    console.log('======= INICIO PROCESAMIENTO DE PARÃMETROS EN PUT =======');
    
    // Eliminar relaciones existentes
    await prisma.causasCrimenOrganizado.deleteMany({
      where: { causaId: causaId }
    });
    console.log('Relaciones anteriores eliminadas');

    // Procesar nuevos parÃ¡metros
    const possibleParams = data.causasCrimenOrg || data.co || [];
    
    if (possibleParams && Array.isArray(possibleParams) && possibleParams.length > 0) {
      console.log('Procesando parÃ¡metros:', possibleParams);
      
      for (const paramItem of possibleParams) {
        try {
          let parametroId;
          
          if (typeof paramItem === 'object' && paramItem !== null) {
            parametroId = paramItem.value || paramItem.parametroId;
          } else {
            parametroId = paramItem;
          }
          
          const paramId = Number(parametroId);
          console.log(`Procesando parÃ¡metro: valor original=${parametroId}, convertido=${paramId}`);
          
          if (isNaN(paramId)) {
            console.error(`Valor invÃ¡lido para parametroId: ${parametroId}`);
            continue;
          }
          
          // Verificar que el parÃ¡metro existe
          try {
            const paramExists = await prisma.crimenOrganizadoParams.findUnique({
              where: { value: paramId }
            });
            
            if (!paramExists) {
              console.error(`El parÃ¡metro con ID ${paramId} no existe en la base de datos`);
              continue;
            }
            
            console.log(`ParÃ¡metro ${paramId} verificado, existe en la base de datos`);
          } catch (checkError) {
            console.error(`Error al verificar parÃ¡metro ${paramId}:`, checkError);
            continue;
          }
          
          // Crear la relaciÃ³n
          try {
            const createdRelation = await prisma.causasCrimenOrganizado.create({
              data: {
                causaId: causaId,
                parametroId: paramId,
                estado: true
              }
            });
            
            console.log(`RelaciÃ³n actualizada exitosamente para parÃ¡metro ${paramId}`);
          } catch (createError) {
            console.error(`Error al crear relaciÃ³n para parÃ¡metro ${paramId}:`, createError);
          }
        } catch (paramError) {
          console.error(`Error general al procesar parÃ¡metro:`, paramError);
        }
      }
    } else {
      console.log('No se encontraron parÃ¡metros de crimen organizado para procesar');
    }
    
    console.log('======= FIN PROCESAMIENTO DE PARÃMETROS EN PUT =======');

    // âœ… 3. Verificar las relaciones creadas
    try {
      const createdRelations = await prisma.causasCrimenOrganizado.findMany({
        where: { causaId: causaId }
      }) as any[];
      
      console.log(`Se encontraron ${createdRelations.length} relaciones actualizadas:`, createdRelations);
    } catch (checkError) {
      console.error('Error al verificar relaciones creadas:', checkError);
    }

    // âœ… 4. Obtener la causa completa actualizada
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
        _count: {
          select: {
            imputados: true
          }
        }
      }
    });

    // âœ… 5. Consultar parÃ¡metros de crimen organizado por separado
    const causasCrimenOrg = await prisma.causasCrimenOrganizado.findMany({
      where: { causaId: causaId }
    }) as any[];

    // âœ… 6. Combinar resultado final
    const resultado = {
      ...causaCompleta,
      causasCrimenOrg: causasCrimenOrg
    };

    console.log('ðŸ” DEBUG PUT - Causa actualizada completamente. Nuevos campos:', {
      origenCausaId: resultado.origenCausaId,
      estadoCausaId: resultado.estadoCausaId
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

    // âœ… Eliminar relaciones de parÃ¡metros CO primero
    await prisma.causasCrimenOrganizado.deleteMany({
      where: { causaId: causaId }
    });

    // âœ… Eliminar la causa
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