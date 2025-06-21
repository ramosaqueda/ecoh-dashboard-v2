'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  FileText, 
  TrendingUp, 
  Calendar,
  Shield,
  Building,
  Clock
} from 'lucide-react';

interface ReporteItem {
  id: string;
  titulo: string;
  descripcion: string;
  icono: React.ReactNode;
  href: string;
  disponible: boolean;
  categoria: 'operacional' | 'estadistico' | 'administrativo';
}

const reportesDisponibles: ReporteItem[] = [
  {
    id: 'fiscales',
    titulo: 'Causas por Fiscal',
    descripcion: 'Análisis de distribución de causas entre fiscales con estadísticas detalladas',
    icono: <Users className="h-6 w-6" />,
    href: '/dashboard/reportes/fiscales',
    disponible: true,
    categoria: 'operacional'
  },
  {
    id: 'delitos',
    titulo: 'Análisis por Tipo de Delito',
    descripcion: 'Estadísticas de causas agrupadas por tipo de delito y tendencias temporales',
    icono: <Shield className="h-6 w-6" />,
    href: '/dashboard/reportes/delitos',
    disponible: false,
    categoria: 'estadistico'
  },
  {
    id: 'temporal',
    titulo: 'Análisis Temporal',
    descripcion: 'Evolución de causas a lo largo del tiempo con análisis de tendencias',
    icono: <Calendar className="h-6 w-6" />,
    href: '/dashboard/reportes/temporal',
    disponible: false,
    categoria: 'estadistico'
  },
  {
    id: 'organizaciones',
    titulo: 'Organizaciones Criminales',
    descripcion: 'Reporte especializado en causas relacionadas con crimen organizado',
    icono: <Building className="h-6 w-6" />,
    href: '/dashboard/reportes/organizaciones',
    disponible: false,
    categoria: 'operacional'
  },
  {
    id: 'actividades',
    titulo: 'Gestión de Actividades',
    descripcion: 'Análisis de productividad y seguimiento de actividades por usuario',
    icono: <Clock className="h-6 w-6" />,
    href: '/dashboard/reportes/actividades',
    disponible: false,
    categoria: 'administrativo'
  },
  {
    id: 'rendimiento',
    titulo: 'Indicadores de Rendimiento',
    descripcion: 'KPIs y métricas de rendimiento del sistema y usuarios',
    icono: <TrendingUp className="h-6 w-6" />,
    href: '/dashboard/reportes/rendimiento',
    disponible: false,
    categoria: 'administrativo'
  }
];

const categorias = {
  operacional: {
    titulo: 'Reportes Operacionales',
    descripcion: 'Reportes relacionados con la operación diaria del sistema',
    color: 'bg-blue-50 border-blue-200'
  },
  estadistico: {
    titulo: 'Análisis Estadísticos',
    descripcion: 'Reportes con análisis profundo de datos y tendencias',
    color: 'bg-green-50 border-green-200'
  },
  administrativo: {
    titulo: 'Reportes Administrativos',
    descripcion: 'Reportes para gestión y administración del sistema',
    color: 'bg-purple-50 border-purple-200'
  }
};

export default function ReportesPage() {
  const reportesPorCategoria = Object.entries(categorias).map(([categoria, info]) => ({
    categoria: categoria as keyof typeof categorias,
    info,
    reportes: reportesDisponibles.filter(r => r.categoria === categoria)
  }));

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Reportes y Análisis</h1>
        <p className="text-muted-foreground">
          Genere reportes detallados y análisis estadísticos del sistema ECOH
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reportes Disponibles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportesDisponibles.filter(r => r.disponible).length}
            </div>
            <p className="text-xs text-muted-foreground">
              de {reportesDisponibles.length} desarrollados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operacionales</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportesDisponibles.filter(r => r.categoria === 'operacional').length}
            </div>
            <p className="text-xs text-muted-foreground">
              reportes operacionales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estadísticos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportesDisponibles.filter(r => r.categoria === 'estadistico').length}
            </div>
            <p className="text-xs text-muted-foreground">
              análisis estadísticos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrativos</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportesDisponibles.filter(r => r.categoria === 'administrativo').length}
            </div>
            <p className="text-xs text-muted-foreground">
              reportes administrativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reportes por categoría */}
      {reportesPorCategoria.map(({ categoria, info, reportes }) => (
        <div key={categoria} className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">{info.titulo}</h2>
            <p className="text-sm text-muted-foreground">{info.descripcion}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportes.map((reporte) => (
              <Card key={reporte.id} className={info.color}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {reporte.icono}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{reporte.titulo}</CardTitle>
                      {!reporte.disponible && (
                        <span className="text-xs text-amber-600 font-medium">
                          Próximamente
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {reporte.descripcion}
                  </CardDescription>
                  
                  {reporte.disponible ? (
                    <Link href={reporte.href}>
                      <Button className="w-full">
                        Ver Reporte
                      </Button>
                    </Link>
                  ) : (
                    <Button disabled className="w-full">
                      En Desarrollo
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Ayuda */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Información sobre Reportes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            • Los reportes operacionales proporcionan información sobre la gestión diaria de causas
          </p>
          <p className="text-sm text-muted-foreground">
            • Los análisis estadísticos incluyen tendencias históricas y proyecciones
          </p>
          <p className="text-sm text-muted-foreground">
            • Los reportes administrativos ayudan en la gestión de usuarios y sistema
          </p>
          <p className="text-sm text-muted-foreground">
            • Todos los reportes permiten exportación en múltiples formatos (Excel, CSV, PDF)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}