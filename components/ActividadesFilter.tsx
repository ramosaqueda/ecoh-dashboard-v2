'use client';
import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import CausaSelector from '@/components/select/CausaSelector';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Actividad {
  id: number;
  fechaInicio: string;
  fechaTermino: string;
  estado: string;
  causa: {
    ruc: string;
    denominacionCausa: string;
  };
  tipoActividad: {
    nombre: string;
  };
  usuario: {
    nombre: string;
    email: string;
  };
}

export default function ActividadesFilter() {
  const [selectedCausa, setSelectedCausa] = useState<string>('');
  const [showOthersActivities, setShowOthersActivities] = useState(false);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

  useEffect(() => {
    // Obtener el email del usuario actual
    const fetchUserEmail = async () => {
      try {
        const response = await fetch('/api/usuario/me');
        const data = await response.json();
        setCurrentUserEmail(data.email);
      } catch (error) {
        console.error('Error al obtener usuario:', error);
      }
    };

    fetchUserEmail();
  }, []);

  useEffect(() => {
    const fetchActividades = async () => {
      if (!selectedCausa) return;
      
      try {
        const response = await fetch(`/api/actividades?causaId=${selectedCausa}`);
        if (!response.ok) throw new Error('Error al cargar actividades');
        const data = await response.json();
        setActividades(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar las actividades');
      }
    };

    fetchActividades();
  }, [selectedCausa]);

  const filteredActividades = showOthersActivities
    ? actividades
    : actividades.filter(act => act.usuario.email === currentUserEmail);

  const getEstadoBadgeColor = (estado: string) => {
    const colors: Record<string, string> = {
      inicio: 'bg-blue-500',
      'en-proceso': 'bg-yellow-500',
      terminado: 'bg-green-500',
      cancelado: 'bg-red-500'
    };
    return colors[estado] || 'bg-gray-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <CausaSelector
            value={selectedCausa}
            onChange={setSelectedCausa}
            isDisabled={false}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="show-others"
            checked={showOthersActivities}
            onCheckedChange={setShowOthersActivities}
          />
          <Label htmlFor="show-others">Ver actividades de otros usuarios</Label>
        </div>
      </div>

      {selectedCausa && (
        <Card>
          <CardContent className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Fecha Término</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Usuario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActividades.map((actividad) => (
                  <TableRow key={actividad.id}>
                    <TableCell>{actividad.tipoActividad.nombre}</TableCell>
                    <TableCell>
                      {format(new Date(actividad.fechaInicio), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(actividad.fechaTermino), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={ (
                          getEstadoBadgeColor(actividad.estado),
                          'text-white'
                        )}
                      >
                        {actividad.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>{actividad.usuario.nombre}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}