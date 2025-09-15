// Script para limpiar localStorage y cache del navegador
// Ejecutar en la consola del navegador

console.log('🧹 LIMPIANDO CACHE Y ESTADO...');
console.log('==============================');

// 1. Limpiar localStorage de notificaciones
try {
  localStorage.removeItem('ecoh_notifications');
  console.log('✅ LocalStorage de notificaciones limpiado');
} catch (error) {
  console.log('❌ Error limpiando localStorage:', error);
}

// 2. Limpiar sessionStorage
try {
  sessionStorage.clear();
  console.log('✅ SessionStorage limpiado');
} catch (error) {
  console.log('❌ Error limpiando sessionStorage:', error);
}

// 3. Verificar conexiones SSE activas y cerrarlas
if (window.EventSource) {
  console.log('🔍 Verificando conexiones SSE...');
  // No hay manera directa de cerrar todas las conexiones SSE, 
  // pero el reload siguiente las cerrará
}

// 4. Limpiar cualquier timer activo
if (window.clearTimeout && window.clearInterval) {
  // Limpiar hasta el ID 1000 (suficiente para la mayoría de casos)
  for (let i = 1; i < 1000; i++) {
    clearTimeout(i);
    clearInterval(i);
  }
  console.log('✅ Timers limpiados');
}

console.log('');
console.log('🔄 SIGUIENTE PASOS:');
console.log('------------------');
console.log('1. Recargar página completamente: Ctrl+Shift+R');
console.log('2. O ejecutar: location.reload(true)');
console.log('3. Verificar que no hay errores en consola');
console.log('4. Buscar campana 🔔 en header');

// 5. Función para recargar automáticamente
function reloadClean() {
  console.log('🔄 Recargando página en 3 segundos...');
  setTimeout(() => {
    window.location.reload(true);
  }, 3000);
}

console.log('');
console.log('💡 Para recargar automáticamente: reloadClean()');

// Exponer función
window.reloadClean = reloadClean;
