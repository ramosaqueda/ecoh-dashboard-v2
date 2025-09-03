'use client';

import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Users, 
  FileText, 
  BarChart3,
  CheckCircle2,
  Clock
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AccionRapida {
  titulo: string;
  descripcion: string;
  icono: React.ComponentType<{className?: string}>;
  href: string;
  color: string;
  badge?: string;
}

const accionesRapidas: AccionRapida[] = [
  {
    titulo: 'Nueva Actividad',
    descripcion: 'Crear una nueva actividad',
    icono: Plus,
    href: '/dashboard/actividades',
    color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
    badge: 'Crear'
  },
  {
    titulo: 'Mis Tareas',
    descripcion: 'Ver mi lista completa de tareas',
    icono: CheckCircle2,
    href: '/dashboard/todo',
    color: 'bg-green-50 hover:bg-green-100 border-green-200',
    badge: 'Gestionar'
  },
  {
    titulo: 'Tablero Kanban',
    descripcion: 'Ver actividades en tablero',
    icono: BarChart3,
    href: '/dashboard/kanban',
    color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
    badge: 'Visual'
  },
  {
    titulo: 'Reportes',
    descripcion: 'Generar reportes de actividades',
    icono: FileText,
    href: '/dashboard/reportes',
    color: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
    badge: 'Reportes'
  },
  {
    titulo: 'Gestión Causas',
    descripcion: 'Administrar causas',
    icono: Search,
    href: '/dashboard/causas',
    color: 'bg-gray-50 hover:bg-gray-100 border-gray-200'
  },
  {
    titulo: 'Usuarios',
    descripcion: 'Gestión de usuarios',
    icono: Users,
    href: '/dashboard/profile',
    color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200'
  }
];

export default function AccionesRapidasActividades() {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const handleActionClick = (href: string) => {
    window.open(href, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-5 w-5 text-blue-600" />
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {accionesRapidas.map((accion) => {
            const IconComponent = accion.icono;
            return (
              <div
                key={accion.titulo}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${accion.color}`}
                onClick={() => handleActionClick(accion.href)}
                onMouseEnter={() => setHoveredAction(accion.titulo)}
                onMouseLeave={() => setHoveredAction(null)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <IconComponent className="h-5 w-5 text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-gray-900 truncate">
                        {accion.titulo}
                      </h4>
                      {accion.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {accion.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {accion.descripcion}
                    </p>
                  </div>
                </div>
                
                {/* Indicador de hover */}
                {hoveredAction === accion.titulo && (
                  <div className="mt-2 text-xs text-blue-600 font-medium">
                    Clic para abrir →
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Enlaces rápidos adicionales */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              Actualizar datos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleActionClick('/dashboard/actividades')}
              className="text-xs"
            >
              <Search className="h-3 w-3 mr-1" />
              Buscar actividades
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleActionClick('/dashboard/kanban')}
              className="text-xs"
            >
              <BarChart3 className="h-3 w-3 mr-1" />
              Vista Kanban
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}