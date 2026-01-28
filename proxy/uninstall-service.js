// uninstall-service.js
// Desinstala el servicio FICHAB Proxy de Windows
const path = require('path');
const Service = require('node-windows').Service;

// Crear referencia al servicio
const svc = new Service({
  name: 'FICHAB Proxy',
  script: path.join(__dirname, 'fichab-proxy.js')
});

// Escuchar eventos
svc.on('uninstall', () => {
  console.log('✅ Servicio desinstalado correctamente');
});

svc.on('alreadyuninstalled', () => {
  console.log('⚠️ El servicio ya estaba desinstalado');
});

svc.on('error', (err) => {
  console.error('❌ Error:', err);
});

// Desinstalar
console.log('🗑️ Desinstalando servicio FICHAB Proxy...');
svc.uninstall();
