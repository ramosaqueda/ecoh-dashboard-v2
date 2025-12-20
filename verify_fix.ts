
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing query...');
    const result = await prisma.causa.findMany({
      take: 1,
      include: {
        Fiscal: { select: { id: true, nombre: true } },
        Delito: { select: { id: true, nombre: true } },
        Abogado: { select: { id: true, nombre: true } },
        Analista: { select: { id: true, nombre: true } },
        Atvt: { select: { id: true, nombre: true } },
        origenes_causa: { select: { id: true, nombre: true, color: true } },
        estados_causa: { select: { id: true, nombre: true, codigo: true, color: true } },
        _count: {
            select: {
              CausasImputados: true, 
              CausasRelacionadas_CausasRelacionadas_causaMadreIdToCausa: true,
              CausasRelacionadas_CausasRelacionadas_causaAristaIdToCausa: true
            }
          }
      }
    });
    console.log('Query successful! Count:', result.length);
    if(result.length > 0) {
        console.log('Sample keys:', Object.keys(result[0]));
        // console.log('Sample fiscal:', result[0].Fiscal);
    }
  } catch (e) {
    console.error('Query failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
