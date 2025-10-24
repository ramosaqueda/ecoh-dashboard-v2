// lib/notifications/NotificationProvider.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { notificationService } from './notificationService';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Esperar a que Clerk esté completamente cargado
    if (!isLoaded) {
      console.log('⏳ Esperando a que Clerk cargue...');
      return;
    }

    // Si no está autenticado, no inicializar notificaciones
    if (!isSignedIn) {
      console.log('⚠️ Usuario no autenticado - notificaciones no iniciadas');
      return;
    }

    // Clerk está listo y usuario autenticado - inicializar servicio
    const initializeService = async () => {
      try {
        console.log('🚀 Clerk listo - Inicializando servicio de notificaciones...');
        await notificationService.initializeFromDB();
        
        // Conectar SSE después de inicializar
        await notificationService.connect();
        
        setIsInitialized(true);
        console.log('✅ Servicio de notificaciones inicializado correctamente');
      } catch (error) {
        console.error('❌ Error inicializando servicio de notificaciones:', error);
        
        // Si falla por autenticación, reintentar después de 2 segundos
        if (error instanceof Error && error.message === 'NOT_AUTHENTICATED') {
          console.log('🔄 Reintentando en 2 segundos...');
          setTimeout(() => {
            initializeService();
          }, 2000);
        }
      }
    };

    initializeService();

    // Cleanup al desmontar
    return () => {
      notificationService.disconnect();
    };
  }, [isLoaded, isSignedIn, userId]);

  return <>{children}</>;
}
