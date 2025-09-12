// hooks/useNotifications.ts - VERSIÓN CON PERSISTENCIA LOCAL

import { useState, useEffect, useRef, useCallback } from 'react';
import { Notification, NotificationEvent, NotificationStats } from '@/lib/notifications/types';
import { audioManager } from '@/lib/notifications/audioManager';

interface UseNotificationsOptions {
  autoConnect?: boolean;
  enableAudio?: boolean;
  userEmail?: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  isConnecting: boolean;
  stats: NotificationStats | null;
  connect: () => void;
  disconnect: () => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => void;
  removeNotification: (notificationId: string) => void;
  playTestSound: () => void;
  setAudioEnabled: (enabled: boolean) => void;
  isAudioEnabled: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const { autoConnect = true, enableAudio = true, userEmail = '' } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(enableAudio);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const currentUserEmailRef = useRef(userEmail);
  const connectionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const maxReconnectAttempts = 5;
  const reconnectDelays = [1000, 2000, 4000, 8000, 16000];

  // Cargar notificaciones persistentes al inicializar
  useEffect(() => {
    if (userEmail) {
      const savedKey = `notifications_${userEmail}`;
      try {
        const saved = localStorage.getItem(savedKey);
        if (saved) {
          const parsedNotifications = JSON.parse(saved);
          // Filtrar notificaciones no expiradas
          const validNotifications = parsedNotifications.filter((n: Notification) => {
            if (!n.expiresAt) return true;
            return new Date(n.expiresAt) > new Date();
          });
          setNotifications(validNotifications);
        }
      } catch (error) {
        // Ignore localStorage errors
      }
    }
  }, [userEmail]);

  // Guardar notificaciones en localStorage
  const saveNotifications = useCallback((notifs: Notification[]) => {
    if (userEmail) {
      const savedKey = `notifications_${userEmail}`;
      try {
        localStorage.setItem(savedKey, JSON.stringify(notifs));
      } catch (error) {
        // Ignore localStorage errors
      }
    }
  }, [userEmail]);

  useEffect(() => {
    currentUserEmailRef.current = userEmail;
  }, [userEmail]);

  const loadStats = useCallback(async () => {
    const email = currentUserEmailRef.current;
    if (!email) return;
    
    try {
      const response = await fetch('/api/notifications/sse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': email
        },
        body: JSON.stringify({ action: 'stats' })
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.user);
      }
    } catch (error) {
      // Silently handle stats errors
    }
  }, []);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (connectionTimerRef.current) {
      clearTimeout(connectionTimerRef.current);
      connectionTimerRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  const connect = useCallback(() => {
    const email = currentUserEmailRef.current;
    
    if (!email || eventSourceRef.current || isConnecting) {
      return;
    }
    
    setIsConnecting(true);
    
    try {
      const url = `/api/notifications/sse?userEmail=${encodeURIComponent(email)}`;
      const eventSource = new EventSource(url);
      
      eventSource.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttemptsRef.current = 0;
        loadStats();
      };
      
      eventSource.onmessage = (event: MessageEvent) => {
        try {
          const notificationEvent: NotificationEvent = JSON.parse(event.data);
          
          if (notificationEvent.type === 'notification' && notificationEvent.data) {
            const notification = notificationEvent.data as Notification;
            
            setNotifications(prev => {
              if (prev.some(n => n.id === notification.id)) return prev;
              const newNotifications = [notification, ...prev].slice(0, 100);
              saveNotifications(newNotifications);
              return newNotifications;
            });

            if (enableAudio && !notification.read) {
              audioManager.playNotificationSound(notification.priority);
            }
          }
        } catch (error) {
          // Ignore malformed messages
        }
      };
      
      eventSource.onerror = () => {
        disconnect();
        
        if (autoConnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = reconnectDelays[Math.min(reconnectAttemptsRef.current, reconnectDelays.length - 1)];
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          setIsConnecting(false);
        }
      };
      
      eventSourceRef.current = eventSource;
      
    } catch (error) {
      setIsConnecting(false);
    }
  }, [disconnect, loadStats, autoConnect, enableAudio, isConnecting, saveNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const email = currentUserEmailRef.current;
    if (!email) return;
    
    try {
      const response = await fetch('/api/notifications/sse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': email
        },
        body: JSON.stringify({ 
          action: 'mark_read', 
          notificationId 
        })
      });
      
      if (response.ok) {
        setNotifications(prev => {
          const updated = prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          );
          saveNotifications(updated);
          return updated;
        });
        loadStats();
      }
    } catch (error) {
      // Silently handle errors
    }
  }, [loadStats, saveNotifications]);

  const markAllAsRead = useCallback(async () => {
    const email = currentUserEmailRef.current;
    if (!email) return;
    
    try {
      const response = await fetch('/api/notifications/sse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': email
        },
        body: JSON.stringify({ action: 'mark_all_read' })
      });
      
      if (response.ok) {
        setNotifications(prev => {
          const updated = prev.map(n => ({ ...n, read: true }));
          saveNotifications(updated);
          return updated;
        });
        loadStats();
      }
    } catch (error) {
      // Silently handle errors
    }
  }, [loadStats, saveNotifications]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
  }, [saveNotifications]);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== notificationId);
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  const playTestSound = useCallback(() => {
    audioManager.playTestSound();
  }, []);

  const setAudioEnabledHandler = useCallback((enabled: boolean) => {
    setIsAudioEnabled(enabled);
    audioManager.setEnabled(enabled);
  }, []);

  // Main connection effect
  useEffect(() => {
    if (!userEmail || !autoConnect) {
      return;
    }

    if (eventSourceRef.current) {
      return;
    }

    if (connectionTimerRef.current) {
      clearTimeout(connectionTimerRef.current);
      connectionTimerRef.current = null;
    }
    
    connectionTimerRef.current = setTimeout(() => {
      if (enableAudio) {
        audioManager.requestAudioPermission();
      }
      connect();
    }, 1000);

    return () => {
      if (connectionTimerRef.current) {
        clearTimeout(connectionTimerRef.current);
        connectionTimerRef.current = null;
      }
    };
  }, [userEmail, autoConnect, enableAudio, connect]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isConnected,
    isConnecting,
    stats,
    connect,
    disconnect,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    removeNotification,
    playTestSound,
    setAudioEnabled: setAudioEnabledHandler,
    isAudioEnabled
  };
}
