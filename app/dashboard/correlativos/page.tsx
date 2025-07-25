'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, RefreshCw, User } from 'lucide-react';
import { toast } from 'sonner';

interface TipoActividadInforme {
  id: number;
  nombre: string;
  siglainf: string;
}

interface CorrelativoInfo {
  numeroActual: number;
  siguienteNumero: number;
  sigla: string;
  correlativoCompleto: string;
}

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

interface Usuario {
  id: number;
  email: string;
  nombre?: string;
}

export default function CorrelativosPage() {
  const [tiposActividad, setTiposActividad] = useState<TipoActividadInforme[]>([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>('');
  const [correlativoInfo, setCorrelativoInfo] = useState<CorrelativoInfo | null>(null);
  const [historial, setHistorial] = useState<CorrelativoHistorial[]>([]);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const fetchUsuario = async () => {
    try {
      setIsLoadingUser(true);
      const response = await fetch('/api/usuarios/me');
      if (!response.ok) {
        throw new Error('Error al obtener información del usuario');
      }
      const userData = await response.json();
      setUsuario(userData);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar información del usuario');
      // En caso de error, podrías redirigir al login o mostrar un mensaje apropiado
    } finally {
      setIsLoadingUser(false);
    }
  };

  const fetchTiposActividad = async () => {
    try {
      const response = await fetch('/api/tipos-actividad-informe');
      if (!response.ok) throw new Error('Error al cargar tipos de actividad');
      const data = await response.json();
      setTiposActividad(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar los tipos de actividad');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCorrelativoInfo = async (tipoActividadId: string) => {
    try {
      const response = await fetch(`/api/correlativos?tipoActividadId=${tipoActividadId}`);
      if (!response.ok) throw new Error('Error al cargar correlativo');
      const data = await response.json();
      setCorrelativoInfo(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar información del correlativo');
      setCorrelativoInfo(null);
    }
  };

  const fetchHistorial = async (tipoActividadId?: string) => {
    try {
      const params = new URLSearchParams();
      params.append('limit', '10');
      
      if (tipoActividadId) {
        params.append('tipoActividadId', tipoActividadId);
      }

      const response = await fetch(`/api/correlativos/historial?${params.toString()}`);
      if (!response.ok) throw new Error('Error al cargar historial');
      
      const { data } = await response.json();
      setHistorial(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar historial');
    }
  };

  const handleTipoChange = (tipoId: string) => {
    setTipoSeleccionado(tipoId);
    if (tipoId) {
      fetchCorrelativoInfo(tipoId);
      fetchHistorial(tipoId);
    } else {
      setCorrelativoInfo(null);
      setHistorial([]);
    }
  };

  const handleGenerateCorrelativo = () => {
    if (!usuario) {
      toast.error('No se pudo obtener la información del usuario');
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmGenerate = async () => {
    if (!tipoSeleccionado || !usuario) {
      toast.error('Información insuficiente para generar el correlativo');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/correlativos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipoActividadId: tipoSeleccionado,
          usuarioId: usuario.id,
        }),
      });

      if (!response.ok) throw new Error('Error al generar correlativo');

      const data = await response.json();
      toast.success(`Correlativo generado: ${data.correlativoCompleto}`);
      
      // Actualizar la información del correlativo y el historial
      await fetchCorrelativoInfo(tipoSeleccionado);
      await fetchHistorial(tipoSeleccionado);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al generar el correlativo');
    } finally {
      setIsGenerating(false);
      setShowConfirmDialog(false);
    }
  };

  const refreshInfo = () => {
    if (tipoSeleccionado) {
      fetchCorrelativoInfo(tipoSeleccionado);
      fetchHistorial(tipoSeleccionado);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    // Cargar usuario primero, luego los demás datos
    fetchUsuario();
    fetchTiposActividad();
    fetchHistorial();
  }, []);

  const tipoActividadNombre = tiposActividad.find(
    t => t.id.toString() === tipoSeleccionado
  )?.nombre || '';

  // Mostrar loading si aún no se ha cargado el usuario
  if (isLoadingUser) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Cargando información del usuario...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si no se pudo cargar el usuario
  if (!usuario) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <User className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h2 className="text-lg font-semibold">Error al cargar usuario</h2>
              <p className="text-muted-foreground">
                No se pudo obtener la información del usuario. Por favor, intenta recargar la página.
              </p>
            </div>
            <Button onClick={fetchUsuario} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Intentar de nuevo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Correlativos de Informes</h1>
          <p className="text-muted-foreground mt-2">
            Genera correlativos secuenciales para informes de actividades
          </p>
          {usuario && (
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Usuario: {usuario.nombre || usuario.email}</span>
            </div>
          )}
        </div>
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Panel de Selección */}
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Tipo de Actividad</CardTitle>
            <CardDescription>
              Elige el tipo de actividad para gestionar su correlativo de informe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-center py-4">Cargando tipos de actividad...</div>
            ) : (
              <Select
                value={tipoSeleccionado}
                onValueChange={handleTipoChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo de actividad" />
                </SelectTrigger>
                <SelectContent>
                  {tiposActividad.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{tipo.siglainf}</Badge>
                        {tipo.nombre}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {correlativoInfo && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshInfo}
                  className="flex-shrink-0"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Actualizar información
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Panel de Información y Generación */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Correlativo</CardTitle>
            <CardDescription>
              Estado actual y generación del siguiente correlativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!tipoSeleccionado ? (
              <div className="text-center py-8 text-muted-foreground">
                Selecciona un tipo de actividad para ver su correlativo
              </div>
            ) : correlativoInfo ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <label className="text-sm font-medium text-muted-foreground">
                      Último Correlativo
                    </label>
                    <div className="text-2xl font-bold">
                      {correlativoInfo.numeroActual > 0 
                        ? `${correlativoInfo.sigla}-${String(correlativoInfo.numeroActual).padStart(3, '0')}`
                        : 'Ninguno'
                      }
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <label className="text-sm font-medium text-muted-foreground">
                      Siguiente Correlativo
                    </label>
                    <div className="text-2xl font-bold text-primary">
                      {correlativoInfo.correlativoCompleto}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    onClick={handleGenerateCorrelativo}
                    disabled={isGenerating || !usuario}
                    className="w-full"
                    size="lg"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {isGenerating ? 'Generando...' : 'Generar Correlativo'}
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Tipo:</strong> {tipoActividadNombre}</p>
                  <p><strong>Sigla:</strong> {correlativoInfo.sigla}</p>
                  <p><strong>Año:</strong> {new Date().getFullYear()}</p>
                  <p><strong>Numeración:</strong> Secuencial, se reinicia cada año</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Cargando información del correlativo...
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Historial de Correlativos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historial de Correlativos</CardTitle>
              <CardDescription>
                Últimos correlativos generados ({historial.length} mostrados)
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchHistorial(tipoSeleccionado || undefined)}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {historial.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {tipoSeleccionado ? 'No hay correlativos generados para este tipo' : 'No hay correlativos generados'}
            </div>
          ) : (
            <div className="space-y-2">
              {historial.map((correlativo) => (
                <div 
                  key={correlativo.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono text-sm">
                      {correlativo.sigla}-{String(correlativo.numero).padStart(3, '0')}
                    </Badge>
                    <div>
                      <div className="font-medium text-sm">
                        {correlativo.tipoActividadRelation.nombre}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Por: {correlativo.usuarioRelation.nombre || correlativo.usuarioRelation.email}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(correlativo.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Confirmación */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Generación de Correlativo</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas generar el correlativo{' '}
              <strong>{correlativoInfo?.correlativoCompleto}</strong> para{' '}
              <strong>{tipoActividadNombre}</strong>?
              <br />
              <br />
              Esta acción no se puede deshacer y el correlativo será incrementado permanentemente.
              {usuario && (
                <>
                  <br />
                  <br />
                  <span className="text-sm">
                    Será registrado a nombre de: <strong>{usuario.nombre || usuario.email}</strong>
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmGenerate}
              disabled={isGenerating || !usuario}
            >
              {isGenerating ? 'Generando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}