const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateCausaData() {
  try {
    console.log('🔄 Iniciando migración de datos de causas...');
    
    // 1. Verificar datos existentes
    const totalCausas = await prisma.causa.count();
    const causasEcoh = await prisma.causa.count({ where: { causaEcoh: true } });
    const causasSacfi = await prisma.causa.count({ where: { causaSacfi: true } });
    const causasLegada = await prisma.causa.count({ where: { causaLegada: true } });
    
    console.log('📊 Estado inicial:');
    console.log(`  Total causas: ${totalCausas}`);
    console.log(`  Causas ECOH: ${causasEcoh}`);
    console.log(`  Causas SACFI: ${causasSacfi}`);
    console.log(`  Causas Legada: ${causasLegada}`);
    
    // 2. Obtener IDs de orígenes
    const origenEcoh = await prisma.origenCausa.findFirst({ where: { nombre: 'ECOH Elqui' } });
    const origenSacfi = await prisma.origenCausa.findFirst({ where: { nombre: 'SACFI' } });
    const origenLegada = await prisma.origenCausa.findFirst({ where: { nombre: 'Otras Fiscalías' } });
    
    if (!origenEcoh || !origenSacfi || !origenLegada) {
      throw new Error('Faltan registros de orígenes de causa. Ejecuta primero el script de verificación.');
    }
    
    console.log('📋 Orígenes encontrados:');
    console.log(`  ECOH Elqui: ID ${origenEcoh.id}`);
    console.log(`  SACFI: ID ${origenSacfi.id}`);
    console.log(`  Otras Fiscalías: ID ${origenLegada.id}`);
    
    // 3. Migrar causas ECOH
    console.log('🔄 Migrando causas ECOH...');
    const resultEcoh = await prisma.causa.updateMany({
      where: { causaEcoh: true },
      data: { origenCausaId: origenEcoh.id }
    });
    console.log(`✅ ${resultEcoh.count} causas ECOH migradas`);
    
    // 4. Migrar causas SACFI
    console.log('🔄 Migrando causas SACFI...');
    const resultSacfi = await prisma.causa.updateMany({
      where: { causaSacfi: true },
      data: { origenCausaId: origenSacfi.id }
    });
    console.log(`✅ ${resultSacfi.count} causas SACFI migradas`);
    
    // 5. Migrar causas Legada
    console.log('🔄 Migrando causas Legada...');
    const resultLegada = await prisma.causa.updateMany({
      where: { causaLegada: true },
      data: { origenCausaId: origenLegada.id }
    });
    console.log(`✅ ${resultLegada.count} causas Legada migradas`);
    
    // 6. Verificar migración
    console.log('🔍 Verificando migración...');
    const causasConOrigen = await prisma.causa.count({ where: { origenCausaId: { not: null } } });
    const causasMigradas = resultEcoh.count + resultSacfi.count + resultLegada.count;
    
    console.log('📊 Resultado de migración:');
    console.log(`  Causas con origen asignado: ${causasConOrigen}`);
    console.log(`  Causas migradas: ${causasMigradas}`);
    
    // 7. Mostrar estadísticas detalladas
    const estadisticas = await prisma.causa.groupBy({
      by: ['origenCausaId'],
      _count: { id: true }
    });
    
    console.log('📈 Distribución por origen:');
    for (const stat of estadisticas) {
      if (stat.origenCausaId) {
        const origen = await prisma.origenCausa.findUnique({ where: { id: stat.origenCausaId } });
        console.log(`  ${origen?.nombre}: ${stat._count.id} causas`);
      } else {
        console.log(`  Sin origen: ${stat._count.id} causas`);
      }
    }
    
    console.log('🎉 Migración de datos completada exitosamente!');
    console.log('⚠️  IMPORTANTE: Ahora puedes proceder a actualizar el schema y eliminar las columnas obsoletas.');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateCausaData();