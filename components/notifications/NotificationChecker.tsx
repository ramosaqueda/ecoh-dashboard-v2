// /components/notifications/NotificationChecker.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationChecker() {
  const { user, isLoaded } = useUser(); // 🔧 Agregar isLoaded
  const { addNotification } = useNotifications();
  const processedNotifications = useRef(new Set<string>());
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // 🔧 CRÍTICO: Esperar a que Clerk esté completamente cargado
    if (!isLoaded) {
      console.log('⏳ [Notifications] Esperando a que Clerk se cargue...');
      return;
    }

    if (!user?.id) {
      console.log('❌ [Notifications] Usuario no autenticado');
      return;
    }

    // 🔧 Prevenir doble inicialización en StrictMode
    if (hasInitializedRef.current) {
      console.log('⏭️ [Notifications] Ya inicializado, skip');
      return;
    }

    hasInitializedRef.current = true;

    console.log(`✅ [Notifications] Clerk listo - Iniciando checker para ${user.firstName || user.emailAddresses[0]?.emailAddress}`);

    const checkForNotifications = async () => {
      // 🔧 Evitar llamadas concurrentes
      if (isChecking) {
        console.log('⏭️ [Notifications] Check ya en progreso, skip');
        return;
      }

      setIsChecking(true);

      // 🔧 Cancelar petición anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 🔧 Crear nuevo AbortController
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        console.log(`🔔 [Notifications] Checking for user: ${user.id}`);

        // 🔧 CRÍTICO: Agregar credentials y signal
        const response = await fetch(
          `/api/actividades/notify/check?userId=${user.id}`,
          {
            method: 'GET',
            credentials: 'include', // ✅ CRÍTICO: Enviar cookies de Clerk
            signal: controller.signal, // ✅ Permitir cancelación
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            console.error('❌ [Notifications] 401 Unauthorized - Problema de autenticación');
            throw new Error('Unauthorized');
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // 🔧 Reset retry count on success
        setRetryCount(0);

        if (data.notifications && data.notifications.length > 0) {
          console.log(`🔔 [Notifications] ${data.notifications.length} notificaciones encontradas`);

          // 🔧 Filtrar solo notificaciones nuevas
          const newNotifications = data.notifications.filter((notification: any) => {
            const notificationKey = `${notification.actividadId}-${notification.type}-${notification.timestamp || Date.now()}`;
            if (processedNotifications.current.has(notificationKey)) {
              return false;
            }
            processedNotifications.current.add(notificationKey);
            return true;
          });

          if (newNotifications.length > 0) {
            console.log(`✅ [Notifications] ${newNotifications.length} notificaciones NUEVAS`);

            newNotifications.forEach((notification: any) => {
              addNotification({
                title: notification.title,
                message: notification.message,
                type: notification.type,
                actividadId: notification.actividadId,
                causaRuc: notification.causaRuc,
                tipoActividad: notification.tipoActividad,
                actionUrl: notification.actionUrl,
                priority: notification.priority || 'medio',
              });

              console.log(`📬 [Notifications] Agregada: ${notification.title}`);
            });
          } else {
            console.log(`⏭️ [Notifications] Todas ya procesadas`);
          }
        } else {
          console.log(`📭 [Notifications] Sin notificaciones pendientes`);
        }
      } catch (error) {
        // 🔧 Ignorar errores de abort
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('🚫 [Notifications] Check cancelado');
          return;
        }

        console.error('❌ [Notifications] Error checking:', error);

        // 🔧 Implementar exponential backoff
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);

        if (newRetryCount >= 5) {
          console.error('🛑 [Notifications] Máximo de reintentos alcanzado, deteniendo checks');
          cleanup();
          return;
        }

        // Calcular delay con exponential backoff: 10s, 20s, 40s, 80s, 160s
        const backoffDelay = Math.min(10000 * Math.pow(2, newRetryCount - 1), 160000);
        console.log(`⏰ [Notifications] Reintentando en ${backoffDelay / 1000}s...`);
      } finally {
        setIsChecking(false);
      }
    };

    const cleanup = () => {
      console.log('🧹 [Notifications] Limpiando...');

      // Cancelar timeout inicial
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }

      // Cancelar interval
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }

      // Cancelar fetch pendiente
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      // Limpiar notificaciones procesadas
      processedNotifications.current.clear();

      console.log('✅ [Notifications] Limpieza completada');
    };

    // 🔧 Calcular delay inicial con exponential backoff
    const initialDelay = retryCount === 0 ? 5000 : Math.min(10000 * Math.pow(2, retryCount), 160000);

    console.log(`⏰ [Notifications] Check inicial en ${initialDelay / 1000}s`);

    // 🔧 Check inicial después de 5 segundos (dar tiempo a Analytics y Clerk)
    timeoutIdRef.current = setTimeout(() => {
      checkForNotifications();

      // 🔧 Iniciar interval solo después del primer check exitoso
      const intervalDelay = 30000; // 30 segundos (aumentado de 10s para reducir carga)
      console.log(`⏰ [Notifications] Iniciando checks cada ${intervalDelay / 1000}s`);

      intervalIdRef.current = setInterval(checkForNotifications, intervalDelay);
    }, initialDelay);

    console.log(`🔔 [Notifications] Checker inicializado para ${user.firstName || 'usuario'}`);

    // 🔧 Cleanup al desmontar
    return () => {
      console.log('🔔 [Notifications] Desmontando checker...');
      cleanup();
      hasInitializedRef.current = false;
    };
  }, [isLoaded, user?.id, addNotification, retryCount]); // 🔧 Agregar isLoaded a dependencias

  return null; // Este componente no renderiza nada
}
