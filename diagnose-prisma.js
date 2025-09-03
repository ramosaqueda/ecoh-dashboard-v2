// Diagnóstico de Prisma
import { PrismaClient } from '@prisma/client';

async function diagnose() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Probando conexión básica...');
    await prisma.$connect();
    console.log('✅ Conexión a base de datos exitosa');
    
    console.log('🔍 Probando consulta simple de causas...');
    const causaCount = await prisma.causa.count();
    console.log(`✅ Hay ${causaCount} causas en la base de datos`);
    
    console.log('🔍 Probando estructura de la tabla causa...');
    const primeraCausa = await prisma.causa.findFirst({
      select: {
        id: true,
        denominacionCausa: true,
        origenCausaId: true,
        estadoCausaId: true
      }
    });
    console.log('✅ Estructura de causa:', primeraCausa);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
