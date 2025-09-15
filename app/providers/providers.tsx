'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { NotificationProvider } from '@/components/providers/NotificationProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto
            refetchOnWindowFocus: false,
            retry: 1,
            // Añadir opciones adicionales recomendadas
            refetchOnMount: true,
            refetchOnReconnect: true,
            gcTime: 5 * 60 * 1000 // 5 minutos
          },
          mutations: {
            // Configuración por defecto para mutaciones
            retry: 1,
            onError: (error: unknown) => {
              // Manejo global de errores de mutación
              console.error('Error en mutación:', error);
            }
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools
            initialIsOpen={false}
            position={"bottom-right" as any}
            buttonPosition={"bottom-right" as any}
          />
        )}
      </NotificationProvider>
    </QueryClientProvider>
  );
}
