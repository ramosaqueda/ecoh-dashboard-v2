// components/reportes/CausasRelacionadasWrapper.tsx
'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// ✅ AHORA SÍ PUEDES USAR ssr: false (en Client Component)
const CausasRelacionadasReporte = dynamic(
  () => import('./CausasRelacionadasReporte'),
  {
    ssr: false, // ✅ Funciona porque estamos en Client Component
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando reporte...</span>
      </div>
    )
  }
);

export default function CausasRelacionadasWrapper() {
  return (
    <div className="min-h-screen">
      <CausasRelacionadasReporte />
    </div>
  );
}