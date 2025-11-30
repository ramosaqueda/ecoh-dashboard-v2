'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import UsuarioSelect from '@/components/select/UsuarioSelect';
import { Download, Search, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface ActividadReporte {
  id: number;
  tipoActividad: string;
  causa: string;
  estado: string;
  fechaAsignacion: string;
  fechaCambioEstado: string;
  usuarioAsignado: string;
}

export default function ReporteActividadesUsuario() {
  const [userId, setUserId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [data, setData] = useState<ActividadReporte[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!userId || !startDate || !endDate) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        userId,
        startDate,
        endDate
      });

      const response = await fetch(`/api/reportes/actividades-usuario?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Error al cargar el reporte');
      
      const result = await response.json();
      setData(result);
      
      if (result.length === 0) {
        toast.info('No se encontraron actividades para los criterios seleccionados');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (data.length === 0) return;

    const exportData = data.map(item => ({
      'ID': item.id,
      'Tipo de Actividad': item.tipoActividad,
      'Causa': item.causa,
      'Estado': item.estado,
      'Fecha Asignación': format(new Date(item.fechaAsignacion), 'dd/MM/yyyy HH:mm'),
      'Fecha Cambio Estado': format(new Date(item.fechaCambioEstado), 'dd/MM/yyyy HH:mm'),
      'Usuario Asignado': item.usuarioAsignado
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Actividades');
    XLSX.writeFile(wb, `reporte_actividades_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reporte de Actividades por Usuario</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">Usuario</label>
              <UsuarioSelect value={userId} onValueChange={setUserId} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
              <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Fin</label>
              <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Buscar
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExport} 
                disabled={data.length === 0}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tipo Actividad</TableHead>
                <TableHead>Causa</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Asignación</TableHead>
                <TableHead>Fecha Cambio Estado</TableHead>
                <TableHead>Usuario Asignado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No hay datos para mostrar
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.tipoActividad}</TableCell>
                    <TableCell>{item.causa}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.estado === 'terminado' ? 'bg-green-100 text-green-800' :
                        item.estado === 'en_proceso' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.estado}
                      </span>
                    </TableCell>
                    <TableCell>{format(new Date(item.fechaAsignacion), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell>{format(new Date(item.fechaCambioEstado), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell>{item.usuarioAsignado}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
