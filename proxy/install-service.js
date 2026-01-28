// install-service.js
// Instala el proxy FICHAB como servicio de Windows
const path = require('path');
const Service = require('node-windows').Service;

// Crear el servicio
const svc = new Service({
  name: 'FICHAB Proxy',
  description: 'Proxy para permitir que Docker acceda a FICHAB (balanceador-qa.minpublico.cl)',
  script: path.join(__dirname, 'fichab-proxy.js'),
  nodeOptions: [],
  workingDirectory: __dirname,
  allowServiceLogon: true
});

// Escuchar eventos
svc.on('install', () => {
  console.log('✅ Servicio instalado correctamente');
  console.log('🚀 Iniciando servicio...');
  svc.start();
});

svc.on('alreadyinstalled', () => {
  console.log('⚠️ El servicio ya está instalado');
});

svc.on('start', () => {
  console.log('✅ Servicio iniciado');
  console.log('');
  console.log('El proxy está corriendo en: http://0.0.0.0:8443');
  console.log('Desde Docker usar: http://host.docker.internal:8443');
  console.log('');
  console.log('Para ver el estado del servicio:');
  console.log('  Get-Service "FICHAB Proxy"');
  console.log('');
  console.log('Para ver logs del servicio:');
  console.log('  Get-EventLog -LogName Application -Source "FICHAB Proxy" -Newest 20');
});

svc.on('error', (err) => {
  console.error('❌ Error:', err);
});

// Instalar el servicio
console.log('📦 Instalando servicio FICHAB Proxy...');
console.log('   (Puede requerir permisos de administrador)');
console.log('');
svc.install();
