import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Interface para las condiciones de búsqueda
interface WhereClause {
  causaEcoh?: boolean;
  causaLegada?: boolean;
  homicidioConsumado?: boolean;
  esCrimenOrganizado?: number;
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
    const causaLegada = searchParams.get('causaLegada');
    const homicidioConsumado = searchParams.get('homicidioConsumado');
    const crimenorg = searchParams.get('esCrimenOrganizado');
    const yearParam = searchParams.get('year');
    
    // Función helper para crear filtro de fechas
    const createDateFilter = (year: number) => ({
      gte: new Date(year, 0, 1),
      lte: new Date(year, 11, 31, 23, 59, 59, 999)
    });

    // Validar año si está presente
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

    // Caso especial: conteo de crimen organizado
    if (crimenorg !== null) {
      const crimeOrgWhereClause: WhereClause = {
        esCrimenOrganizado: 0
      };
      
      // Añadir filtro de fechas si está presente
      if (yearFilter) {
        crimeOrgWhereClause.fechaDelHecho = yearFilter;
      }
      
      const totalCausas = await prisma.causa.count({
        where: crimeOrgWhereClause
      });
      
      return NextResponse.json({ count: totalCausas });
    }

    // Construir whereClause para casos normales
    const whereClause: WhereClause = {};

    // Aplicar filtros booleanos
    if (causaEcoh !== null) {
      whereClause.causaEcoh = causaEcoh === 'true';
    }

    if (causaLegada !== null) {
      whereClause.causaLegada = causaLegada === 'true';
    }

    if (homicidioConsumado !== null) {
      whereClause.homicidioConsumado = homicidioConsumado === 'true';
    }
    
    // Aplicar filtro de año
    if (yearFilter) {
      whereClause.fechaDelHecho = yearFilter;
    }

    // Ejecutar consulta
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
          },
          causasCrimenOrg: true
        }
      });

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
        }
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
    console.log('Datos recibidos:', JSON.stringify(data, null, 2));
    
    // Verificar específicamente causasCrimenOrg
    console.log('causasCrimenOrg específico:', data.causasCrimenOrg);
    
    // Crear causa con campos mínimos
    const newCausa = await prisma.causa.create({
      data: {
        denominacionCausa: data.denominacionCausa || '',
        causaEcoh: data.causaEcoh === true ? true : false
      }
    });
    
    console.log('Causa creada con ID:', newCausa.id);
    
    // Actualizar cada campo individualmente
    try {
      // Actualizar campos de texto
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
      
      // Actualizar campos booleanos
      if (data.causaLegada !== undefined) {
        await prisma.causa.update({
          where: { id: newCausa.id },
          data: { causaLegada: data.causaLegada === true ? true : false }
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
      
      // Actualizar fechas
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
      
      // Actualizar IDs de relaciones
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
      
      // Actualizar estado de crimen organizado
      if (data.esCrimenOrganizado !== undefined) {
        await prisma.causa.update({
          where: { id: newCausa.id },
          data: { 
            esCrimenOrganizado: data.esCrimenOrganizado === true ? 0 : 
                               data.esCrimenOrganizado === false ? 1 : 2
          }
        });
      }
      
      console.log('Campos actualizados correctamente');
    } catch (updateError) {
      console.error('Error al actualizar campos:', updateError);
    }
    
    // SECCIÓN DE CREACIÓN DE RELACIONES CON PARÁMETROS
    console.log('======= INICIO PROCESAMIENTO DE PARÁMETROS =======');
    
    // Verificar si causasCrimenOrg existe y es un array
    console.log('causasCrimenOrg en datos recibidos:', data.causasCrimenOrg);
    
    // Verificar estructura del modelo CrimenOrganizadoParams
    try {
      // Primero verificar campos disponibles en el modelo
      const sampleParam = await prisma.crimenOrganizadoParams.findFirst();
      console.log('Muestra de un parámetro en la BD:', sampleParam);
      
      // Ahora sí consultar todos los parámetros usando los campos correctos
      const availableParams = await prisma.crimenOrganizadoParams.findMany({
        select: { value: true, label: true }
      });
      console.log('Parámetros disponibles:', availableParams);
    } catch (modelError) {
      console.error('Error al consultar modelo CrimenOrganizadoParams:', modelError);
    }
    
    // Procesar parámetros de crimen organizado
    // Verificar todas las posibles ubicaciones del campo causasCrimenOrg
    const possibleParams = data.causasCrimenOrg || data.co || [];
    
    if (possibleParams && Array.isArray(possibleParams) && possibleParams.length > 0) {
      console.log('Procesando parámetros:', possibleParams);
      
      for (const paramItem of possibleParams) {
        try {
          // Manejar diferentes posibles formatos
          let parametroId;
          
          if (typeof paramItem === 'object' && paramItem !== null) {
            // Si es un objeto, podría ser { value: "123", label: "..." }
            parametroId = paramItem.value || paramItem.parametroId;
          } else {
            // Si no es un objeto, usar directamente
            parametroId = paramItem;
          }
          
          // Asegurarnos de que parametroId sea un número válido
          const paramId = Number(parametroId);
          console.log(`Procesando parámetro: valor original=${parametroId}, convertido=${paramId}`);
          
          if (isNaN(paramId)) {
            console.error(`Valor inválido para parametroId: ${parametroId}`);
            continue;
          }
          
          // Verificar si el parámetro existe
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
          
          // Intentar crear la relación
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
    
    // Verificar las relaciones creadas
    try {
      const createdRelations = await prisma.causasCrimenOrganizado.findMany({
        where: { causaId: newCausa.id }
      });
      
      console.log(`Se encontraron ${createdRelations.length} relaciones creadas:`, createdRelations);
    } catch (checkError) {
      console.error('Error al verificar relaciones creadas:', checkError);
    }
    
    // Recuperar la causa completa con todas sus relaciones
    const causaCompleta = await prisma.causa.findUnique({
      where: { id: newCausa.id },
      include: {
        delito: true,
        fiscal: true,
        abogado: true,
        analista: true,
        atvt: true,
        causasCrimenOrg: {
          include: {
            parametro: true
          }
        }
      }
    });
    
    return NextResponse.json(causaCompleta, { status: 201 });
  } catch (error) {
    console.error('Error al crear o actualizar causa:', error);
    
    // Verificar si el error es una instancia de Error
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return NextResponse.json(
      { error: 'Error al procesar la solicitud', details: errorMessage },
      { status: 500 }
    );
  }
}