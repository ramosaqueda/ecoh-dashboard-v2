'use client';
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useYearContext } from '@/components/YearSelector';
import { TrendingUp, AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/components/ui/tooltip';

interface CausasCountResponse {
  count: number;
  previousCount?: number; // Para comparación con período anterior
}

const CausasCard: React.FC = () => {
  const { selectedYear } = useYearContext();
  const [data, setData] = useState<CausasCountResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCausasCount = async () => {
      try {
        setLoading(true);
        
        // Construir URL para la API
        const url = new URL('/api/causas', window.location.origin);
        url.searchParams.append('count', 'true');
        
        // Solo añadir year si no es "todos"
        if (selectedYear !== 'todos') {
          url.searchParams.append('year', selectedYear);
        }
        
        const response = await fetch(url.toString());
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const responseData: CausasCountResponse = await response.json();
        setData(responseData);
      } catch (err) {
        setError('Error al obtener el conteo de causas');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCausasCount();
  }, [selectedYear]); // Dependencia en selectedYear

  // Calcular el porcentaje de cambio (supongamos que tenemos previousCount en la respuesta)
  const percentageChange = data && data.previousCount 
    ? ((data.count - data.previousCount) / data.previousCount * 100).toFixed(1) 
    : null;

  return (
    <TooltipProvider>
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">TOTAL INGRESOS</CardTitle>
            <Tooltip>
              <TooltipTrigger>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Total de causas ingresadas</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="h-8 w-8 rounded-full bg-blue-100 p-1.5 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="w-full h-24 flex items-center justify-center">
              <div className="animate-pulse h-10 w-24 bg-slate-200 rounded-md"></div>
            </div>
          ) : error ? (
            <div className="w-full h-24 flex flex-col items-center justify-center text-red-500">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p className="text-xs">{error}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-4xl font-bold">{data?.count?.toLocaleString() || 'N/A'}</p>
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  Causas Ingresadas a ECOH
                </p>
                {percentageChange && (
                  <div className={`text-xs font-medium px-2 py-0.5 rounded ${
                    parseFloat(percentageChange) >= 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {parseFloat(percentageChange) >= 0 ? '+' : ''}{percentageChange}%
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default CausasCard;