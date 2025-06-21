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

interface CausasCountResponse {
  count: number;
}

const CausasEcohCard: React.FC = () => {
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
        url.searchParams.append('causaEcoh', 'true');
        
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
        setError('Error al obtener el conteo de causas ECOH');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCausasCount();
  }, [selectedYear]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">CAUSAS ECOH</CardTitle>
        <span className="text-xs text-muted-foreground">
          {selectedYear === 'todos' ? 'Todos los años' : selectedYear}
        </span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <p className="text-4xl font-bold">{count !== null ? count : 'N/A'}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Causas en tramitación ECOH
        </p>
      </CardContent>
    </Card>
  );
};

export default CausasEcohCard;