// components/debug/SSEDebugPanel.tsx
'use client';

import { useState, useEffect } from 'react';
import { notificationService } from '@/lib/notifications/notificationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DiagnosticResult {
  success: boolean;
  diagnostics?: {
    timestamp: string;
    auth: {
      isAuthenticated: boolean;
      userId: string | null;
      sessionId: string | null;
    };
    database: {
      connected: boolean;
      userExists: boolean;
      userEmail: string | null;
    };
    sse: {
      endpointAvailable: boolean;
      ready: boolean;
    };
  };
  recommendations?: string[];
  error?: string;
  details?: string;
}

export function SSEDebugPanel() {
  const [status, setStatus] = useState({
    isConnected: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    enabled: true
  });

  const [notificationCount, setNotificationCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult | null>(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  const updateStatus = () => {
    const connectionStatus = notificationService.getConnectionStatus();
    setStatus(connectionStatus);
    setNotificationCount(notificationService.getNotifications().length);
    setUnreadCount(notificationService.getUnreadCount());
  };

  useEffect(() => {
    updateStatus();
    const interval = setInterval(updateStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleReconnect = () => {
    notificationService.connect();
    setTimeout(updateStatus, 1000);
    toast.info('Intentando reconectar SSE...');
  };

  const handleRefresh = async () => {
    await notificationService.refreshFromDB();
    updateStatus();
    toast.success('Notificaciones actualizadas desde BD');
  };

  const handleRunDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    try {
      const response = await fetch('/api/debug/sse-status');
      const result: DiagnosticResult = await response.json();
      setDiagnostics(result);
      
      if (result.success && result.diagnostics?.sse.ready) {
        toast.success('✅ Diagnóstico completado - Todo listo');
      } else {
        toast.warning('⚠️ Se encontraron problemas - Revisa las recomendaciones');
      }
    } catch (error) {
      toast.error('Error ejecutando diagnóstico');
      console.error('Diagnostic error:', error);
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  const renderStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Estado SSE Notificaciones</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            title="Refrescar"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado de Conexión */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Conexión SSE:</span>
          <Badge variant={status.isConnected ? 'default' : 'secondary'}>
            {status.isConnected ? (
              <>
                <Wifi className="mr-1 h-3 w-3" />
                Conectado
              </>
            ) : (
              <>
                <WifiOff className="mr-1 h-3 w-3" />
                Desconectado
              </>
            )}
          </Badge>
        </div>

        {/* Estado de Habilitación */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">SSE Habilitado:</span>
          <Badge variant={status.enabled ? 'default' : 'destructive'}>
            {status.enabled ? 'Sí' : 'No'}
          </Badge>
        </div>

        {/* Reintentos de Conexión */}
        {status.reconnectAttempts > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Reintentos:</span>
            <Badge variant="outline">
              {status.reconnectAttempts} / {status.maxReconnectAttempts}
            </Badge>
          </div>
        )}

        {/* Notificaciones */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Notificaciones:</span>
            <Badge variant="outline">{notificationCount}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">No Leídas:</span>
            <Badge variant={unreadCount > 0 ? 'default' : 'outline'}>
              {unreadCount}
            </Badge>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="space-y-2 pt-2 border-t">
          <Button
            onClick={handleRunDiagnostics}
            variant="outline"
            className="w-full"
            size="sm"
            disabled={isRunningDiagnostics}
          >
            {isRunningDiagnostics ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ejecutando Diagnóstico...
              </>
            ) : (
              <>
                <AlertCircle className="mr-2 h-4 w-4" />
                Ejecutar Diagnóstico Completo
              </>
            )}
          </Button>

          {!status.isConnected && status.enabled && (
            <Button
              onClick={handleReconnect}
              variant="secondary"
              className="w-full"
              size="sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reconectar SSE
            </Button>
          )}
        </div>

        {/* Resultados del Diagnóstico */}
        {diagnostics && diagnostics.success && diagnostics.diagnostics && (
          <div className="space-y-3 pt-2 border-t">
            <h4 className="font-semibold text-sm">Resultados del Diagnóstico:</h4>
            
            {/* Autenticación */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  {renderStatusIcon(diagnostics.diagnostics.auth.isAuthenticated)}
                  Autenticación
                </span>
                <Badge variant={diagnostics.diagnostics.auth.isAuthenticated ? 'default' : 'destructive'} className="text-xs">
                  {diagnostics.diagnostics.auth.isAuthenticated ? 'OK' : 'FALLO'}
                </Badge>
              </div>
              {diagnostics.diagnostics.auth.userId && (
                <p className="text-xs text-muted-foreground ml-6">
                  User ID: {diagnostics.diagnostics.auth.userId.substring(0, 20)}...
                </p>
              )}
            </div>

            {/* Base de Datos */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  {renderStatusIcon(diagnostics.diagnostics.database.connected)}
                  Base de Datos
                </span>
                <Badge variant={diagnostics.diagnostics.database.connected ? 'default' : 'destructive'} className="text-xs">
                  {diagnostics.diagnostics.database.connected ? 'OK' : 'FALLO'}
                </Badge>
              </div>
            </div>

            {/* Usuario en BD */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  {renderStatusIcon(diagnostics.diagnostics.database.userExists)}
                  Usuario en BD
                </span>
                <Badge variant={diagnostics.diagnostics.database.userExists ? 'default' : 'destructive'} className="text-xs">
                  {diagnostics.diagnostics.database.userExists ? 'OK' : 'FALLO'}
                </Badge>
              </div>
              {diagnostics.diagnostics.database.userEmail && (
                <p className="text-xs text-muted-foreground ml-6">
                  Email: {diagnostics.diagnostics.database.userEmail}
                </p>
              )}
            </div>

            {/* SSE Ready */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  {renderStatusIcon(diagnostics.diagnostics.sse.ready)}
                  SSE Listo
                </span>
                <Badge variant={diagnostics.diagnostics.sse.ready ? 'default' : 'destructive'} className="text-xs">
                  {diagnostics.diagnostics.sse.ready ? 'OK' : 'FALLO'}
                </Badge>
              </div>
            </div>

            {/* Recomendaciones */}
            {diagnostics.recommendations && diagnostics.recommendations.length > 0 && (
              <div className="pt-2 space-y-2">
                <h5 className="font-semibold text-xs">Recomendaciones:</h5>
                <div className="space-y-1">
                  {diagnostics.recommendations.map((rec, index) => (
                    <div key={index} className="text-xs bg-blue-50 dark:bg-blue-950 p-2 rounded">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Advertencia si SSE está deshabilitado */}
        {!status.enabled && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-md">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              SSE está deshabilitado. Las notificaciones solo se cargarán desde la base de datos.
            </p>
          </div>
        )}

        {/* Advertencia si alcanzó máximo de reintentos */}
        {status.reconnectAttempts >= status.maxReconnectAttempts && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="text-xs text-red-800 dark:text-red-200">
              <p className="font-medium mb-1">Máximo de reintentos alcanzado</p>
              <p>Ejecuta el diagnóstico completo para identificar el problema.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
