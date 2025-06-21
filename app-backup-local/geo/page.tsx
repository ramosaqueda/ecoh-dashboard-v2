'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Importación dinámica del mapa para evitar SSR
const LeafletMap = dynamic(
  () => import('@/components/LeafletMap'),
  { 
    ssr: false,
    loading: () => <div className="flex h-screen w-full items-center justify-center">Cargando mapa...</div>
  }
);

interface MapData {
  causas: any[];
  showCrimenOrganizado: boolean;
  delitos: any[];
  filters: {
    delito: string;
    year: string;
    search: string;
    ecoh: boolean;
    crimenOrganizado: boolean;
  };
}

export default function FullscreenMapPage() {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Función para extraer los datos del hash de la URL
    const getMapDataFromHash = () => {
      if (typeof window === 'undefined') return null;
      
      try {
        // Extraer la porción del hash que contiene los datos
        const hash = window.location.hash;
        console.log("Hash de URL detectado:", hash ? "Presente" : "No presente");
        
        if (!hash || !hash.startsWith('#data=')) {
          console.error("Hash no válido o no presente");
          setError("No se detectaron datos en la URL");
          return null;
        }
        
        // Extraer y decodificar los datos
        const encodedData = hash.substring(6); // Quitar '#data='
        console.log("Longitud de datos codificados:", encodedData.length);
        
        // Comprobar si los datos son demasiado grandes
        if (encodedData.length > 1500000) {
          console.warn("Datos demasiado grandes para ser procesados en URL hash");
          setError("Datos demasiado grandes. Intente con menos causas.");
          return null;
        }
        
        const decodedData = decodeURIComponent(encodedData);
        console.log("Datos decodificados correctamente");
        
        try {
          const parsedData = JSON.parse(decodedData);
          console.log("Datos parseados correctamente:", parsedData ? "Éxito" : "Fallo");
          
          // Validación básica de estructura de datos
          if (!parsedData.causas || !Array.isArray(parsedData.causas)) {
            console.error("Estructura de datos inválida: causas no es un array");
            setError("Estructura de datos inválida");
            return null;
          }
          
          return parsedData;
        } catch (parseError) {
          console.error("Error al parsear JSON:", parseError);
          setError("Error al interpretar datos JSON");
          return null;
        }
      } catch (error) {
        console.error('Error al procesar datos del mapa:', error);
        setError("Error al procesar datos: " + (error instanceof Error ? error.message : String(error)));
        return null;
      }
    };

    // Intentar cargar los datos en mount y cuando cambie el hash
    const loadData = () => {
      setIsLoading(true);
      setError(null);
      
      const data = getMapDataFromHash();
      if (data) {
        console.log('Datos cargados:', `${data.causas.length} causas`);
        setMapData(data);
      } else {
        console.error('No se pudieron cargar los datos del mapa');
      }
      
      setIsLoading(false);
    };

    // Cargar los datos inicialmente
    loadData();

    // Escuchar cambios en el hash
    window.addEventListener('hashchange', loadData);
    return () => window.removeEventListener('hashchange', loadData);
  }, []);

  const handleGoBack = () => {
    router.push('/dashboard/geo');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-lg">Cargando datos del mapa...</div>
      </div>
    );
  }

  if (!mapData) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <div className="mb-4 text-lg text-red-600">
          No se pudieron cargar los datos del mapa.
          {error && (
            <div className="mt-2 text-sm">
              Error: {error}
            </div>
          )}
        </div>
        <div className="flex gap-4">
          <Button onClick={handleGoBack} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al dashboard
          </Button>
          <Button onClick={handleRetry} variant="default" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full">
      {/* Botón para volver */}
      <div className="absolute left-4 top-4 z-10">
        <Button 
          onClick={handleGoBack}
          variant="default" 
          className="flex items-center gap-2 bg-white text-black hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al dashboard
        </Button>
      </div>

      {/* Información de filtros activos */}
      <div className="absolute right-4 top-4 z-10 max-w-md rounded-lg bg-white p-3 shadow-lg">
        <div className="text-sm font-semibold">Filtros aplicados:</div>
        <div className="mt-1 text-xs">
          {mapData.filters.delito !== 'todos' && (
            <div>Delito: {
              mapData.delitos.find(d => d.id.toString() === mapData.filters.delito)?.nombre || mapData.filters.delito
            }</div>
          )}
          {mapData.filters.year !== 'todos' && <div>Año: {mapData.filters.year}</div>}
          {mapData.filters.search && <div><p>Búsqueda: &quot;{mapData.filters.search}&quot;</p></div>}
          {mapData.filters.ecoh && <div>Solo ECOH</div>}
          {mapData.filters.crimenOrganizado && <div>Solo Crimen Organizado</div>}
          <div className="mt-1 font-medium">
            Mostrando {mapData.causas.length} causas
          </div>
        </div>
      </div>

      {/* Mapa a pantalla completa */}
      <LeafletMap 
        causas={mapData.causas} 
        showCrimenOrganizado={mapData.showCrimenOrganizado}
      />
    </div>
  );
}