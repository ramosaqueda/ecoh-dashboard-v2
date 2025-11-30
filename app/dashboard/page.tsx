'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
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
import CausasCard from '@/components/cards/CausasCard';
import EcohSacfiComparisonCard from '@/components/cards/EcohSacfiComparisonCard';
import { EsclarecimientoCard } from '@/components/cards/EsclarecimientoCard';
import { CrimenOrganizadoCard } from '@/components/cards/CrimenOrganizadoCard';
import NationalityDistribution from '@/components/charts/NationalityDistribution';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import JurisdiccionMetricsCard from '@/components/cards/JurisdiccionMetricsCard';
import EcohConcurrenceCard from '@/components/cards/EcohConcurrenceCard';
import ImputadosDashboard from '@/components/imputados/ImputadosDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  // 🔒 VERIFICACIÓN CENTRALIZADA DE AUTENTICACIÓN
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const [isReady, setIsReady] = useState(false);
  const [userName, setUserName] = useState('Usuario');

  // ⏳ Esperar a que Clerk esté completamente cargado
  useEffect(() => {
    if (!authLoaded || !userLoaded) {
      console.log('⏳ [Dashboard] Esperando a que Clerk se cargue...');
      return;
    }

    if (!isSignedIn) {
      console.log('❌ [Dashboard] Usuario no autenticado');
      return;
    }

    // Obtener nombre del usuario
    if (user) {
      const name = user.firstName || user.username || 'Usuario';
      setUserName(name);
      console.log(`✅ [Dashboard] Usuario autenticado: ${name}`);
    }

    // Todo listo, mostrar dashboard
    setIsReady(true);
  }, [authLoaded, userLoaded, isSignedIn, user]);

  // 🔄 LOADING STATE - Mientras Clerk se inicializa
  if (!authLoaded || !userLoaded || !isReady) {
    return (
      <YearProvider>
        <PageContainer scrollable={true}>
          <div className="space-y-4 p-4 md:p-8">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>

            {/* Tabs skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-10 w-full max-w-md" />

              {/* Cards skeleton */}
              <div className="grid gap-4 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={`card-${i}`} className="h-32" />
                ))}
              </div>

              {/* Charts skeleton */}
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
              </div>
            </div>

            {/* Loading indicator */}
            <div className="fixed bottom-8 right-8 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Cargando dashboard...</span>
            </div>
          </div>
        </PageContainer>
      </YearProvider>
    );
  }

  // ❌ NO AUTENTICADO
  if (!isSignedIn) {
    return (
      <YearProvider>
        <PageContainer scrollable={true}>
          <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Acceso Restringido</h2>
              <p className="text-gray-600">
                Por favor, inicia sesión para acceder al dashboard de ECOH.
              </p>
            </div>
          </div>
        </PageContainer>
      </YearProvider>
    );
  }

  // ✅ DASHBOARD COMPLETO - Usuario autenticado y sistema listo
  return (
    <YearProvider>
      <PageContainer scrollable={true}>
        <div className="space-y-4 p-4 md:p-8">
          {/* ========================================
              HEADER - Bienvenida y selector de año
              ======================================== */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">
              Hola, {userName} de vuelta por aquí? 👋
            </h2>
            <div className="hidden items-center space-x-2 md:flex">
              <YearSelector />
            </div>
          </div>

          {/* ========================================
              TABS - Navegación principal
              ======================================== */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Estadísticas</TabsTrigger>
              <TabsTrigger value="analytics">Actividades</TabsTrigger>
              <TabsTrigger value="imputados">Imputados</TabsTrigger>
            </TabsList>

            {/* ========================================
                TAB: OVERVIEW - Estadísticas principales
                ======================================== */}
            <TabsContent value="overview" className="space-y-6">

              {/* SECCIÓN 1: Cards Principales - 3 columnas (más grandes) */}
              <div className="grid gap-4 md:grid-cols-3">
                <EcohSacfiComparisonCard />
                <CrimenOrganizadoCard />
                <EsclarecimientoCard />
              </div>

              {/* SECCIÓN 2: Métricas por  */}
              <JurisdiccionMetricsCard />

              {/* SECCIÓN 2.5: Concurrencia ECOH */}
              <div className="grid gap-4 md:grid-cols-2">
                <EcohConcurrenceCard />
              </div>

              {/* SECCIÓN 3: Card Total de Causas - Destacada */}
              <div className="w-full">
                <CausasCard />
              </div>

              {/* SECCIÓN 4: Línea de Tiempo de Causas */}
              <div className="w-full">
                <CauseTimeline />
              </div>

              {/* SECCIÓN 5: Gráficos Principales - 2 columnas */}
              <div className="grid gap-4 md:grid-cols-2">
                <CaseTimelineChart />
                <DelitosDistribution />
              </div>

              {/* SECCIÓN 6: Gráficos Secundarios - 3 columnas */}
              <div className="grid gap-4 md:grid-cols-3">
                <ImputadosFlow />
                <AbogadoAnalistaChart />
                <NationalityDistribution />
              </div>

              {/* SECCIÓN 7: Gráfico de Formalización */}
              <div className="grid gap-6">
                <FormalizationChart />
              </div>

              {/* SECCIÓN 8: Mapa de Calor - Ancho completo */}
              <div className="w-full">
                <CasesHeatmap />
              </div>
            </TabsContent>

            {/* ========================================
                TAB: ANALYTICS - Actividades
                ======================================== */}
            <TabsContent value="analytics" className="space-y-4">
              <AnalyticsDashboard />
            </TabsContent>

            {/* ========================================
                TAB: IMPUTADOS - Métricas de Imputados 🆕
                ======================================== */}
            <TabsContent value="imputados" className="space-y-4">
              <ImputadosDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </PageContainer>
    </YearProvider>
  );
}