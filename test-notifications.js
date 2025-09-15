// Función utilitaria para crear notificaciones de prueba
// Ejecutar en la consola del navegador para probar el sistema

function crearNotificacionPrueba(actividadId = 1) {
  const notificacion = {
    id: `test-${Date.now()}`,
    title: 'Nueva Actividad Creada',
    message: `Se ha creado una nueva actividad investigativa. Haz clic en "Ver" para revisar los detalles.`,
    type: 'actividad_nueva',
    timestamp: new Date(),
    read: false,
    dismissed: false,
    persistent: true,
    autoHide: false,
    actividadId: actividadId,
    causaRuc: '12345678-9',
    tipoActividad: 'Inspección Técnica',
    actionUrl: `/dashboard/actividades?highlight=${actividadId}`
  };

  // Agregar al servicio de notificaciones usando import dinámico
  import('/lib/notifications/notificationService.js')
    .then(module => {
      const { notificationService } = module;
      notificationService.addNotification(notificacion);
      console.log('✅ Notificación de prueba creada:', notificacion);
      console.log(`🔗 URL de acción: ${notificacion.actionUrl}`);
    })
    .catch(() => {
      // Fallback: crear directamente si el módulo no está disponible
      console.log('📦 Creando notificación de prueba (modo fallback):', notificacion);
      
      // Simular con toast directo si sonner está disponible
      if (typeof window !== 'undefined' && window.toast) {
        window.toast(notificacion.title, {
          description: notificacion.message,
          duration: Infinity,
          action: {
            label: 'Ver',
            onClick: () => window.location.href = notificacion.actionUrl
          }
        });
      } else {
        console.log('💡 Para ver la notificación, asegúrate de que sonner esté cargado');
      }
    });
}

function crearVariasNotificaciones() {
  const tipos = [
    { tipo: 'actividad_nueva', titulo: 'Nueva Actividad', mensaje: 'Se ha creado una nueva actividad investigativa.' },
    { tipo: 'actividad_actualizada', titulo: 'Actividad Actualizada', mensaje: 'Una actividad ha sido modificada y requiere revisión.' },
    { tipo: 'causa_nueva', titulo: 'Nueva Causa', mensaje: 'Se ha ingresado una nueva causa al sistema.' }
  ];

  tipos.forEach((item, index) => {
    setTimeout(() => {
      const notificacion = {
        id: `test-multiple-${Date.now()}-${index}`,
        title: item.titulo,
        message: item.mensaje,
        type: item.tipo,
        timestamp: new Date(),
        read: false,
        dismissed: false,
        persistent: true,
        autoHide: false,
        actividadId: index + 1,
        causaRuc: `1234567${index}-9`,
        tipoActividad: 'Actividad de Prueba',
        actionUrl: `/dashboard/actividades?highlight=${index + 1}`
      };

      if (window.notificationService) {
        window.notificationService.addNotification(notificacion);
        console.log(`✅ Notificación ${index + 1}/3 creada:`, notificacion.title);
      }
    }, index * 1000); // 1 segundo entre cada notificación
  });
}

function limpiarNotificacionesPrueba() {
  if (window.notificationService) {
    window.notificationService.dismissAll();
    console.log('🗑️ Todas las notificaciones de prueba eliminadas');
  }
}

function probarSistemaPorCompleto() {
  console.log('🧪 INICIANDO PRUEBA COMPLETA DEL SISTEMA');
  console.log('==========================================');
  
  console.log('1. Limpiando notificaciones existentes...');
  limpiarNotificacionesPrueba();
  
  setTimeout(() => {
    console.log('2. Creando notificación de prueba...');
    crearNotificacionPrueba(383); // Usar ID 383 como en los ejemplos
  }, 1000);
  
  setTimeout(() => {
    console.log('3. Creando múltiples notificaciones...');
    crearVariasNotificaciones();
  }, 3000);
  
  setTimeout(() => {
    console.log('✅ PRUEBA COMPLETA FINALIZADA');
    console.log('');
    console.log('📋 VERIFICAR:');
    console.log('- Notificaciones aparecen en la campana');
    console.log('- Sonidos se reproducen');
    console.log('- Toasts son persistentes');
    console.log('- Botón "Ver" navega correctamente');
    console.log('- URLs tienen formato /dashboard/actividades?highlight=ID');
    console.log('');
    console.log('🔗 PROBAR MANUALMENTE:');
    console.log('- Ir a /dashboard/actividades?highlight=383');
    console.log('- Verificar resaltado y auto-scroll');
    console.log('- Probar botones de cerrar y marcar como leída');
  }, 8000);
}

// Exponer funciones globalmente para fácil acceso
window.testNotifications = {
  crear: crearNotificacionPrueba,
  crearVarias: crearVariasNotificaciones,
  limpiar: limpiarNotificacionesPrueba,
  probarCompleto: probarSistemaPorCompleto
};

console.log('🚀 FUNCIONES DE PRUEBA CARGADAS');
console.log('===============================');
console.log('');
console.log('💡 USO:');
console.log('testNotifications.crear(383)           // Crear notificación para actividad 383');
console.log('testNotifications.crearVarias()        // Crear múltiples notificaciones');
console.log('testNotifications.limpiar()           // Limpiar todas las notificaciones');
console.log('testNotifications.probarCompleto()    // Prueba completa automatizada');
console.log('');
console.log('🔗 URLs de prueba sugeridas:');
console.log('/dashboard/actividades?highlight=1');
console.log('/dashboard/actividades?highlight=383');
