'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useYearContext } from '@/components/YearSelector';
import { Scale, Users, FileText, AlertTriangle } from 'lucide-react';
import { OrigenCausa } from '@/types/causa';

interface CausasCountResponse {
  count: number;
}

interface CausasOrigenCardProps {
  origenId?: number;
  titulo?: string;
  descripcion?: string;
  color?: string;
  icono?: React.ComponentType<any>;
  className?: string;
}

// Hook para obtener conteo por origen
const useCausasCount = (origenId?: number, selectedYear?: string) => {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCausasCount = async () => {
      try {
        setLoading(true);
        
        const url = new URL('/api/causas', window.location.origin);
        url.searchParams.append('count', 'true');
        
        // Usar el nuevo filtro por origenCausaId si está disponible
        if (origenId) {
          url.searchParams.append('origenCausaId', origenId.toString());
        }
        
        // Solo añadir year si no es "todos"
        if (selectedYear && selectedYear !== 'todos') {
          url.searchParams.append('year', selectedYear);
        }
        
        const response = await fetch(url.toString());
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data: CausasCountResponse = await response.json();
        setCount(data.count);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(`Error al obtener conteo: ${errorMessage}`);
        console.error('Error fetching causas count:', err);
        setCount(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCausasCount();
  }, [origenId, selectedYear]);

  return { count, loading, error };
};

// Componente para card individual por origen
const CausasOrigenCard: React.FC<CausasOrigenCardProps> = ({
  origenId,
  titulo = "Causas",
  descripcion,
  color = "#6b7280",
  icono: Icon = Scale,
  className = ""
}) => {
  const { selectedYear } = useYearContext();
  const { count, loading, error } = useCausasCount(origenId, selectedYear);

  return (
    <Card className={`border-l-4 ${className}`} style={{ borderLeftColor: color }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Icon className="h-4 w-4" style={{ color }} />
          <CardTitle className="text-sm font-medium">{titulo}</CardTitle>
        </div>
        <span className="text-xs text-muted-foreground">
          {selectedYear === 'todos' ? 'Todos los años' : selectedYear}
        </span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        ) : error ? (
          <div className="space-y-1">
            <p className="text-sm text-red-500">Error al cargar</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-3xl font-bold" style={{ color }}>
              {count !== null ? count.toLocaleString() : 'N/A'}
            </p>
            {descripcion && (
              <p className="text-xs text-muted-foreground">
                {descripcion}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente principal que muestra cards para todos los orígenes
const CausasOrigenesDashboard: React.FC = () => {
  const [origenes, setOrigenes] = useState<OrigenCausa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrigenes = async () => {
      try {
        const response = await fetch('/api/origenes-causa');
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setOrigenes(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching origenes:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchOrigenes();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Error al cargar orígenes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Mapeo de iconos por código de origen
  const getIconForCodigo = (codigo: string) => {
    switch (codigo.toUpperCase()) {
      case 'ECOH':
        return Scale;
      case 'SACFI':
        return Users;
      case 'LEGADA':
        return FileText;
      default:
        return Scale;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {origenes.map((origen) => (
        <CausasOrigenCard
          key={origen.id}
          origenId={origen.id}
          titulo={`CAUSAS ${origen.codigo}`}
          descripcion={origen.descripcion}
          color={origen.color || '#6b7280'}
          icono={getIconForCodigo(origen.codigo)}
        />
      ))}
      
      {/* Card adicional para causas sin origen */}
      <CausasOrigenCard
        titulo="CAUSAS SIN ORIGEN"
        descripcion="Causas sin origen específico asignado"
        color="#94a3b8"
        icono={AlertTriangle}
        className="opacity-75"
      />
    </div>
  );
};

// Exportar ambos componentes
export default CausasOrigenesDashboard;
export { CausasOrigenCard };

// Componentes específicos para retrocompatibilidad (DEPRECATED)
export const CausasEcohCard: React.FC = () => (
  <CausasOrigenCard
    origenId={1} // Asumiendo que ECOH tiene ID 1
    titulo="CAUSAS ECOH"
    descripcion="Equipo Contra el Crimen Organizado y Homicidios"
    color="#ef4444"
    icono={Scale}
  />
);

export const CausasSacfiCard: React.FC = () => (
  <CausasOrigenCard
    origenId={2} // Asumiendo que SACFI tiene ID 2
    titulo="CAUSAS SACFI"
    descripcion="Sistema de Análisis Criminal y Focalización de la Investigación"
    color="#3b82f6"
    icono={Users}
  />
);

export const CausasLegadaCard: React.FC = () => (
  <CausasOrigenCard
    origenId={3} // Asumiendo que LEGADA tiene ID 3
    titulo="CAUSAS LEGADA"
    descripcion="Causas legadas de otras unidades"
    color="#f59e0b"
    icono={FileText}
  />
);
