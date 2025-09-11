'use client';

import EstadisticasSimple from '@/components/analytics/EstadisticasSimple';
import { ActividadesPendientesTodo, ActividadesAsignadasPorMi, AccionesRapidasActividades } from '@/components/analytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ActividadesAnalyticsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics de Actividades</h1>
      </div>
      
      {/* Panel de estadísticas de actividades */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="assigned">Asignadas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <EstadisticasSimple />
          <AccionesRapidasActividades />
        </TabsContent>
        
        <TabsContent value="pending">
          <ActividadesPendientesTodo />
        </TabsContent>
        
        <TabsContent value="assigned">
          <ActividadesAsignadasPorMi />
        </TabsContent>
      </Tabs>
    </div>
  );
}