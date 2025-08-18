import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ✅ Interface actualizada para incluir origenCausa
interface WhereClause {
  origenCausaId?: number; // Nuevo campo relacional
  // DEPRECATED: Mantener para compatibilidad temporal
  causaEcoh?: boolean;
  causaSacfi?: boolean;
  causaLegada?: boolean;
  homicidioConsumado?: boolean;
  esCrimenOrganizado?: boolean;
  fechaDelHecho?: {
    gte: Date;
    lte: Date;
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const count = searchParams.get('count');
    const causaEcoh = searchParams.get('causaEcoh');
    const causaSacfi = searchParams.get('causaSacfi');
    const causaLegada = searchParams.get('causaLegada');
    const origenCausaId = searchParams.get('origenCausaId'); // Nuevo parámetro
    const homicidioConsumado = searchParams.get('homicidioConsumado');
    const crimenorg = searchParams.get('esCrimenOrganizado');
    const yearParam = searchParams.get('year');
    
    // ✅ Función helper para crear filtro de fechas
    const createDateFilter = (year: number) => ({
      gte: new Date(year, 0, 1),
      lte: new Date(year, 11, 31, 23, 59, 59, 999)
    });

    // ✅ Validar año si está presente
    let yearFilter = null;
    if (yearParam && yearParam !== 'todos') {
      const year = parseInt(yearParam);
      if (isNaN(year)) {
        return NextResponse.json(
          { error: 'El parámetro year debe ser un número válido' },
          { status: 400 }
        );
      }
      yearFilter = createDateFilter(year);
    }

    // ✅ Caso especial para crimen organizado
    if (crimenorg !== null) {
      const crimeOrgWhereClause: WhereClause = {
        esCrimenOrganizado: false
      };
      
      if (yearFilter) {
        crimeOrgWhereClause.fechaDelHecho = yearFilter;
      }
      
      const totalCausas = await prisma.causa.count({
        where: crimeOrgWhereClause
      });
      
      return NextResponse.json({ count: totalCausas });
    }

    // ✅ Construir whereClause incluyendo origenCausa
    const whereClause: WhereClause = {};

    // Nuevo filtro por origen de causa (preferido)
    if (origenCausaId !== null && origenCausaId !== undefined) {
      whereClause.origenCausaId = parseInt(origenCausaId);
    } else {
      // DEPRECATED: Filtros antiguos para compatibilidad
      if (causaEcoh !== null) {
        whereClause.causaEcoh = causaEcoh === 'true';
      }

      if (causaSacfi !== null) {
        whereClause.causaSacfi = causaSacfi === 'true';
      }

      if (causaLegada !== null) {
        whereClause.causaLegada = causaLegada === 'true';
      }
    }

    if (homicidioConsumado !== null) {
      whereClause.homicidioConsumado = homicidioConsumado === 'true';
    }
    
    if (yearFilter) {
      whereClause.fechaDelHecho = yearFilter;
    }

    // ✅ Ejecutar consulta
    if (count === 'true') {
      console.log('Contando causas con filtros:', whereClause);
      const totalCausas = await prisma.causa.count({
        where: whereClause
      });
      return NextResponse.json({ count: totalCausas });
    } else {
      const causas = await prisma.causa.findMany({
        where: whereClause,
        include: {
          origenCausa: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
              color: true
            }
          },
          fiscal: {
            select: {
              id: true,
              nombre: true
            }
          },
          delito: {
            select: {
              id: true,
              nombre: true
            }
          },
          abogado: {
            select: {
              id: true,
              nombre: true
            }
          },
          analista: {
            select: {
              id: true,
              nombre: true
            }
          },
          atvt: {
            select: {
              id: true,
              nombre: true
            }
          },
          _count: {
            select: {
              imputados: true,
              causasRelacionadasMadre: true,
              causasRelacionadasArista: true
            }
          }
        }
      });

      // ✅ Consulta separada para parámetros de crimen organizado
      const causasIds = causas.map(causa => causa.id);
      const crimenOrgRelations = causasIds.length > 0 
        ? await prisma.causasCrimenOrganizado.findMany({
            where: { causaId: { in: causasIds } }
          })
        : [];

      // ✅ Formatear causas
      const formattedCausas = causas.map((causa) => ({
        ...causa,
        fiscal: causa.fiscal
          ? {
              id: causa.fiscal.id,
              nombre: causa.fiscal.nombre
            }
          : null,
        delito: causa.delito
          ? {
              id: causa.delito.id,
              nombre: causa.delito.nombre
            }
          : null,
        _count: {
          imputados: causa._count?.imputados || 0,
          causasRelacionadasMadre: causa._count?.causasRelacionadasMadre || 0,
          causasRelacionadasArista: causa._count?.causasRelacionadasArista || 0
        },
        causasCrimenOrg: crimenOrgRelations.filter(rel => rel.causaId === causa.id)
      }));

      return NextResponse.json(formattedCausas);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error fetching causas:', errorMessage);
    return NextResponse.json(
      { error: 'Error fetching causas', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log('🔍 Datos recibidos en POST causas:', JSON.stringify(data, null, 2));
    
    // ✅ DEBUG: Verificar específicamente origenCausaId
    console.log('🎯 origenCausaId recibido:', {
      valor: data.origenCausaId,
      tipo: typeof data.origenCausaId,
      esNull: data.origenCausaId === null,
      esUndefined: data.origenCausaId === undefined,
      esString: typeof data.origenCausaId === 'string',
      esNumber: typeof data.origenCausaId === 'number'
    });
    
    // ✅ Procesar y validar origenCausaId
    let origenCausaIdProcessed = null;
    if (data.origenCausaId !== undefined && data.origenCausaId !== null && data.origenCausaId !== '') {
      if (typeof data.origenCausaId === 'string') {
        origenCausaIdProcessed = parseInt(data.origenCausaId, 10);
        if (isNaN(origenCausaIdProcessed)) {
          console.warn('⚠️ origenCausaId no se pudo convertir a número:', data.origenCausaId);
          origenCausaIdProcessed = null;
        }
      } else if (typeof data.origenCausaId === 'number') {
        origenCausaIdProcessed = data.origenCausaId;
      }
    }
    
    console.log('🎯 origenCausaId procesado:', origenCausaIdProcessed);
    
    // ✅ Verificar si el origen existe antes de crear la causa
    if (origenCausaIdProcessed) {
      const origenExists = await prisma.origenCausa.findUnique({
        where: { id: origenCausaIdProcessed }
      });
      
      if (!origenExists) {
        console.error('❌ El origen de causa no existe:', origenCausaIdProcessed);
        return NextResponse.json(
          { error: `El origen de causa con ID ${origenCausaIdProcessed} no existe` },
          { status: 400 }
        );
      }
      
      console.log('✅ Origen de causa validado:', origenExists);
    }
    
    // ✅ Verificar específicamente causasCrimenOrg
    console.log('causasCrimenOrg específico:', data.causasCrimenOrg);
    
    // ✅ Crear causa con relación de origen MEJORADA
    const causaData = {
      denominacionCausa: data.denominacionCausa || '',
      // NUEVO: Campo procesado y validado
      origenCausaId: origenCausaIdProcessed,
      // DEPRECATED: Mantener campos antiguos para compatibilidad temporal
      causaEcoh: data.causaEcoh === true ? true : false,
      causaSacfi: data.causaSacfi === true ? true : false,
      causaLegada: data.causaLegada === true ? true : false
    };
    
    console.log('🏗️ Datos para crear causa:', causaData);
    
    const newCausa = await prisma.causa.create({
      data: causaData
    });
    
    console.log('✅ Causa creada exitosamente:', {
      id: newCausa.id,
      origenCausaId: newCausa.origenCausaId,
      denominacionCausa: newCausa.denominacionCausa
    });
    
    // ✅ Actualizar cada campo individualmente
    try {
      // ✅ REMOVIDO: No actualizar origenCausaId de nuevo, ya se creó correctamente
      // Ya no necesitamos esta actualización porque lo creamos correctamente arriba
      
      // ✅ Actualizar campos de texto
      if (data.ruc !== undefined) {
        await prisma.causa.update({
          where: { id: newCausa.id },
          data: { ruc: data.ruc || '' }
        });
      }
      
      if (data.foliobw !== undefined) {
        await prisma.causa.update({
          where: { id: newCausa.id },
          data: { foliobw: data.foliobw || '' }
        });
      }
      
      // ✅ Actualizar campos booleanos incluyendo causaSacfi
      if (data.causaLegada !== undefined) {
        await prisma.causa.update({
          where: { id: newCausa.id },
          data: { causaLegada: data.causaLegada === true ? true : false }
        });
      }

      // ✅ Campo causaSacfi ya fue creado inicialmente, pero se puede actualizar si es necesario
      if (data.causaSacfi !== undefined) {
        await prisma.causa.update({
          where: { id: newCausa.id },
          data: { causaSacfi: data.causaSacfi === true ? true : false }
        });
      }
      
      if (data.constituyeSs !== undefined) {
        await prisma.causa.update({
          where: { id: newCausa.id },
          data: { constituyeSs: data.constituyeSs === true ? true : false }
        });
      }
      
      if (data.homicidioConsumado !== undefined) {
        await prisma.causa.update({
          where: { id: newCausa.id },
          data: { homicidioConsumado: data.homicidioConsumado === true ? true : false }
        });
      }
      
      // ✅ Actualizar fechas
      if (data.fechaHoraTomaConocimiento) {
        await prisma.causa.update({
          where: { id: newCausa.id },
          data: { fechaHoraTomaConocimiento: new Date(data.fechaHoraTomaConocimiento) }
        });
      }
      
      if (data.fechaDelHecho) {
        await prisma.causa.update({
          where: { id: newCausa.id },
          data: { fechaDelHecho: new Date(data.fechaDelHecho) }
        });
      }
      
      // ✅ Actualizar IDs de relaciones
      if (data.delito || data.delitoId) {
        await prisma.causa.update({
          where: { id: newCausa.id },
          data: { delitoId: Number(data.delitoId || data.delito || 0) }
        });
      }
      
      if (data.fiscalACargo || data.fiscalId) {
        await prisma.causa.update({
          where: { id: newCausa.id },
          data: { fiscalId: Number(data.fiscalId || data.fiscalACargo) }
        });
      }
      
      if (data.abogado || data.abogadoId) {
        await prisma.causa.update({
          where: { id: newCausa.id },
          data: { abogadoId: Number(data.abogadoId || data.abogado) }
        });
      }
      
      if (data.analista || data.analistaId) {
        await prisma.causa.update({
          where: { id: newCausa.id },
          data: { analistaId: Number(data.analistaId || data.analista) }
        });
      }
      
      if (data.atvt || data.atvtId) {
        await prisma.causa.update({
          where: { id: newCausa.id },
          data: { atvtId: Number(data.atvtId || data.atvt) }
        });
      }
      
      // ✅ Actualizar esCrimenOrganizado
      if (data.esCrimenOrganizado !== undefined) {
        let boolValue: boolean;
        if (data.esCrimenOrganizado === true || data.esCrimenOrganizado === 1 || data.esCrimenOrganizado === '1') {
          boolValue = true;
        } else if (data.esCrimenOrganizado === false || data.esCrimenOrganizado === 0 || data.esCrimenOrganizado === '0') {
          boolValue = false;
        } else {
          boolValue = false; // default
        }
        
        await prisma.causa.update({
          where: { id: newCausa.id },
          data: { esCrimenOrganizado: boolValue }
        });
      }
      
      console.log('Campos actualizados correctamente');
    } catch (updateError) {
      console.error('Error al actualizar campos:', updateError);
    }
    
    // ✅ SECCIÓN DE CREACIÓN DE RELACIONES CON PARÁMETROS
    console.log('======= INICIO PROCESAMIENTO DE PARÁMETROS =======');
    
    console.log('causasCrimenOrg en datos recibidos:', data.causasCrimenOrg);
    
    // ✅ Verificar estructura del modelo CrimenOrganizadoParams
    try {
      const sampleParam = await prisma.crimenOrganizadoParams.findFirst();
      console.log('Muestra de un parámetro en la BD:', sampleParam);
      
      const availableParams = await prisma.crimenOrganizadoParams.findMany({
        select: { value: true, label: true }
      });
      console.log('Parámetros disponibles:', availableParams);
    } catch (modelError) {
      console.error('Error al consultar modelo CrimenOrganizadoParams:', modelError);
    }
    
    // ✅ Procesar parámetros de crimen organizado
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
          
          try {
            const createdRelation = await prisma.causasCrimenOrganizado.create({
              data: {
                causaId: newCausa.id,
                parametroId: paramId,
                estado: true
              }
            });
            
            console.log(`Relación creada exitosamente para parámetro ${paramId}`);
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
    
    console.log('======= FIN PROCESAMIENTO DE PARÁMETROS =======');
    
    // ✅ Verificar las relaciones creadas
    try {
      const createdRelations = await prisma.causasCrimenOrganizado.findMany({
        where: { causaId: newCausa.id }
      });
      
      console.log(`Se encontraron ${createdRelations.length} relaciones creadas:`, createdRelations);
    } catch (checkError) {
      console.error('Error al verificar relaciones creadas:', checkError);
    }
    
    // ✅ Verificar que la causa se guardó con el origen correcto
    const causaVerificacion = await prisma.causa.findUnique({
      where: { id: newCausa.id },
      select: {
        id: true,
        origenCausaId: true,
        origenCausa: {
          select: {
            id: true,
            nombre: true,
            codigo: true
          }
        }
      }
    });
    
    console.log('🔍 Verificación final de la causa creada:', causaVerificacion);
    
    if (origenCausaIdProcessed && !causaVerificacion?.origenCausaId) {
      console.error('❌ ERROR CRÍTICO: El origenCausaId no se guardó correctamente');
    } else if (origenCausaIdProcessed && causaVerificacion?.origenCausaId) {
      console.log('✅ origenCausaId guardado exitosamente');
    }
    
    // ✅ Consultar causa completa con origen
    const causaCompleta = await prisma.causa.findUnique({
      where: { id: newCausa.id },
      include: {
        origenCausa: true,
        delito: true,
        fiscal: true,
        abogado: true,
        analista: true,
        atvt: true
      }
    });
    
    // ✅ Consultar relaciones por separado
    const causasCrimenOrg = await prisma.causasCrimenOrganizado.findMany({
      where: { causaId: newCausa.id }
    });
    
    // ✅ Combinar resultado final
    const resultado = {
      ...causaCompleta,
      causasCrimenOrg: causasCrimenOrg
    };
    
    return NextResponse.json(resultado, { status: 201 });
  } catch (error) {
    console.error('Error al crear o actualizar causa:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return NextResponse.json(
      { error: 'Error al procesar la solicitud', details: errorMessage },
      { status: 500 }
    );
  }
}