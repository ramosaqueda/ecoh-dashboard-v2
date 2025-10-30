'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useYearContext } from '@/components/YearSelector';
import { Scale, Shield, BarChart3 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ComparisonData {
  ecohCount: number;
  sacfiCount: number;
  totalCount: number;
}

// ✅ IDs EXACTOS de tu base de datos
const ORIGEN_IDS = {
  SACFI: 1,          // ID 1: SACFI
  ECOH_ELQUI: 2,     // ID 2: ECOH Elqui
  ECOH_LIMARI: 3,    // ID 3: ECOH Limarí
  OTRAS: 4           // ID 4: Otras Fiscalías
};

const EcohSacfiComparisonCard: React.FC = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const { selectedYear } = useYearContext();
  const [data, setData] = useState<ComparisonData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) {
      console.log('⏳ [CausasCard] Esperando a que Clerk se cargue...');
      return;
    }

    if (!isSignedIn) {
      console.log('❌ [CausasCard] Usuario no autenticado');
      setIsLoading(false);
      setError('No autenticado');
      return;
    }

    const fetchComparisonData = async () => {
      try {
        setIsLoading(true);
        
        const baseUrl = new URL('/api/causas', window.location.origin);
        const yearParam = selectedYear !== 'todos' ? `&year=${selectedYear}` : '';
        
        // ✅ Consultas usando origenCausaId con IDs correctos
        const promises = [
          // ECOH Elqui (ID 2)
          fetch(`${baseUrl}?count=true&origenCausaId=${ORIGEN_IDS.ECOH_ELQUI}${yearParam}`),
          // ECOH Limarí (ID 3)
          fetch(`${baseUrl}?count=true&origenCausaId=${ORIGEN_IDS.ECOH_LIMARI}${yearParam}`),
          // SACFI (ID 1)
          fetch(`${baseUrl}?count=true&origenCausaId=${ORIGEN_IDS.SACFI}${yearParam}`),
          // Total
          fetch(`${baseUrl}?count=true${yearParam}`)
        ];
        
        const [ecohElquiResponse, ecohLimariResponse, sacfiResponse, totalResponse] = await Promise.all(promises);
        
        if (!ecohElquiResponse.ok || !ecohLimariResponse.ok || !sacfiResponse.ok || !totalResponse.ok) {
          throw new Error('Error en una o más consultas');
        }
        
        const [ecohElquiData, ecohLimariData, sacfiData, totalData] = await Promise.all([
          ecohElquiResponse.json(),
          ecohLimariResponse.json(),
          sacfiResponse.json(),
          totalResponse.json()
        ]);
        
        // ✅ Sumar ECOH Elqui + ECOH Limarí = Total ECOH
        const totalEcohCount = (ecohElquiData.count || 0) + (ecohLimariData.count || 0);
        
        setData({
          ecohCount: totalEcohCount,
          sacfiCount: sacfiData.count || 0,
          totalCount: totalData.count || 0
        });
        
        setError(null);
      } catch (err) {
        setError('Error al obtener datos comparativos');
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComparisonData();
  }, [selectedYear, isLoaded, isSignedIn]);

  if (!isLoaded || isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Distribución causas en unidad SACFI/ECOH
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Distribución causas en unidad SACFI/ECOH
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">{error || 'No hay datos disponibles'}</p>
        </CardContent>
      </Card>
    );
  }

  const ecohPercentage = data.totalCount > 0 ? (data.ecohCount / data.totalCount) * 100 : 0;
  const sacfiPercentage = data.totalCount > 0 ? (data.sacfiCount / data.totalCount) * 100 : 0;
  const otherPercentage = 100 - ecohPercentage - sacfiPercentage;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Distribución causas en unidad SACFI/ECOH
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {selectedYear === 'todos' ? 'Todos los años' : selectedYear}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ECOH (Suma de Elqui + Limarí) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="h-3 w-3 text-blue-600" />
              <span className="text-sm font-medium">ECOH</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-blue-600">
                {data.ecohCount.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {ecohPercentage.toFixed(1)}%
              </p>
            </div>
          </div>
          <Progress 
            value={ecohPercentage} 
            className="h-2 bg-gray-100"
          />
        </div>

        {/* SACFI */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3 text-orange-600" />
              <span className="text-sm font-medium">SACFI</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-orange-600">
                {data.sacfiCount.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {sacfiPercentage.toFixed(1)}%
              </p>
            </div>
          </div>
          <Progress 
            value={sacfiPercentage} 
            className="h-2 bg-gray-100"
          />
        </div>

        {/* Otras Fiscalías */}
        {otherPercentage > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Otras Fiscalías</span>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-600">
                  {(data.totalCount - data.ecohCount - data.sacfiCount).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {otherPercentage.toFixed(1)}%
                </p>
              </div>
            </div>
            <Progress 
              value={otherPercentage} 
              className="h-2 bg-gray-100"
            />
          </div>
        )}

        {/* Total */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Causas</span>
            <p className="text-lg font-bold">
              {data.totalCount.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EcohSacfiComparisonCard;