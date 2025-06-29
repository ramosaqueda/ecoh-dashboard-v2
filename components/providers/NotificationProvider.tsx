'use client';

import { useUser } from '@clerk/nextjs';
import { useNotifications } from '@/hooks/useNotifications';
import { useEffect } from 'react';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user, isLoaded } = useUser();
  
  // Activar las notificaciones solo cuando el usuario esté autenticado
  useNotifications();

  // Opcional: mostrar estado de conexión en desarrollo
  useEffect(() => {
    if (isLoaded && user && process.env.NODE_ENV === 'development') {
      console.log('🔔 Sistema de notificaciones activado para usuario:', user.firstName, user.lastName);
    }
  }, [isLoaded, user]);

  return <>{children}</>;
}