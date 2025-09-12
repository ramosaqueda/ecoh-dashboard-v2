// lib/notifications/eventManager.ts - VERSIÓN LIMPIA Y OPTIMIZADA

import { Notification, NotificationEvent } from './types';

interface SSEClient {
  id: string;
  userId: string;
  controller: ReadableStreamDefaultController;
  connectedAt: number;
}

class EventManager {
  private clients = new Map<string, SSEClient>();

  addClient(clientId: string, userId: string, controller: ReadableStreamDefaultController): void {
    this.clients.set(clientId, {
      id: clientId,
      userId,
      controller,
      connectedAt: Date.now()
    });
    
    this.sendWelcomeMessage(clientId);
  }

  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      this.safeCloseController(client.controller);
      this.clients.delete(clientId);
    }
  }

  sendToUser(userId: string, notification: Notification): void {
    const userClients = Array.from(this.clients.values())
      .filter(client => client.userId === userId);

    if (userClients.length === 0) return;

    const event: NotificationEvent = {
      type: 'notification',
      data: notification,
      timestamp: Date.now()
    };

    userClients.forEach(client => {
      this.sendToClient(client.id, event);
    });
  }

  getStats() {
    const userConnections = new Map<string, number>();
    
    this.clients.forEach(client => {
      const count = userConnections.get(client.userId) || 0;
      userConnections.set(client.userId, count + 1);
    });

    return {
      totalClients: this.clients.size,
      connectedUsers: userConnections.size,
      userConnections: Object.fromEntries(userConnections)
    };
  }

  sendHeartbeat(userId?: string): void {
    const event: NotificationEvent = {
      type: 'heartbeat',
      data: { message: 'ping' },
      timestamp: Date.now()
    };

    if (userId) {
      const userClients = Array.from(this.clients.values())
        .filter(client => client.userId === userId);
      userClients.forEach(client => this.sendToClient(client.id, event));
    } else {
      this.clients.forEach(client => this.sendToClient(client.id, event));
    }
  }

  cleanup(): void {
    this.clients.forEach((client, clientId) => {
      this.removeClient(clientId);
    });
  }

  private sendWelcomeMessage(clientId: string): void {
    this.sendToClient(clientId, {
      type: 'heartbeat',
      data: { message: 'connected' },
      timestamp: Date.now()
    });
  }

  private sendToClient(clientId: string, event: NotificationEvent): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      const data = `data: ${JSON.stringify(event)}\n\n`;
      client.controller.enqueue(new TextEncoder().encode(data));
    } catch (error) {
      this.removeClient(clientId);
    }
  }

  private safeCloseController(controller: ReadableStreamDefaultController): void {
    try {
      controller.close();
    } catch (error) {
      // Controller already closed or in error state - ignore
    }
  }
}

export const eventManager = new EventManager();
