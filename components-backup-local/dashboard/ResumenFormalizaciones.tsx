// src/components/dashboard/ResumenFormalizaciones.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, CheckCircle, Clock, Calendar } from "lucide-react";

interface MetricasFormalizaciones {
  totalCausas: number;
  causasConFormalizados: number;
  causasSinFormalizados: number;
  totalImputados: number;
  totalFormalizados: number;
  noFormalizados: number;
  porcentajeFormalizados: number;
  alertas: {
    porVencer: number;
    vencidos: number;
  };
  promedioDiasFormalizacion: number;
}

interface ResumenFormalizacionesProps {
  metricas: MetricasFormalizaciones;
  isLoading: boolean;
}

export default function ResumenFormalizaciones({ metricas, isLoading }: ResumenFormalizacionesProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-10 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tarjeta 1: Total de causas e imputados */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Resumen General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {metricas.totalCausas}
                </div>
                <div className="text-xs text-gray-500">
                  Causas
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {metricas.totalImputados}
                </div>
                <div className="text-xs text-gray-500">
                  Imputados
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm font-medium flex justify-between mb-1">
                <span>Formalizados</span>
                <span>{metricas.porcentajeFormalizados.toFixed(1)}%</span>
              </div>
              <Progress 
                value={metricas.porcentajeFormalizados} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{metricas.totalFormalizados} formalizados</span>
                <span>{metricas.noFormalizados} sin formalizar</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tarjeta 2: Causas con/sin formalizados */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Estado de Causas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-green-700">
                  {metricas.causasConFormalizados}
                </div>
                <div className="text-xs text-green-600">
                  Causas con imputados formalizados
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-blue-700">
                  {metricas.causasSinFormalizados}
                </div>
                <div className="text-xs text-blue-600">
                  Causas sin imputados formalizados
                </div>
              </div>
            </div>
            <div className="mt-3 text-center text-sm">
              <span className="font-medium">Distribución: </span>
              <span>
                {metricas.totalCausas > 0 
                  ? ((metricas.causasConFormalizados / metricas.totalCausas) * 100).toFixed(1)
                  : 0}% con formalizados
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Tarjeta 3: Tiempo promedio */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Tiempo Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-gray-400 mr-2" />
                  <div className="text-3xl font-bold text-gray-700">
                    {metricas.promedioDiasFormalizacion}
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Días promedio entre hecho delictivo y formalización
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel de Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Alerta: Plazos Vencidos */}
        {metricas.alertas.vencidos > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Plazos Vencidos</AlertTitle>
            <AlertDescription>
              Hay {metricas.alertas.vencidos} imputado{metricas.alertas.vencidos !== 1 ? 's' : ''} con plazos de investigación vencidos que requieren atención inmediata.
            </AlertDescription>
          </Alert>
        )}

        {/* Alerta: Próximos a Vencer */}
        {metricas.alertas.porVencer > 0 && (
          <Alert variant="default" className="bg-yellow-50 border-yellow-200 text-yellow-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Plazos Próximos a Vencer</AlertTitle>
            <AlertDescription>
              Hay {metricas.alertas.porVencer} imputado{metricas.alertas.porVencer !== 1 ? 's' : ''} con plazos que vencerán en los próximos 10 días.
            </AlertDescription>
          </Alert>
        )}

        {/* Todo en orden */}
        {metricas.alertas.vencidos === 0 && metricas.alertas.porVencer === 0 && (
          <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Plazos en Orden</AlertTitle>
            <AlertDescription>
              No hay plazos vencidos ni próximos a vencer. Todos los plazos de investigación están dentro de los términos establecidos.
            </AlertDescription>
          </Alert>
        )}

        {/* Panel Informativo */}
        <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
          <Clock className="h-4 w-4" />
          <AlertTitle>Seguimiento de Plazos</AlertTitle>
          <AlertDescription>
            El panel muestra plazos de investigación desde la fecha de formalización. 
            <span className="font-medium">Alertas en rojo: vencidos</span>, 
            <span className="font-medium"> alertas en amarillo: vencen en 10 días o menos</span>.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}