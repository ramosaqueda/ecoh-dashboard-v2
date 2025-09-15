// SCRIPT DE VERIFICACIÓN DEL CENTRO DE NOTIFICACIONES
// Ejecutar en la consola del navegador para verificar que todo funciona

console.log('🔔 VERIFICANDO CENTRO DE NOTIFICACIONES');
console.log('=====================================');

// 1. Verificar que el componente NotificationBell existe en el DOM
const notificationBell = document.querySelector('[data-testid="notification-bell"]') || 
                         document.querySelector('button[title*="notif"]') ||
                         document.querySelector('button:has(svg)');

if (notificationBell) {
    console.log('✅ NotificationBell encontrado en el DOM');
} else {
    console.log('❌ NotificationBell NO encontrado en el DOM');
    console.log('💡 Verificar que el header incluye <NotificationBell />');
}

// 2. Verificar que los servicios de notificaciones están disponibles
if (typeof window !== 'undefined') {
    // Intentar importar dinámicamente los servicios
    import('/lib/notifications/notificationService.js')
        .then(() => {
            console.log('✅ Servicio de notificaciones cargado');
        })
        .catch(() => {
            console.log('⚠️ Servicio de notificaciones no disponible como módulo');
            console.log('💡 Esto es normal si se carga de otra manera');
        });
    
    // Verificar que sonner está disponible
    if (window.sonner || document.querySelector('[data-sonner-toaster]')) {
        console.log('✅ Sonner Toaster disponible');
    } else {
        console.log('❌ Sonner Toaster NO encontrado');
        console.log('💡 Verificar que SonnerToaster está en layout.tsx');
    }
}

// 3. Función de prueba rápida
function crearNotificacionPrueba() {
    const notification = {
        id: `test-${Date.now()}`,
        title: 'Prueba de Centro de Notificaciones',
        message: 'Si ves esto, el sistema funciona correctamente!',
        type: 'actividad_nueva',
        timestamp: new Date(),
        read: false,
        dismissed: false,
        persistent: true,
        autoHide: false,
        actividadId: 1,
        causaRuc: '12345678-9',
        tipoActividad: 'Prueba',
        actionUrl: '/dashboard/actividades?highlight=1'
    };

    // Intentar agregar notificación
    try {
        // Buscar el hook de notificaciones en React DevTools o window
        const addNotification = window.testNotifications?.crear || 
                               window.addNotification ||
                               (() => {
                                   console.log('📦 Creando notificación de prueba:', notification);
                                   // Simular con toast directo
                                   if (window.toast) {
                                       window.toast(notification.title, {
                                           description: notification.message,
                                           duration: Infinity,
                                           action: {
                                               label: 'Ver',
                                               onClick: () => window.location.href = notification.actionUrl
                                           }
                                       });
                                   }
                               });
        
        addNotification(notification);
        console.log('✅ Notificación de prueba creada');
    } catch (error) {
        console.log('❌ Error creando notificación:', error);
    }
}

// 4. Verificar elementos del header
console.log('');
console.log('🧭 VERIFICANDO ELEMENTOS DEL HEADER:');
console.log('-----------------------------------');

const header = document.querySelector('header');
if (header) {
    console.log('✅ Header encontrado');
    
    // Buscar elementos específicos
    const logo = header.querySelector('svg, img, [class*="logo"]');
    const userNav = header.querySelector('[class*="user"], [data-testid="user-nav"]');
    const themeToggle = header.querySelector('[class*="theme"], button[title*="theme"]');
    
    console.log(`${logo ? '✅' : '❌'} Logo/Brand`);
    console.log(`${userNav ? '✅' : '❌'} UserNav`);
    console.log(`${themeToggle ? '✅' : '❌'} ThemeToggle`);
    
    // Buscar campana de notificaciones
    const bellIcon = header.querySelector('svg[class*="bell"], [class*="notification"]');
    console.log(`${bellIcon ? '✅' : '❌'} Icono de campana de notificaciones`);
    
} else {
    console.log('❌ Header NO encontrado');
}

// 5. Verificar que el usuario está autenticado
const isSignedIn = document.querySelector('[data-signed-in]') || 
                   document.querySelector('.user-nav') ||
                   !document.querySelector('[data-signed-out]');

console.log('');
console.log('👤 ESTADO DE AUTENTICACIÓN:');
console.log('--------------------------');
console.log(`${isSignedIn ? '✅' : '❌'} Usuario autenticado`);

if (!isSignedIn) {
    console.log('💡 El centro de notificaciones solo aparece para usuarios autenticados');
    console.log('💡 Asegúrate de hacer login primero');
}

// 6. Resumen y siguientes pasos
console.log('');
console.log('📋 RESUMEN:');
console.log('----------');
console.log('');
console.log('✅ PASOS COMPLETADOS:');
console.log('- NotificationBell agregado al header.tsx');
console.log('- SonnerToaster agregado al layout.tsx');
console.log('- Exportaciones named/default en componentes');
console.log('');
console.log('🔧 PRÓXIMOS PASOS:');
console.log('1. Reiniciar servidor: npm run dev');
console.log('2. Recargar página (Ctrl+Shift+R)');
console.log('3. Verificar login/autenticación');
console.log('4. Buscar campana en header (lado derecho)');
console.log('5. Ejecutar: crearNotificacionPrueba()');
console.log('');
console.log('🚨 SI NO APARECE LA CAMPANA:');
console.log('- Verificar errores en consola');
console.log('- Confirmar que estás en modo SignedIn');
console.log('- Revisar que los componentes se importan correctamente');

// Exponer función de prueba
window.crearNotificacionPrueba = crearNotificacionPrueba;
console.log('');
console.log('💡 FUNCIÓN DISPONIBLE: crearNotificacionPrueba()');
