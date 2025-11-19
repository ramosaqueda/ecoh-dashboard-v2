'use client';

import { ReactNode, Fragment } from 'react';

interface NoStrictModeProps {
  children: ReactNode;
}

/**
 * Componente wrapper que desactiva React Strict Mode para sus hijos.
 * 
 * ⚠️ USAR SOLO CUANDO SEA NECESARIO
 * 
 * React Strict Mode es útil para detectar problemas potenciales en desarrollo.
 * Sin embargo, algunas librerías imperativas como Leaflet no están diseñadas
 * para manejar el doble montaje que Strict Mode realiza.
 * 
 * Este componente se debe usar solo para partes específicas de la aplicación
 * donde Strict Mode cause problemas conocidos y documentados.
 * 
 * @example
 * ```tsx
 * <NoStrictMode>
 *   <LeafletMap causas={causas} />
 * </NoStrictMode>
 * ```
 */
export function NoStrictMode({ children }: NoStrictModeProps) {
  // Simplemente renderiza los hijos sin envolver en StrictMode
  // Fragment no agrega nodos DOM adicionales
  return <Fragment>{children}</Fragment>;
}

export default NoStrictMode;