// Funciones de debugging para el sistema de notificaciones
// Ejecutar en la consola del navegador

function debugNotificationSystem() {
  console.log('🔍 DEBUGGING SISTEMA DE NOTIFICACIONES');
  console.log('====================================');
  
  // 1. Verificar conexión SSE
  console.log('\n📡 VERIFICANDO CONEXIÓN SSE:');
  
  // Verificar EventSource en DevTools
  const sseConnections = performance.getEntriesByType('navigation');
  console.log('EventSource disponible:', typeof EventSource !== 'undefined');
  
  // Verificar conexión actual
  if (window.notificationService) {
    console.log('✅ NotificationService disponible');
  } else {
    console.log('❌ NotificationService NO disponible');
  }
  
  // 2. Probar conexión manual SSE
  console.log('\n🔗 PROBANDO CONEXIÓN SSE MANUAL:');
  
  try {
    const testSSE = new EventSource('/api/notifications/sse');
    
    testSSE.onopen = () => {
      console.log('✅ Conexión SSE manual exitosa');
      testSSE.close();
    };
    
    testSSE.onerror = (error) => {
      console.log('❌ Error en conexión SSE manual:', error);
      testSSE.close();
    };
    
    testSSE.onmessage = (event) => {
      console.log('📨 Mensaje SSE recibido:', event.data);
    };
    
    // Cerrar después de 3 segundos
    setTimeout(() => {
      testSSE.close();
      console.log('🔒 Conexión SSE manual cerrada');
    }, 3000);
    
  } catch (error) {
    console.log('❌ Error creando EventSource:', error);
  }
  
  // 3. Verificar notificaciones almacenadas
  console.log('\n💾 VERIFICANDO ALMACENAMIENTO:');
  
  const stored = localStorage.getItem('ecoh_notifications');
  if (stored) {
    try {
      const notifications = JSON.parse(stored);
      console.log(`✅ ${notifications.length} notificaciones almacenadas:`, notifications);
    } catch (error) {
      console.log('❌ Error parseando notificaciones almacenadas:', error);
    }
  } else {
    console.log('📝 No hay notificaciones almacenadas');
  }
  
  // 4. Verificar componentes en DOM
  console.log('\n🎨 VERIFICANDO COMPONENTES DOM:');
  
  const bell = document.querySelector('[data-testid="notification-bell"]') || 
               document.querySelector('button:has(svg)');
  console.log('Campana de notificaciones:', bell ? '✅ Encontrada' : '❌ No encontrada');
  
  const header = document.querySelector('header');
  console.log('Header:', header ? '✅ Encontrado' : '❌ No encontrado');
  
  // 5. Verificar servicios globales
  console.log('\n🌐 VERIFICANDO SERVICIOS GLOBALES:');
  
  console.log('window.notificationService:', typeof window.notificationService);
  console.log('window.eventManager:', typeof window.eventManager);
  console.log('window.testNotifications:', typeof window.testNotifications);
  
  // 6. Probar notificación manual
  console.log('\n🧪 CREANDO NOTIFICACIÓN DE PRUEBA:');
  
  try {
    // Intentar usar el hook directamente si está disponible
    if (window.testNotifications?.crear) {
      window.testNotifications.crear(999);
      console.log('✅ Notificación de prueba creada con testNotifications');
    } else {
      console.log('⚠️ testNotifications no disponible');
      
      // Intentar método alternativo
      const notification = {
        id: `debug-${Date.now()}`,
        title: 'Debug: Test Notification',
        message: 'Esta es una notificación de debug para verificar el sistema',
        type: 'actividad_nueva',
        timestamp: new Date(),
        read: false,
        dismissed: false,
        persistent: true,
        autoHide: false,
        actividadId: 999,
        causaRuc: 'DEBUG-999',
        tipoActividad: 'Debug Test',
        actionUrl: '/dashboard/actividades?highlight=999'
      };
      
      // Guardar en localStorage temporalmente
      const existing = localStorage.getItem('ecoh_notifications');
      const notifications = existing ? JSON.parse(existing) : [];
      notifications.unshift(notification);
      localStorage.setItem('ecoh_notifications', JSON.stringify(notifications));
      
      console.log('✅ Notificación debug guardada en localStorage');
      console.log('💡 Recarga la página para ver la notificación');
    }
  } catch (error) {
    console.log('❌ Error creando notificación de prueba:', error);
  }
  
  // 7. Verificar autenticación
  console.log('\n👤 VERIFICANDO AUTENTICACIÓN:');
  
  const userElements = document.querySelectorAll('[data-signed-in], .user-nav');
  console.log('Elementos de usuario autenticado:', userElements.length > 0 ? '✅ Encontrados' : '❌ No encontrados');
  
  // 8. Resumen y recomendaciones
  console.log('\n📋 RESUMEN Y RECOMENDACIONES:');
  console.log('================================');
  console.log('');
  console.log('Si las notificaciones automáticas no funcionan:');
  console.log('1. Verificar que /api/notifications/sse responde (Network tab)');
  console.log('2. Revisar logs del servidor al crear actividades');
  console.log('3. Confirmar que el usuario asignado es diferente al creador');
  console.log('4. Verificar que el usuario tiene clerk_id válido en BD');
  console.log('');
  console.log('Comandos útiles:');
  console.log('- debugNotificationSystem() // Esta función');
  console.log('- testManualNotification() // Crear notificación manual');
  console.log('- clearStoredNotifications() // Limpiar almacenamiento');
}

function testManualNotification() {
  console.log('🧪 CREANDO NOTIFICACIÓN MANUAL');
  
  const notification = {
    id: `manual-${Date.now()}`,
    title: 'Notificación Manual de Prueba',
    message: 'Esta notificación fue creada manualmente para testing',
    type: 'actividad_nueva',
    timestamp: new Date(),
    read: false,
    dismissed: false,
    persistent: true,
    autoHide: false,
    actividadId: 1,
    causaRuc: 'MANUAL-001',
    tipoActividad: 'Test Manual',
    actionUrl: '/dashboard/actividades?highlight=1'
  };
  
  // Método 1: Usar servicio si está disponible
  if (window.notificationService) {
    window.notificationService.addNotification(notification);
    console.log('✅ Notificación agregada vía notificationService');
    return;
  }
  
  // Método 2: Guardar en localStorage
  const existing = localStorage.getItem('ecoh_notifications');
  const notifications = existing ? JSON.parse(existing) : [];
  notifications.unshift(notification);
  localStorage.setItem('ecoh_notifications', JSON.stringify(notifications));
  
  console.log('✅ Notificación guardada en localStorage');
  console.log('💡 Recarga la página para ver la notificación');
}

function clearStoredNotifications() {
  localStorage.removeItem('ecoh_notifications');
  console.log('🗑️ Notificaciones almacenadas eliminadas');
  console.log('💡 Recarga la página para aplicar cambios');
}

function testSSEConnection() {
  console.log('🔗 PROBANDO CONEXIÓN SSE DETALLADA');
  
  const eventSource = new EventSource('/api/notifications/sse');
  
  eventSource.onopen = (event) => {
    console.log('✅ SSE abierto:', event);
  };
  
  eventSource.onmessage = (event) => {
    console.log('📨 Mensaje SSE:', event.data);
    try {
      const data = JSON.parse(event.data);
      console.log('📦 Datos parseados:', data);
    } catch (error) {
      console.log('❌ Error parseando mensaje SSE:', error);
    }
  };
  
  eventSource.onerror = (error) => {
    console.log('❌ Error SSE:', error);
    console.log('ReadyState:', eventSource.readyState);
  };
  
  // Cerrar después de 10 segundos
  setTimeout(() => {
    eventSource.close();
    console.log('🔒 Conexión SSE de prueba cerrada');
  }, 10000);
  
  return eventSource;
}

// Exponer funciones globalmente
window.debugNotificationSystem = debugNotificationSystem;
window.testManualNotification = testManualNotification;
window.clearStoredNotifications = clearStoredNotifications;
window.testSSEConnection = testSSEConnection;

console.log('🚀 HERRAMIENTAS DE DEBUG CARGADAS');
console.log('==================================');
console.log('');
console.log('Funciones disponibles:');
console.log('- debugNotificationSystem() // Diagnóstico completo');
console.log('- testManualNotification() // Crear notificación manual');
console.log('- clearStoredNotifications() // Limpiar localStorage');
console.log('- testSSEConnection() // Probar conexión SSE');
console.log('');
console.log('💡 Ejecuta debugNotificationSystem() para empezar');
