// Script de diagnóstico para verificar datos y endpoints
// Ejecutar con: node scripts/verify-causa-data.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyData() {
  try {
    console.log('🔍 Verificando conexión a BD...');
    
    // 1. Verificar conexión
    await prisma.$connect();
    console.log('✅ Conexión a BD exitosa');
    
    // 2. Verificar tabla origenes_causa
    console.log('\n📋 Verificando tabla origenes_causa...');
    const origenes = await prisma.origenCausa.findMany();
    console.log(`Encontrados ${origenes.length} registros en origenes_causa:`);
    origenes.forEach(origen => {
      console.log(`  - ID: ${origen.id}, Nombre: ${origen.nombre}, Activo: ${origen.activo}`);
    });
    
    // 3. Verificar tabla estados_causa
    console.log('\n📋 Verificando tabla estados_causa...');
    const estados = await prisma.estadoCausa.findMany();
    console.log(`Encontrados ${estados.length} registros en estados_causa:`);
    estados.forEach(estado => {
      console.log(`  - ID: ${estado.id}, Nombre: ${estado.nombre}, Código: ${estado.codigo}, Activo: ${estado.activo}`);
    });
    
    // 4. Verificar estructura de tabla Causa
    console.log('\n📋 Verificando columnas en tabla Causa...');
    const causaSample = await prisma.causa.findFirst({
      select: {
        id: true,
        origenCausaId: true,
        estadoCausaId: true,
        ruc: true
      }
    });
    
    if (causaSample) {
      console.log('✅ Columnas origenCausaId y estadoCausaId existen en tabla Causa');
      console.log(`Causa de ejemplo: ID ${causaSample.id}, OrigenID: ${causaSample.origenCausaId}, EstadoID: ${causaSample.estadoCausaId}`);
    } else {
      console.log('⚠️ No hay registros en tabla Causa para verificar columnas');
    }
    
    // 5. Verificar datos iniciales faltantes
    if (origenes.length === 0) {
      console.log('\n🔧 Insertando datos iniciales para origenes_causa...');
      await prisma.origenCausa.createMany({
        data: [
          {
            nombre: 'SACFI',
            descripcion: 'Servicio de Análisis Criminal y Focos Investigativos',
            color: '#3B82F6'
          },
          {
            nombre: 'ECOH Elqui',
            descripcion: 'Equipo Contra el Crimen Organizado y Homicidios Elqui',
            color: '#10B981'
          },
          {
            nombre: 'ECOH Limarí',
            descripcion: 'Equipo Contra el Crimen Organizado y Homicidios Limarí',
            color: '#F59E0B'
          },
          {
            nombre: 'Otras Fiscalías',
            descripcion: 'Otras Fiscalías de la región',
            color: '#6B7280'
          }
        ]
      });
      console.log('✅ Datos iniciales insertados en origenes_causa');
    }
    
    if (estados.length === 0) {
      console.log('\n🔧 Insertando datos iniciales para estados_causa...');
      await prisma.estadoCausa.createMany({
        data: [
          {
            nombre: 'Inicio Investigación',
            codigo: 'INICIO_INV',
            descripcion: 'Causa en etapa inicial de investigación',
            orden: 1,
            color: '#3B82F6'
          },
          {
            nombre: 'Investigación Cerrada',
            codigo: 'INV_CERRADA',
            descripcion: 'Investigación cerrada sin sentencia',
            orden: 2,
            color: '#F59E0B'
          },
          {
            nombre: 'Cerrada con Sentencia',
            codigo: 'CERR_SENTENCIA',
            descripcion: 'Causa cerrada con sentencia judicial',
            orden: 3,
            color: '#10B981'
          },
          {
            nombre: 'Cerrada Otras',
            codigo: 'CERR_OTRAS',
            descripcion: 'Causa cerrada por otras razones',
            orden: 4,
            color: '#6B7280'
          }
        ]
      });
      console.log('✅ Datos iniciales insertados en estados_causa');
    }
    
    console.log('\n🎉 Verificación completada!');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    
    if (error.code === 'P2021') {
      console.log('💡 Tabla no existe. Ejecuta: npx prisma db push');
    }
    if (error.code === 'P1001') {
      console.log('💡 No se puede conectar a la BD. Verifica tu .env');
    }
  } finally {
    await prisma.$disconnect();
  }
}

verifyData();