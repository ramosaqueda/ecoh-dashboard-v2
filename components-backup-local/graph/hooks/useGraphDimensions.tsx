// hooks/useGraphDimensions.ts
import { useState, useEffect } from 'react';

interface Dimensions {
  width: number;
  height: number;
}

export const useGraphDimensions = (): Dimensions => {
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: typeof window !== 'undefined' ? window.innerWidth - 100 : 800,
    height: typeof window !== 'undefined' ? window.innerHeight - 300 : 600
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth - 100,
        height: window.innerHeight - 300
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Limpieza del event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return dimensions;
};

export default useGraphDimensions;