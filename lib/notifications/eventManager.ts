// /lib/notifications/eventManager.ts
type EventCallback = (data: any) => void;

class EventManager {
  private listeners: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)!.push(callback);
    
    // Retornar función de cleanup
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }

  off(event: string, callback?: EventCallback): void {
    if (!callback) {
      this.listeners.delete(event);
      return;
    }

    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }
}

export const eventManager = new EventManager();
