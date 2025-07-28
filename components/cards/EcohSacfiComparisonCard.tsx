'use client';
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useYearContext } from '@/components/YearSelector';
import { TrendingUp, Scale, Shield, BarChart3 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ComparisonData {
  ecohCount: number;
  sacfiCount: number;
  totalCount: number;
}

const EcohSacfiComparisonCard: React.FC = () => {
  const { selectedYear } = useYearContext();
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComparisonData = async () => {
      try {
        setLoading(true);
        
        // Hacer las tres consultas en paralelo
        const baseUrl = new URL('/api/causas', window.location.origin);
        
        const promises = [
          // ECOH
          fetch(`${baseUrl}?count=true&causaEcoh=true${selectedYear !== 'todos' ? `&year=${selectedYear}` : ''}`),
          // SACFI
          fetch(`${baseUrl}?count=true&causaSacfi=true${selectedYear !== 'todos' ? `&year=${selectedYear}` : ''}`),
          // Total
          fetch(`${baseUrl}?count=true${selectedYear !== 'todos' ? `&year=${selectedYear}` : ''}`)
        ];
        
        const [ecohResponse, sacfiResponse, totalResponse] = await Promise.all(promises);
        
        if (!ecohResponse.ok || !sacfiResponse.ok || !totalResponse.ok) {
          throw new Error('Error en una o más consultas');
        }
        
        const [ecohData, sacfiData, totalData] = await Promise.all([
          ecohResponse.json(),
          sacfiResponse.json(),
          totalResponse.json()
        ]);
        
        setData({
          ecohCount: ecohData.count,
          sacfiCount: sacfiData.count,
          totalCount: totalData.count
        });
      } catch (err) {
        setError('Error al obtener datos comparativos');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, [selectedYear]);

  if (loading) {
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
        {/* ECOH */}
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

        {/* Otras */}
        {otherPercentage > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Otras</span>
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