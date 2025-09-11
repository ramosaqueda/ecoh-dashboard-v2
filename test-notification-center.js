// test-notification-center.js
// Script simple para verificar que el NotificationCenter se puede importar sin errores

import React from 'react';

// Test de importación
try {
  console.log('🔍 Probando importación de NotificationCenter...');
  
  // Simulación de la importación que hace el header
  const NotificationCenter = require('./components/notifications/NotificationCenter.tsx');
  
  console.log('✅ NotificationCenter se puede importar correctamente');
  console.log('✅ Es un:', typeof NotificationCenter);
  
  if (NotificationCenter.default) {
    console.log('✅ Tiene export default');
  }
  
} catch (error) {
  console.error('❌ Error al importar NotificationCenter:', error.message);
}
