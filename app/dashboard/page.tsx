'use client';

import { YearProvider, YearSelector } from '@/components/YearSelector';
import CaseTimelineChart from '@/components/charts/CaseTimelineChart';
import PageContainer from '@/components/layout/page-container';
import AbogadoAnalistaChart from '@/components/charts/AbogadoAnalistaChart';
import { CasesHeatmap } from '@/components/charts/CasesHeatmap';
import { DelitosDistribution } from '@/components/charts/DelitosDistribution';
import { ImputadosFlow } from '@/components/charts/ImputadosFlow';
import FormalizationChart from '@/components/charts/FormalizationChart';
import CauseTimeline from '@/components/CauseTimeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CausasEcohCard from '@/components/cards/CausasEcohCard';
import CausasSacfiCard from '@/components/cards/CausasSacfiCard';
import CausasCard from '@/components/cards/CausasCard';
import CausasLegadaCard from '@/components/cards/CausasLegadaCard';
import EcohSacfiComparisonCard from '@/components/cards/EcohSacfiComparisonCard';
import { EsclarecimientoCard } from '@/components/cards/EsclarecimientoCard';
import { CrimenOrganizadoCard } from '@/components/cards/CrimenOrganizadoCard';
import NationalityDistribution from '@/components/charts/NationalityDistribution';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { SSEDebugPanel } from '@/components/debug/SSEDebugPanel'; 
import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  // ✅ SOLUCIÓN: Agregar verificación de auth
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const [userName, setUserName] = useState('Usuario');

  useEffect(() => {
    if (userLoaded && user) {
      setUserName(user.firstName || 'Usuario');
    }
  }, [user, userLoaded]);

  // ✅ CRÍTICO: Mostrar loading mientras Clerk se inicializa
  if (!authLoaded || !userLoaded) {
    return (
      <YearProvider>
        <PageContainer scrollable={true}>
          <div className="space-y-4 p-4 md:p-8">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full max-w-md" />
              <div className="grid gap-4 md:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
              </div>
            </div>
          </div>
        </PageContainer>
      </YearProvider>
    );
  }

  // ✅ Verificar autenticación
  if (!isSignedIn) {
    return (
      <YearProvider>
        <PageContainer scrollable={true}>
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600">Por favor, inicia sesión para ver el dashboard.</p>
          </div>
        </PageContainer>
      </YearProvider>
    );
  }

  // ✅ TODO LISTO - Renderizar dashboard
  return (
    <YearProvider>
      <PageContainer scrollable={true}>
        <div className="space-y-4 p-4 md:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">
              Hola, {userName} de vuelta por aqui? 👋
            </h2>
            <div className="hidden items-center space-x-2 md:flex">
              <YearSelector />
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Estadísticas</TabsTrigger>
              <TabsTrigger value="analytics">
                Analítica de actividades
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <CausasCard />
                
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                 
              </div>

              <div className="w-full">
                 
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                 
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                
              </div>

              <div className="grid gap-6">
                 
              </div>

              <div className="w-full">
                
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsDashboard />
            </TabsContent>
          </Tabs>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-4 right-4 z-50">
              <SSEDebugPanel />
            </div>
          )}
        </div>
      </PageContainer>
    </YearProvider>
  );
}