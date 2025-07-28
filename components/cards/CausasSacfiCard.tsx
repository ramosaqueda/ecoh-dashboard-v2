'use client';
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useYearContext } from '@/components/YearSelector';
import { Shield } from 'lucide-react';

interface CausasCountResponse {
  count: number;
}

const CausasSacfiCard: React.FC = () => {
  const { selectedYear } = useYearContext();
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCausasCount = async () => {
      try {
        setLoading(true);
        
        // Construir URL para la API
        const url = new URL('/api/causas', window.location.origin);
        url.searchParams.append('count', 'true');
        url.searchParams.append('causaSacfi', 'true');
        
        // Solo añadir year si no es "todos"
        if (selectedYear !== 'todos') {
          url.searchParams.append('year', selectedYear);
        }
        
        const response = await fetch(url.toString());
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: CausasCountResponse = await response.json();
        setCount(data.count);
      } catch (err) {
        setError('Error al obtener el conteo de causas SACFI');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCausasCount();
  }, [selectedYear]);

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-orange-600" />
          <CardTitle className="text-sm font-medium">CAUSAS SACFI</CardTitle>
        </div>
        <span className="text-xs text-muted-foreground">
          {selectedYear === 'todos' ? 'Todos los años' : selectedYear}
        </span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : (
          <div className="space-y-1">
            <p className="text-3xl font-bold text-orange-600">
              {count !== null ? count.toLocaleString() : 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">
              Sistema de Análisis Criminal y Focalización de la Investigación
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CausasSacfiCard;