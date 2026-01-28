// lib/fichab-config.ts
// Configuración para conexión a FICHAB

// En producción (Docker), usar el proxy local
// En desarrollo, conectar directamente
const isProduction = process.env.NODE_ENV === 'production';

export const FICHAB_CONFIG = {
  // Base URL de FICHAB
  baseUrl: isProduction 
    ? 'http://host.docker.internal:8443'  // Proxy en Windows host
    : 'https://balanceador-qa.minpublico.cl',
  
  // Si estamos usando el proxy, no necesitamos HTTPS
  useHttps: !isProduction,
  
  // Endpoints
  endpoints: {
    sujeto: '/fichab/Sujeto/buscarDatosPersonalesSujeto',
    casos: '/fichab/Sujeto/casos',
    foto: '/fichab/SRCI/fotoSujeto',
    datosGenerales: '/fichab/Caso/datosGenerales',
    delitos: '/fichab/Caso/delitos',
    relato: '/fichab/Caso/relato',
  }
};

export function getFichabUrl(endpoint: keyof typeof FICHAB_CONFIG.endpoints): string {
  return `${FICHAB_CONFIG.baseUrl}${FICHAB_CONFIG.endpoints[endpoint]}`;
}
