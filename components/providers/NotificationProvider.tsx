'use client';

import { useEffect } from 'react';
import { notificationService } from '@/lib/notifications/notificationService';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  useEffect(() => {
    // Inicializar el servicio de notificaciones cuando la app se monta
    notificationService.connect();

    // Cleanup al desmontar
    return () => {
      notificationService.disconnect();
    };
  }, []);

  return <>{children}</>;
}
