'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { PieChart, Activity, Users, HelpCircle } from 'lucide-react';

interface StatsPanelProps {
  causas: Array<{
    id: number;
    denominacionCausa: string;
    ruc: string;
    coordenadasSs: string | null;
    delito?: {
      id: number;
      nombre: string;
    };
  }>;
  selectedDelito: string;
}

export function StatsPanel({ causas, selectedDelito }: StatsPanelProps) {
  // Calcular estadísticas
  const totalCausas = causas.length;
  const causasConCoordenadas = causas.filter((c) => c.coordenadasSs).length;
  const porcentajeMapeado = totalCausas
    ? ((causasConCoordenadas / totalCausas) * 100).toFixed(1)
    : '0';

  // Agrupar por delito
  const delitoStats = causas.reduce(
    (acc, causa) => {
      const delitoNombre = causa.delito?.nombre || 'Sin clasificar';
      acc[delitoNombre] = (acc[delitoNombre] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Encontrar el delito más común
  const delitoMasComun = Object.entries(delitoStats).sort(
    ([, a], [, b]) => b - a
  )[0];

  return (
    <TooltipProvider>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Causas</CardTitle>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Número total de causas en el sistema</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCausas}</div>
            <p className="text-xs text-muted-foreground">
              {causasConCoordenadas} con ubicación en mapa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cobertura Geográfica
            </CardTitle>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Porcentaje de causas que tienen ubicación en el mapa</p>
                <p className="mt-1 text-xs">
                  ({causasConCoordenadas} de {totalCausas} causas)
                </p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{porcentajeMapeado}%</div>
            <p className="text-xs text-muted-foreground">
              causas georreferenciadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Delito más frecuente
            </CardTitle>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Tipo de delito con mayor número de casos</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            <div className="truncate text-2xl font-bold">
              {delitoMasComun?.[0]}
            </div>
            <p className="text-xs text-muted-foreground">
              {delitoMasComun?.[1]} casos registrados
            </p>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
