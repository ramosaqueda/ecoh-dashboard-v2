// Script de debug para el problema de selectores
// Ejecutar en la consola del navegador cuando edites una causa

console.log('🔍 DEBUG - Estado actual del formulario:');

// Verificar que los elementos existen
const origenSelector = document.querySelector('[data-radix-select-trigger]');
const estadoSelector = document.querySelectorAll('[data-radix-select-trigger]')[1];

console.log('Selectores encontrados:', {
  origen: !!origenSelector,
  estado: !!estadoSelector
});

// Verificar valores en localStorage o sessionStorage si los hay
console.log('Datos en storage:', {
  localStorage: Object.keys(localStorage),
  sessionStorage: Object.keys(sessionStorage)
});

// Función para verificar valores del formulario
function debugFormValues() {
  // Simular obtener valores del formulario React
  console.log('Verifica en React DevTools:');
  console.log('1. Busca el componente CausaForm');
  console.log('2. Ve a Hook > Form > values');
  console.log('3. Revisa origenCausaId y estadoCausaId');
}

debugFormValues();
