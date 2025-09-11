// hooks/notifications/useNotifications.ts - CORREGIDO
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { 
  Notification, 
  NotificationStats, 
  SSEMessage, 
  NotificationContextType 
} from '@/types/notifications';
import { playNotificationSound } from '@/utils/notificationSound';

export function useNotifications(): NotificationContextType {
  const { isSignedIn, userId } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({ total: 0, unread: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Function to fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!isSignedIn) return;
    
    try {
      console.log('🔄 Fetching notifications...');
      const response = await fetch('/api/notifications?limit=50');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📋 Notifications received:', data.notifications?.length || 0);
      
      setNotifications(data.notifications || []);
      setStats(data.stats || { total: 0, unread: 0 });
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      toast.error('Error al cargar notificaciones');
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  // Function to establish SSE connection
  const connectSSE = useCallback(() => {
    if (!isSignedIn || !userId) return;

    // Cleanup existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    try {
      console.log('📡 Establishing SSE connection...');
      const eventSource = new EventSource('/api/notifications/stream');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('✅ SSE Connected to notifications');
        setIsConnected(true);
        setIsLoading(false);
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const message: SSEMessage = JSON.parse(event.data);
          console.log('📨 SSE Message received:', message.type);
          
          switch (message.type) {
            case 'notification':
              const notification = message.data as Notification;
              console.log('🔔 New notification:', notification.title);
              
              // Add new notification to the list
              setNotifications(prev => [notification, ...prev]);
              
              // Update stats
              setStats(prev => ({
                total: prev.total + 1,
                unread: prev.unread + 1
              }));
              
              // Play sound and show toast
              playNotificationSound();
              toast.info(notification.title, {
                description: notification.message,
                duration: 5000,
              });
              break;
              
            case 'stats':
              const newStats = message.data as NotificationStats;
              console.log('📊 Stats update:', newStats);
              setStats(newStats);
              break;
              
            case 'ping':
              // Keep-alive ping received - no action needed
              console.log('🏓 Ping received');
              break;
              
            default:
              console.warn('⚠️ Unknown SSE message type:', message.type);
          }
        } catch (error) {
          console.error('❌ Error parsing SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('❌ SSE connection error:', error);
        setIsConnected(false);
        
        eventSource.close();
        eventSourceRef.current = null;
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // 1s, 2s, 4s, 8s, 16s
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            console.log(`🔄 Attempting to reconnect SSE (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);
            connectSSE();
          }, delay);
        } else {
          console.error('❌ Max reconnection attempts reached');
          toast.error('Conexión de notificaciones perdida. Recarga la página.');
        }
      };

    } catch (error) {
      console.error('❌ Error creating SSE connection:', error);
      setIsConnected(false);
      setIsLoading(false);
    }
  }, [isSignedIn, userId]);

  // Function to mark notification as read
  const markAsRead = useCallback(async (id: number) => {
    try {
      console.log(`📖 Marking notification ${id} as read`);
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      
      setStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      }));

      console.log(`✅ Notification ${id} marked as read`);

    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      toast.error('Error al marcar como leída');
    }
  }, []);

  // Function to mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      console.log('📖 Marking all notifications as read');
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      setStats(prev => ({ ...prev, unread: 0 }));
      
      toast.success('Todas las notificaciones marcadas como leídas');
      console.log('✅ All notifications marked as read');

    } catch (error) {
      console.error('❌ Error marking all as read:', error);
      toast.error('Error al marcar todas como leídas');
    }
  }, []);

  // Function to delete notification
  const deleteNotification = useCallback(async (id: number) => {
    try {
      console.log(`🗑️ Deleting notification ${id}`);
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Update local state
      const notificationToDelete = notifications.find(n => n.id === id);
      
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      
      setStats(prev => ({
        total: Math.max(0, prev.total - 1),
        unread: notificationToDelete && !notificationToDelete.read 
          ? Math.max(0, prev.unread - 1) 
          : prev.unread
      }));
      
      toast.success('Notificación eliminada');
      console.log(`✅ Notification ${id} deleted`);

    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      toast.error('Error al eliminar notificación');
    }
  }, [notifications]);

  // Function to refresh notifications
  const refresh = useCallback(async () => {
    console.log('🔄 Refreshing notifications');
    setIsLoading(true);
    await fetchNotifications();
  }, [fetchNotifications]);

  // Initialize and manage connection
  useEffect(() => {
    if (isSignedIn && userId) {
      console.log('🚀 Initializing notifications system');
      fetchNotifications();
      connectSSE();
    }

    return () => {
      // Cleanup on unmount
      console.log('🧹 Cleaning up notifications system');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      setIsConnected(false);
    };
  }, [isSignedIn, userId, fetchNotifications, connectSSE]);

  // Cleanup on auth state change
  useEffect(() => {
    if (!isSignedIn) {
      console.log('🔐 User signed out - clearing notifications');
      setNotifications([]);
      setStats({ total: 0, unread: 0 });
      setIsConnected(false);
      setIsLoading(false);
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    }
  }, [isSignedIn]);

  return {
    notifications,
    stats,
    isConnected,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh
  };
}