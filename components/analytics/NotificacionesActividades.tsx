'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  X,
  Calendar,
  User,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notificacion {
  id: string;
  tipo: 'vencida' | 'proxima_vencer' | 'asignada' | 'completada';
  titulo: string;
  mensaje: string;
  fechaCreacion: Date;
  actividadId?: number;
  esUrgente: boolean;
  leida: boolean;
}

interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: {
    id: number;
    nombre: string;
  };
}

export default function NotificacionesActividades() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Obtener usuario actual
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/usuarios/me');
      if (!response.ok) throw new Error('Error al obtener usuario');
      
      const userData = await response.json();
      const userWithRole = await fetch(`/api/usuarios?roles=${userData.rolId || 3}`);
      
      if (userWithRole.ok) {
        const usersData = await userWithRole.json();
        const foundUser = usersData.find((u: Usuario) => u.id === userData.id);
        if (foundUser) {
          setCurrentUser(foundUser);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Generar notificaciones basadas en actividades
  const generarNotificaciones = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/actividades?limit=500&include_assigned=true');
      if (!response.ok) throw new Error('Error al cargar actividades');
      
      const jsonResponse = await response.json();
      const data = jsonResponse.data || [];
      
      const notificacionesGeneradas: Notificacion[] = [];
      const today = new Date();
      
      // Filtrar actividades del usuario
      const actividadesUsuario = data.filter((a: any) => {
        const esAsignadaAMi = (a.usuarioAsignado?.id || a.usuario?.id) === currentUser.id;
        const esAsignadaPorMi = a.usuario?.id === currentUser.id;
        return esAsignadaAMi || esAsignadaPorMi;
      });
      
      actividadesUsuario.forEach((actividad: any) => {
        const fechaVencimiento = new Date(actividad.fechaTermino);
        const diffDays = Math.ceil((fechaVencimiento.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const assignedUserId = actividad.usuarioAsignado?.id || actividad.usuario?.id;
        
        // Actividades vencidas
        if (diffDays < 0 && actividad.estado !== 'terminado' && assignedUserId === currentUser.id) {
          notificacionesGeneradas.push({
            id: `vencida-${actividad.id}`,
            tipo: 'vencida',
            titulo: 'Actividad Vencida',
            mensaje: `"${actividad.tipoActividad.nombre}" en causa ${actividad.causa.ruc} venció hace ${Math.abs(diffDays)} días`,
            fechaCreacion: new Date(),
            actividadId: actividad.id,
            esUrgente: true,
            leida: false
          });
        }
        
        // Actividades próximas a vencer
        if (diffDays >= 0 && diffDays <= 3 && actividad.estado !== 'terminado' && assignedUserId === currentUser.id) {
          notificacionesGeneradas.push({
            id: `proxima-${actividad.id}`,
            tipo: 'proxima_vencer',
            titulo: 'Actividad Próxima a Vencer',
            mensaje: `"${actividad.tipoActividad.nombre}" en causa ${actividad.causa.ruc} vence en ${diffDays} día${diffDays !== 1 ? 's' : ''}`,
            fechaCreacion: new Date(),
            actividadId: actividad.id,
            esUrgente: diffDays <= 1,
            leida: false
          });
        }
        
        // Actividades recién asignadas a mí (simulado)
        if (actividad.usuarioAsignado?.id === currentUser.id && actividad.estado === 'inicio') {
          const probability = Math.random();
          if (probability < 0.3) { // 30% de probabilidad para simulación
            notificacionesGeneradas.push({
              id: `asignada-${actividad.id}`,
              tipo: 'asignada',
              titulo: 'Nueva Actividad Asignada',
              mensaje: `Te han asignado "${actividad.tipoActividad.nombre}" en causa ${actividad.causa.ruc}`,
              fechaCreacion: new Date(),
              actividadId: actividad.id,
              esUrgente: false,
              leida: false
            });
          }
        }
        
        // Actividades completadas por otros (que yo asigné)
        if (actividad.usuario?.id === currentUser.id && actividad.usuarioAsignado && actividad.estado === 'terminado') {
          const probability = Math.random();
          if (probability < 0.2) { // 20% de probabilidad para simulación
            notificacionesGeneradas.push({
              id: `completada-${actividad.id}`,
              tipo: 'completada',
              titulo: 'Actividad Completada',
              mensaje: `${actividad.usuarioAsignado.nombre || actividad.usuarioAsignado.email} completó "${actividad.tipoActividad.nombre}"`,
              fechaCreacion: new Date(),
              actividadId: actividad.id,
              esUrgente: false,
              leida: false
            });
          }
        }
      });
      
      // Ordenar por urgencia y fecha
      notificacionesGeneradas.sort((a, b) => {
        if (a.esUrgente !== b.esUrgente) return a.esUrgente ? -1 : 1;
        return b.fechaCreacion.getTime() - a.fechaCreacion.getTime();
      });
      
      setNotificaciones(notificacionesGeneradas.slice(0, 10)); // Mostrar solo las 10 más importantes
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Marcar notificación como leída
  const marcarComoLeida = (id: string) => {
    setNotificaciones(prev => prev.map(notif => 
      notif.id === id ? { ...notif, leida: true } : notif
    ));
  };

  // Eliminar notificación
  const eliminarNotificacion = (id: string) => {
    setNotificaciones(prev => prev.filter(notif => notif.id !== id));
  };

  // Marcar todas como leídas
  const marcarTodasComoLeidas = () => {
    setNotificaciones(prev => prev.map(notif => ({ ...notif, leida: true })));
    toast.success('Todas las notificaciones marcadas como leídas');
  };

  // Obtener icono según tipo
  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'vencida':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'proxima_vencer':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'asignada':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'completada':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  // Obtener color de fondo según tipo
  const getColorFondo = (tipo: string, esUrgente: boolean) => {
    if (esUrgente) return 'bg-red-50 border-red-200';
    
    switch (tipo) {
      case 'vencida':
        return 'bg-red-50 border-red-200';
      case 'proxima_vencer':
        return 'bg-orange-50 border-orange-200';
      case 'asignada':
        return 'bg-blue-50 border-blue-200';
      case 'completada':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      generarNotificaciones();
    }
  }, [currentUser]);

  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-5 w-5 text-purple-600" />
            Notificaciones
            {notificacionesNoLeidas > 0 && (
              <Badge variant="destructive" className="text-xs">
                {notificacionesNoLeidas}
              </Badge>
            )}
          </CardTitle>
          
          {notificacionesNoLeidas > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={marcarTodasComoLeidas}
              className="text-xs"
            >
              Marcar todas como leídas
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Sin notificaciones</h3>
            <p className="text-muted-foreground">No hay notificaciones pendientes.</p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-3">
              {notificaciones.map((notificacion) => (
                <div
                  key={notificacion.id}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    getColorFondo(notificacion.tipo, notificacion.esUrgente)
                  } ${
                    notificacion.leida ? 'opacity-60' : 'opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIconoTipo(notificacion.tipo)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">
                            {notificacion.titulo}
                          </h4>
                          {notificacion.esUrgente && (
                            <Badge variant="destructive" className="text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              Urgente
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {notificacion.mensaje}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {format(notificacion.fechaCreacion, 'dd/MM/yyyy HH:mm', { locale: es })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      {!notificacion.leida && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => marcarComoLeida(notificacion.id)}
                          className="h-6 w-6 p-0"
                        >
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarNotificacion(notificacion.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        {notificaciones.length > 0 && (
          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-xs text-muted-foreground">
              Mostrando las {notificaciones.length} notificaciones más recientes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}