'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { notificationService } from '@/lib/notifications/notificationService';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { isLoaded, isSignedIn, userId } = useAuth();

  useEffect(() => {
    // 🔧 CRÍTICO: Solo inicializar cuando Clerk esté completamente cargado Y usuario autenticado
    if (!isLoaded) {
      console.log('⏳ [NotificationProvider] Esperando a que Clerk cargue...');
      return;
    }

    if (!isSignedIn || !userId) {
      console.log('⚠️ [NotificationProvider] Usuario no autenticado - notificaciones no iniciadas');
      return;
    }

    // ✅ Clerk listo y usuario autenticado - inicializar
    const initializeService = async () => {
      try {
        console.log('🚀 [NotificationProvider] Clerk listo - Inicializando servicio de notificaciones...');
        
        // Primero inicializar desde BD
        await notificationService.initializeFromDB();
        
        // Luego conectar SSE
        await notificationService.connect();
        
        console.log('✅ [NotificationProvider] Servicio inicializado correctamente');
      } catch (error) {
        console.error('❌ [NotificationProvider] Error inicializando:', error);
        
        // Si falla por autenticación, reintentar después de 2 segundos
        if (error instanceof Error && error.message === 'NOT_AUTHENTICATED') {
          console.log('🔄 [NotificationProvider] Reintentando en 2 segundos...');
          setTimeout(() => {
            initializeService();
          }, 2000);
        }
      }
    };

    initializeService();

    // Cleanup al desmontar
    return () => {
      console.log('🧹 [NotificationProvider] Limpiando conexiones...');
      notificationService.disconnect();
    };
  }, [isLoaded, isSignedIn, userId]);

  return <>{children}</>;
}
