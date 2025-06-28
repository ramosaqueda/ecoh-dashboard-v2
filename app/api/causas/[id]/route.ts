import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {    
    const { id } = await params;
    const causa = await prisma.causa.findUnique({
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
        // ✅ FIX: Agregar atvt al include
        atvt: true,
        abogado: true // ✅ También agregar abogado que faltaba
      }
      
    });
    console.log('🔍 DEBUG GET - Causa obtenida:', causa);
    console.log('🔍 DEBUG GET - ATVT en causa:', causa?.atvt);
    return NextResponse.json(causa);
  } catch (error) {
    console.error('Error fetching causa:', error);
    return NextResponse.json(
      { error: 'Error fetching causa' },
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

    console.log('🔍 DEBUG PUT - Received data:', data);
    console.log('🔍 DEBUG PUT - atvtId en data:', data.atvtId);
    console.log('🔍 DEBUG PUT - Updating causa with ID:', id);

    const updatedCausa = await prisma.causa.update({
      where: { id: parseInt(id) },
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
        // ✅ FIX PRINCIPAL: Agregar atvtId que faltaba
        atvtId: data.atvtId
      },
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
        // ✅ FIX: Agregar atvt al include del response
        atvt: true,
        _count: {
          select: {
            imputados: true
          }
        }
      }
    });

    console.log('🔍 DEBUG PUT - Causa actualizada:', updatedCausa);
    console.log('🔍 DEBUG PUT - ATVT en causa actualizada:', updatedCausa.atvt);

    return NextResponse.json(updatedCausa);
  } catch (error) {
    console.error('Error updating causa:', error);
    return NextResponse.json(
      { error: 'Error updating causa' },
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

    await prisma.causa.delete({
      where: { id: parseInt(id) }
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