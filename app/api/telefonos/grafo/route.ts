import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch all connections between phones and causes
    const connections = await prisma.telefonoCausa.findMany({
      include: {
        causa: {
          select: {
            id: true,
            ruc: true,
            denominacionCausa: true,
          }
        },
        telefono: {
          select: {
            id: true,
            numeroTelefonico: true,
            imei: true,
            abonado: true,
            proveedorServicio: {
              select: { nombre: true }
            }
          }
        }
      }
    });

    const nodes = new Map();
    const links: any[] = [];

    connections.forEach(conn => {
      // Add Causa Node
      const causaId = `C-${conn.causa.id}`;
      if (!nodes.has(causaId)) {
        nodes.set(causaId, {
          id: causaId,
          group: 'causa',
          label: conn.causa.ruc || 'S/RUC',
          title: conn.causa.denominacionCausa,
          val: 20 // Size
        });
      }

      // Add Telefono Node
      const telefonoId = `T-${conn.telefono.id}`;
      if (!nodes.has(telefonoId)) {
        nodes.set(telefonoId, {
          id: telefonoId,
          group: 'telefono',
          label: conn.telefono.numeroTelefonico || conn.telefono.imei || 'S/N',
          title: `Abonado: ${conn.telefono.abonado || 'N/A'} - ${conn.telefono.proveedorServicio?.nombre || 'Sin Proveedor'}`,
          val: 10 // Size
        });
      }

      // Add Link
      links.push({
        source: causaId,
        target: telefonoId
      });
    });

    return NextResponse.json({
      nodes: Array.from(nodes.values()),
      links
    });

  } catch (error) {
    console.error('Error fetching graph data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
