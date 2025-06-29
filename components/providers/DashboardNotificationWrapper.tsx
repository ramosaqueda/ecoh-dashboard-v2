'use client';

import { useUser } from '@clerk/nextjs';
import { useNotifications } from '@/hooks/useNotifications';
import { Toaster } from 'sonner';
import { useEffect } from 'react';

interface DashboardNotificationWrapperProps {
  children: React.ReactNode;
}

export function DashboardNotificationWrapper({ children }: DashboardNotificationWrapperProps) {
  const { user, isLoaded } = useUser();
  
  // 🔔 ACTIVAR: Sistema de notificaciones automáticamente
  useNotifications();

  // 🆕 OPCIONAL: Log de conexión en desarrollo
  useEffect(() => {
    if (isLoaded && user && process.env.NODE_ENV === 'development') {
      console.log('🔔 Sistema de notificaciones activado en dashboard para:', user.firstName, user.lastName);
    }
  }, [isLoaded, user]);

  return (
    <>
      {/* 🔸 MANTIENE: Todo el contenido del dashboard */}
      {children}
      
      {/* 🆕 AÑADE: Toaster para notificaciones - solo en dashboard */}
      <Toaster 
        richColors 
        position="top-right" 
        closeButton
        expand={true}
        toastOptions={{
          duration: 5000,
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </>
  );
}