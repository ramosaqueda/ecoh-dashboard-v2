// debug-notifications.js
// Script para verificar el estado de las notificaciones en la base de datos

const { PrismaClient } = require('@prisma/client');

async function debugNotifications() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando sistema de notificaciones...\n');
    
    // 1. Verificar que la tabla existe
    console.log('1. Verificando tabla de notificaciones...');
    try {
      const notificacionesCount = await prisma.notificacion.count();
      console.log(`✅ Tabla 'notificaciones' existe con ${notificacionesCount} registros\n`);
    } catch (error) {
      console.log('❌ Error con tabla notificaciones:', error.message);
      console.log('🔧 Necesitas ejecutar: npx prisma db push\n');
      return;
    }
    
    // 2. Verificar usuarios
    console.log('2. Verificando usuarios...');
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        nombre: true,
        clerk_id: true
      },
      take: 5
    });
    console.log(`✅ Encontrados ${usuarios.length} usuarios:`);
    usuarios.forEach(u => console.log(`   - ${u.email} (ID: ${u.id})`));
    console.log('');
    
    // 3. Verificar actividades recientes
    console.log('3. Verificando actividades recientes...');
    const actividades = await prisma.actividad.findMany({
      include: {
        causa: true,
        tipoActividad: true,
        usuario: true,
        usuarioAsignado: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3
    });
    console.log(`✅ Encontradas ${actividades.length} actividades recientes:`);
    actividades.forEach(a => {
      console.log(`   - ${a.tipoActividad.nombre} (Asignada a: ${a.usuarioAsignado?.email || 'Sin asignar'})`);
    });
    console.log('');
    
    // 4. Crear una notificación de prueba
    console.log('4. Creando notificación de prueba...');
    if (usuarios.length > 0) {
      const testNotification = await prisma.notificacion.create({
        data: {
          usuario_id: usuarios[0].id,
          titulo: 'Notificación de Prueba',
          mensaje: 'Esta es una notificación generada por el script de debug',
          tipo: 'system',
          leida: false,
          metadata: JSON.stringify({
            test: true,
            timestamp: new Date().toISOString()
          })
        }
      });
      console.log(`✅ Notificación de prueba creada con ID: ${testNotification.id}\n`);
    }
    
    // 5. Verificar notificaciones existentes
    console.log('5. Verificando notificaciones existentes...');
    const notificaciones = await prisma.notificacion.findMany({
      include: {
        usuario: {
          select: {
            email: true,
            nombre: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });
    console.log(`✅ Encontradas ${notificaciones.length} notificaciones:`);
    notificaciones.forEach(n => {
      console.log(`   - ${n.titulo} para ${n.usuario.email} (Leída: ${n.leida ? 'Sí' : 'No'})`);
    });
    console.log('');
    
    console.log('🎉 Verificación completada exitosamente!');
    console.log('');
    console.log('📋 Próximos pasos:');
    console.log('1. Ejecutar: yarn dev');
    console.log('2. Hacer login en la aplicación');
    console.log('3. Crear una actividad y asignarla a otro usuario');
    console.log('4. Verificar que aparece la notificación en el header');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugNotifications();
