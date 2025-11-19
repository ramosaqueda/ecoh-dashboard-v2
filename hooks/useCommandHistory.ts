import { useState, useEffect } from 'react';

const HISTORY_KEY = 'ecoh-command-history';
const MAX_HISTORY_ITEMS = 5;

export interface HistoryItem {
  id: string;
  title: string;
  href?: string;
  action?: () => void;
  timestamp: number;
}

export function useCommandHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Cargar historial al montar
  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      } catch (error) {
        console.error('Error loading command history:', error);
      }
    }
  }, []);

  const addToHistory = (item: Omit<HistoryItem, 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      // Remover duplicados (mismo id)
      const filtered = prev.filter((h) => h.id !== newItem.id);
      
      // Agregar al inicio y limitar tamaño
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      
      // Guardar en localStorage
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  return {
    history,
    addToHistory,
    clearHistory,
  };
}
