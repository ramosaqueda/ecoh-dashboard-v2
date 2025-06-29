import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {    
    const { id } = await params;
    console.log('🔍 DEBUG GET - Iniciando consulta para ID:', id);
    
    // ✅ PASO 1: Probar consulta básica de causa
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
          abogado: true
        }
      });
      console.log('🔍 DEBUG GET - Causa básica obtenida exitosamente');
    } catch (causaError) {
      console.error('❌ ERROR al obtener causa básica:', causaError);
      throw causaError;
    }

    if (!causa) {
      console.log('❌ Causa no encontrada con ID:', id);
      return NextResponse.json(
        { error: 'Causa no encontrada' },
        { status: 404 }
      );
    }

    // ✅ PASO 2: Probar consulta de parámetros CO - con múltiples intentos
    let causasCrimenOrg = [];
    
    // Intento 1: Con include parametro
    try {
      console.log('🔍 DEBUG GET - Intentando consulta con include parametro...');
      causasCrimenOrg = await prisma.causasCrimenOrganizado.findMany({
        where: { causaId: parseInt(id) },
        include: {
          parametro: true
        }
      });
      console.log('✅ Consulta con include parametro exitosa:', causasCrimenOrg.length, 'registros');
    } catch (includeError) {
      console.error('❌ ERROR con include parametro:', includeError);
      
      // Intento 2: Sin include
      try {
        console.log('🔍 DEBUG GET - Intentando consulta sin include...');
        causasCrimenOrg = await prisma.causasCrimenOrganizado.findMany({
          where: { causaId: parseInt(id) }
        });
        console.log('✅ Consulta sin include exitosa:', causasCrimenOrg.length, 'registros');
      } catch (basicError) {
        console.error('❌ ERROR consulta básica de parámetros CO:', basicError);
        
        // Intento 3: Verificar si la tabla existe
        try {
          console.log('🔍 DEBUG GET - Verificando estructura de tabla...');
          const testQuery = await prisma.$queryRaw`SELECT * FROM CausasCrimenOrganizado LIMIT 1`;
          console.log('✅ Tabla CausasCrimenOrganizado existe, muestra:', testQuery);
        } catch (tableError) {
          console.error('❌ ERROR: La tabla CausasCrimenOrganizado no existe o tiene diferente nombre:', tableError);
        }
        
        // Si todo falla, continuar sin parámetros CO
        causasCrimenOrg = [];
      }
    }

    // ✅ PASO 3: Construir respuesta
    const causaCompleta = {
      ...causa,
      causasCrimenOrg: causasCrimenOrg
    };
    
    console.log('🔍 DEBUG GET - Respuesta final construida con', causasCrimenOrg.length, 'parámetros CO');
    
    return NextResponse.json(causaCompleta);
  } catch (error) {
    console.error('❌ ERROR GENERAL en GET causa:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Detalles del error:', errorMessage);
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

    console.log('🔍 DEBUG PUT - Received data:', data);
    console.log('🔍 DEBUG PUT - causasCrimenOrg:', data.causasCrimenOrg);

    // ✅ 1. Actualizar la causa principal (campos básicos)
    
    // ✅ FIX: Convertir esCrimenOrganizado a booleano (igual que en POST)
    let esCrimenOrganizadoValue: boolean | null = null;
    if (data.esCrimenOrganizado !== undefined) {
      if (data.esCrimenOrganizado === true || data.esCrimenOrganizado === 1 || data.esCrimenOrganizado === '1') {
        esCrimenOrganizadoValue = true;
      } else if (data.esCrimenOrganizado === false || data.esCrimenOrganizado === 0 || data.esCrimenOrganizado === '0') {
        esCrimenOrganizadoValue = false;
      } else {
        esCrimenOrganizadoValue = false; // default para valor "2" (Se desconoce)
      }
    }

    const updatedCausa = await prisma.causa.update({
      where: { id: causaId },
      data: {
        causaEcoh: data.causaEcoh,
        causaLegada: data.causaLegada,
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
        esCrimenOrganizado: esCrimenOrganizadoValue  // ✅ Usar el valor convertido
      }
    });

    console.log('Causa básica actualizada correctamente');

    // ✅ 2. Procesar parámetros de crimen organizado (EXACTA LÓGICA DEL POST)
    console.log('======= INICIO PROCESAMIENTO DE PARÁMETROS EN PUT =======');
    
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
    
    console.log('======= FIN PROCESAMIENTO DE PARÁMETROS EN PUT =======');

    // ✅ 3. Verificar las relaciones creadas
    try {
      const createdRelations = await prisma.causasCrimenOrganizado.findMany({
        where: { causaId: causaId }
      });
      
      console.log(`Se encontraron ${createdRelations.length} relaciones actualizadas:`, createdRelations);
    } catch (checkError) {
      console.error('Error al verificar relaciones creadas:', checkError);
    }

    // ✅ 4. Obtener la causa completa actualizada
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
        _count: {
          select: {
            imputados: true
          }
        }
      }
    });

    // ✅ 5. Consultar parámetros de crimen organizado por separado
    const causasCrimenOrg = await prisma.causasCrimenOrganizado.findMany({
      where: { causaId: causaId }
    });

    // ✅ 6. Combinar resultado final
    const resultado = {
      ...causaCompleta,
      causasCrimenOrg: causasCrimenOrg
    };

    console.log('🔍 DEBUG PUT - Causa actualizada completamente:', resultado);

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

    // ✅ Eliminar relaciones de parámetros CO primero
    await prisma.causasCrimenOrganizado.deleteMany({
      where: { causaId: causaId }
    });

    // ✅ Eliminar la causa
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