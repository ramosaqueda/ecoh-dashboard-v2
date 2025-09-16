// /lib/notifications/server/sseManager.ts

// Almacenar conexiones activas
const connections = new Map<string, ReadableStreamDefaultController>();

// Función para enviar notificaciones a usuarios específicos
export function sendNotificationToUser(userId: string, notification: any): boolean {
  const controller = connections.get(userId);
  if (controller) {
    try {
      const eventData = {
        action: 'add',
        notification: {
          ...notification,
          timestamp: notification.timestamp || new Date()
        }
      };

      controller.enqueue(`data: ${JSON.stringify(eventData)}\n\n`);
      console.log(`📡 Notificación enviada a usuario ${userId}:`, notification.title);
      return true;
    } catch (error) {
      console.error(`Error enviando notificación a usuario ${userId}:`, error);
      connections.delete(userId);
      return false;
    }
  }
  console.log(`⚠️ Usuario ${userId} no conectado al SSE`);
  return false;
}

// Función para enviar notificaciones a todos los usuarios conectados
export function broadcastNotification(notification: any): number {
  let sent = 0;
  for (const [userId, controller] of Array.from(connections.entries())) {
    if (sendNotificationToUser(userId, notification)) {
      sent++;
    }
  }
  console.log(`📡 Notificación enviada a ${sent} usuarios conectados`);
  return sent;
}

// Función para obtener usuarios conectados
export function getConnectedUsers(): string[] {
  return Array.from(connections.keys());
}

// Función para registrar una nueva conexión
export function addConnection(userId: string, controller: ReadableStreamDefaultController): void {
  connections.set(userId, controller);
  console.log(`📡 Usuario ${userId} conectado al SSE. Total conexiones: ${connections.size}`);
}

// Función para eliminar una conexión
export function removeConnection(userId: string): void {
  connections.delete(userId);
  console.log(`📡 Usuario ${userId} desconectado del SSE. Total conexiones: ${connections.size}`);
}

// Función para verificar si un usuario está conectado
export function isUserConnected(userId: string): boolean {
  return connections.has(userId);
}

// Función para obtener estadísticas de conexiones
export function getConnectionStats() {
  return {
    totalConnections: connections.size,
    connectedUsers: Array.from(connections.keys())
  };
}

// Limpiar conexiones cerradas cada minuto
setInterval(() => {
  const activeConnections = connections.size;
  for (const [userId, controller] of Array.from(connections.entries())) {
    try {
      // Intentar enviar un ping para verificar si la conexión está activa
      controller.enqueue(`data: ${JSON.stringify({
        type: 'ping',
        timestamp: new Date().toISOString()
      })}\n\n`);
    } catch (error) {
      // Conexión cerrada, eliminarla
      connections.delete(userId);
    }
  }
  
  if (activeConnections !== connections.size) {
    console.log(`🧹 Limpieza SSE: ${activeConnections - connections.size} conexiones cerradas eliminadas`);
  }
}, 60000); // Cada minuto
