import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fiscalId: string }> }
) {
  try {
    const { fiscalId: fiscalIdStr } = await params;
    const fiscalId = parseInt(fiscalIdStr);
    if (isNaN(fiscalId)) {
      return NextResponse.json({ error: 'Invalid fiscal ID' }, { status: 400 });
    }

    const assignments = await prisma.fiscalDiligencia.findMany({
      where: { fiscalId },
      select: { diligenciaId: true }
    });

    return NextResponse.json(assignments.map(a => a.diligenciaId));
  } catch (error) {
    console.error('Error fetching fiscal diligencias:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ fiscalId: string }> }
) {
  try {
    const { fiscalId: fiscalIdStr } = await params;
    const fiscalId = parseInt(fiscalIdStr);
    if (isNaN(fiscalId)) {
      return NextResponse.json({ error: 'Invalid fiscal ID' }, { status: 400 });
    }

    const body = await request.json();
    const { diligenciaIds } = body;

    if (!Array.isArray(diligenciaIds)) {
      return NextResponse.json({ error: 'diligenciaIds must be an array' }, { status: 400 });
    }

    // Transaction to replace assignments
    await prisma.$transaction(async (tx) => {
      // 1. Delete existing assignments
      await tx.fiscalDiligencia.deleteMany({
        where: { fiscalId }
      });

      // 2. Create new assignments
      if (diligenciaIds.length > 0) {
        await tx.fiscalDiligencia.createMany({
          data: diligenciaIds.map((id: number) => ({
            fiscalId,
            diligenciaId: id
          }))
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating fiscal diligencias:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
