// components/tables/HistorialCorrelativosTable.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';

interface CorrelativoHistorial {
  id: number;
  numero: number;
  sigla: string;
  tipoActividadRelation: {
    nombre: string;
    siglainf: string;
  };
  usuarioRelation: {
    email: string;
    nombre?: string;
  };
  createdAt: string;
}

interface HistorialCorrelativosTableProps {
  tipoActividadId?: string;
  className?: string;
}

export default function HistorialCorrelativosTable({ 
  tipoActividadId, 
  className 
}: HistorialCorrelativosTableProps) {
  const [correlativos, setCorrelativos] = useState<CorrelativoHistorial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchHistorial = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('limit', '10');
      
      if (tipoActividadId) {
        params.append('tipoActividadId', tipoActividadId);
      }

      const response = await fetch(`/api/correlativos/historial?${params.toString()}`);
      if (!response.ok) throw new Error('Error al cargar historial');
      
      const { data, metadata } = await response.json();
      setCorrelativos(data);
      setTotal(metadata.total);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, [tipoActividadId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Historial de Correlativos</CardTitle>
            <CardDescription>
              Últimos correlativos generados ({total} total)
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHistorial}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Cargando historial...</div>
        ) : correlativos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay correlativos generados
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Correlativo</TableHead>
                <TableHead>Tipo de Actividad</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Fecha Generación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {correlativos.map((correlativo) => (
                <TableRow key={correlativo.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {correlativo.sigla}-{String(correlativo.numero).padStart(3, '0')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {correlativo.tipoActividadRelation.nombre}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {correlativo.tipoActividadRelation.siglainf}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {correlativo.usuarioRelation.nombre || correlativo.usuarioRelation.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(correlativo.createdAt)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}