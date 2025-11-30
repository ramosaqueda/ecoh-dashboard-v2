'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useYearContext } from '@/components/YearSelector';
import { 
  Building2, 
  AlertTriangle, 
  Skull, 
  Network, 
  Shield 
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface JurisdiccionStats {
  id: number;
  nombre: string;
  color: string;
  causasVigentes: number;
  concurrenciasSS: number;
  homicidiosConsumados: number;
  homicidiosCrimenOrganizado: number;
  aristas: number;
}

interface Stats {
  ecohElqui: JurisdiccionStats;
  ecohLimari: JurisdiccionStats;
  totales: {
    causasVigentes: number;
    concurrenciasSS: number;
    homicidiosConsumados: number;
    homicidiosCrimenOrganizado: number;
    aristas: number;
  };
}

export default function JurisdiccionMetricsCard() {
  const { selectedYear } = useYearContext();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Si selectedYear es "todos", no enviar parámetro year
        const url = selectedYear && selectedYear !== 'todos'
          ? `/api/dashboard/jurisdiccion-stats?year=${selectedYear}`
          : '/api/dashboard/jurisdiccion-stats';
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Error al cargar estadísticas');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Error al cargar las estadísticas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [selectedYear]);

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="col-span-full">
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">{error || 'No hay datos disponibles'}</p>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      label: 'Causas Vigentes',
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      elqui: stats.ecohElqui.causasVigentes,
      limari: stats.ecohLimari.causasVigentes,
      total: stats.totales.causasVigentes
    },
    {
      label: 'Concurrencias a SS',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      elqui: stats.ecohElqui.concurrenciasSS,
      limari: stats.ecohLimari.concurrenciasSS,
      total: stats.totales.concurrenciasSS
    },
    {
      label: 'Homicidios Consumados',
      icon: Skull,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      elqui: stats.ecohElqui.homicidiosConsumados,
      limari: stats.ecohLimari.homicidiosConsumados,
      total: stats.totales.homicidiosConsumados
    },
    {
      label: 'HC + Crimen Organizado',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      elqui: stats.ecohElqui.homicidiosCrimenOrganizado,
      limari: stats.ecohLimari.homicidiosCrimenOrganizado,
      total: stats.totales.homicidiosCrimenOrganizado
    },
    {
      label: 'Aristas Generadas',
      icon: Network,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      elqui: stats.ecohElqui.aristas,
      limari: stats.ecohLimari.aristas,
      total: stats.totales.aristas
    }
  ];

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Métricas por Jurisdicción equipos ECOH
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Comparativo ECOH Elqui vs ECOH Limarí-Choapa
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* ================================
              ECOH ELQUI
              ================================ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b-2" 
                 style={{ borderColor: stats.ecohElqui.color }}>
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: stats.ecohElqui.color }}
              />
              <h3 className="font-semibold text-lg">{stats.ecohElqui.nombre}</h3>
            </div>
            
            <div className="space-y-3">
              {metrics.map((metric) => (
                <div 
                  key={`elqui-${metric.label}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${metric.bgColor}`}>
                      <metric.icon className={`h-4 w-4 ${metric.color}`} />
                    </div>
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <span className="text-xl font-bold">{metric.elqui}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ================================
              ECOH LIMARÍ-CHOAPA
              ================================ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b-2" 
                 style={{ borderColor: stats.ecohLimari.color }}>
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: stats.ecohLimari.color }}
              />
              <h3 className="font-semibold text-lg">{stats.ecohLimari.nombre}</h3>
            </div>
            
            <div className="space-y-3">
              {metrics.map((metric) => (
                <div 
                  key={`limari-${metric.label}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${metric.bgColor}`}>
                      <metric.icon className={`h-4 w-4 ${metric.color}`} />
                    </div>
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <span className="text-xl font-bold">{metric.limari}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================================
            TOTALES (OPCIONAL)
            ================================ */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">
            TOTALES CONSOLIDADOS
          </h4>
          <div className="grid grid-cols-5 gap-3">
            {metrics.map((metric) => (
              <div 
                key={`total-${metric.label}`}
                className="flex flex-col items-center gap-1 p-2 rounded-md bg-muted/50"
              >
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
                <span className="text-lg font-bold">{metric.total}</span>
                <span className="text-xs text-muted-foreground text-center">
                  {metric.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
