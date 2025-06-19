// Para evitar duplicación de código, podemos crear un hook genérico:
// hooks/useSelectData.ts
import { useState, useEffect } from 'react';

interface SelectData {
  id: number;
  nombre: string;
}

interface UseSelectDataOptions {
  endpoint: string;
  errorMessage: string;
}

export function useSelectData<T extends SelectData>({
  endpoint,
  errorMessage
}: UseSelectDataOptions) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {      
      const response = await fetch(`${API_BASE_URL}/api/${endpoint}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const responseData = await response.json();
      const sortedData = Array.isArray(responseData)
        ? responseData.sort((a, b) => a.nombre.localeCompare(b.nombre))
        : [responseData];
      setData(sortedData);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      setError(error instanceof Error ? error.message : errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  return { data, isLoading, error, refetch: fetchData };
}
