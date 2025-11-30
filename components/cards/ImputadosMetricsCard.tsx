'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useYearContext } from '@/components/YearSelector';
import { 
  Users, 
  Gavel, 
  FileCheck, 
  Lock
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface JurisdiccionStats {
  id: number;
  nombre: string;
  color: string;
  totalImputados: number;
  formalizadosPeriodo: number;
  formalizadosVigentes: number;
  conCautelar: number;
}

interface Stats {
  ecohElqui: JurisdiccionStats;
  ecohLimari: JurisdiccionStats;
  totales: {
    totalImputados: number;
    formalizadosPeriodo: number;
    formalizadosVigentes: number;
    conCautelar: number;
  };
}

export default function ImputadosMetricsCard() {
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
          ? `/api/dashboard/imputados-stats?year=${selectedYear}`
          : '/api/dashboard/imputados-stats';
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Error al cargar estadísticas de imputados');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching imputados stats:', err);
        setError('Error al cargar las estadísticas de imputados');
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
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
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
      label: 'Total Imputados',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      elqui: stats.ecohElqui.totalImputados,
      limari: stats.ecohLimari.totalImputados,
      total: stats.totales.totalImputados
    },
    {
      label: 'Formalizados Período',
      icon: Gavel,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      elqui: stats.ecohElqui.formalizadosPeriodo,
      limari: stats.ecohLimari.formalizadosPeriodo,
      total: stats.totales.formalizadosPeriodo
    },
    {
      label: 'Formalizados Vigentes',
      icon: FileCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      elqui: stats.ecohElqui.formalizadosVigentes,
      limari: stats.ecohLimari.formalizadosVigentes,
      total: stats.totales.formalizadosVigentes
    },
    {
      label: 'Con Cautelar',
      icon: Lock,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      elqui: stats.ecohElqui.conCautelar,
      limari: stats.ecohLimari.conCautelar,
      total: stats.totales.conCautelar
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
            TOTALES
            ================================ */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">
            TOTALES CONSOLIDADOS
          </h4>
          <div className="grid grid-cols-4 gap-3">
            {metrics.map((metric) => (
              <div 
                key={`total-${metric.label}`}
                className="flex flex-col items-center gap-1 p-3 rounded-md bg-muted/50"
              >
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
                <span className="text-xl font-bold">{metric.total}</span>
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