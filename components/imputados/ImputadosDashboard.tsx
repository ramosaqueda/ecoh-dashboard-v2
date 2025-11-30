'use client';

import ImputadosMetricsCard from '@/components/cards/ImputadosMetricsCard';

export default function ImputadosDashboard() {
  return (
    <div className="space-y-6">
      {/* Card principal de métricas */}
      <ImputadosMetricsCard />
      
      {/* Aquí se pueden agregar más componentes en el futuro:
          - Tabla de imputados
          - Gráfico de formalizaciones por mes
          - Gráfico de cautelares
          - etc.
      */}
    </div>
  );
}