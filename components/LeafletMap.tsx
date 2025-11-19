'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import L from 'leaflet';
import 'leaflet.markercluster';

// Variable global para controlar la inicialización de iconos
let iconsInitialized = false;

// Función para inicializar los iconos de Leaflet (solo una vez)
const initializeLeafletIcons = () => {
  if (iconsInitialized) return;
  
  delete (L.Icon.Default.prototype as any)._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png'
  });
  
  iconsInitialized = true;
};

interface LeafletMapProps {
  causas: Array<{
    id: number;
    denominacionCausa: string;
    ruc: string;
    coordenadasSs: string | null;
    esCrimenOrganizado?: boolean | number;
    delito?: {
      id: number;
      nombre: string;
    };
  }>;
  showCrimenOrganizado?: boolean;
}

export default function LeafletMap({ causas, showCrimenOrganizado = false }: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [clusterEnabled, setClusterEnabled] = useState(true);

  // Función para obtener posición
  const getPosicion = (coordStr: string | null) => {
    const defaultCoords = {
      lat: -33.4489,
      lng: -70.6693,
      isValid: false
    };

    if (!coordStr) return defaultCoords;

    try {
      const [lat, lng] = coordStr.split(',').map(coord => parseFloat(coord.trim()));
      
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return defaultCoords;
      }

      return { lat, lng, isValid: true };
    } catch (error) {
      return defaultCoords;
    }
  };

  // Filtrar causas
  const filteredCausas = useMemo(() => {
    if (!showCrimenOrganizado) return causas;
    
    return causas.filter(causa => {
      if (typeof causa.esCrimenOrganizado === 'boolean') {
        return causa.esCrimenOrganizado === true;
      } else if (typeof causa.esCrimenOrganizado === 'number') {
        return causa.esCrimenOrganizado === 1;
      }
      return false;
    });
  }, [causas, showCrimenOrganizado]);

  // Función para obtener el color del marcador
  const getMarkerColor = (causa: any) => {
    if (showCrimenOrganizado) {
      return '#e74c3c';
    }

    const colorMap: { [key: number]: string } = {
      1: '#e74c3c',
      2: '#3498db',
      3: '#2ecc71',
      4: '#f1c40f'
    };

    return causa.delito?.id ? colorMap[causa.delito.id] || '#95a5a6' : '#95a5a6';
  };

  // Crear un icono personalizado
  const createCustomMarker = (causa: any) => {
    const color = getMarkerColor(causa);
    const isCrimenOrg = typeof causa.esCrimenOrganizado === 'boolean' 
      ? causa.esCrimenOrganizado 
      : causa.esCrimenOrganizado === 1;
    
    const size = showCrimenOrganizado || isCrimenOrg ? 24 : 20;
    const anchorSize = size / 2;

    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 4px rgba(0,0,0,0.3);
          ${(showCrimenOrganizado || isCrimenOrg) ? 'animation: pulse 1.5s infinite;' : ''}
        "></div>
      `,
      className: 'custom-marker',
      iconSize: [size, size],
      iconAnchor: [anchorSize, anchorSize]
    });
  };

  // Calcular centro inicial
  const centroInicial = useMemo(() => {
    const primerPuntoValido = filteredCausas.find(causa => {
      const coords = getPosicion(causa.coordenadasSs);
      return coords.isValid;
    });

    return primerPuntoValido
      ? getPosicion(primerPuntoValido.coordenadasSs)
      : getPosicion(null);
  }, [filteredCausas]);

  // Efecto para marcar que estamos en el cliente
  useEffect(() => {
    setIsClient(true);
    initializeLeafletIcons();
  }, []);

  // Efecto para inicializar el mapa
  useEffect(() => {
    if (!isClient) {
      console.log('🔄 Esperando cliente...');
      return;
    }

    if (!mapContainerRef.current) {
      console.log('🔄 Esperando contenedor...');
      return;
    }

    if (mapInstanceRef.current) {
      console.log('✅ Mapa ya existe, saltando inicialización');
      return;
    }

    const container = mapContainerRef.current;
    console.log('🚀 Iniciando creación del mapa...');

    if ((container as any)._leaflet_id) {
      console.log('🧹 Limpiando ID de Leaflet previo...');
      delete (container as any)._leaflet_id;
      container.innerHTML = '';
    }

    try {
      console.log('📍 Centro inicial:', centroInicial);
      
      const map = L.map(container, {
        center: [centroInicial.lat, centroInicial.lng],
        zoom: 12,
        scrollWheelZoom: true,
        zoomControl: true
      });

      console.log('✅ Mapa creado');

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(map);

      console.log('✅ Tiles agregados');

      // Crear layer group normal y cluster group
      const markersLayer = L.layerGroup();
      const clusterGroup = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true,
        zoomToBoundsOnClick: true,
        iconCreateFunction: function(cluster) {
          const childCount = cluster.getChildCount();
          let c = ' marker-cluster-';
          
          if (childCount < 10) {
            c += 'small';
          } else if (childCount < 50) {
            c += 'medium';
          } else {
            c += 'large';
          }

          return L.divIcon({
            html: `<div><span>${childCount}</span></div>`,
            className: 'marker-cluster' + c,
            iconSize: L.point(40, 40)
          });
        }
      });

      console.log('✅ Layers creados');

      mapInstanceRef.current = map;
      markersLayerRef.current = markersLayer;
      clusterGroupRef.current = clusterGroup;
      
      setTimeout(() => {
        map.invalidateSize();
        console.log('✅ Tamaño del mapa invalidado');
      }, 100);

      setMapReady(true);
      setInitError(null);
      console.log('✅ Mapa inicializado completamente');

    } catch (error) {
      console.error('❌ Error al inicializar mapa:', error);
      setInitError(error instanceof Error ? error.message : 'Error desconocido');
      setMapReady(false);
    }

    return () => {
      console.log('🧹 Limpiando mapa...');
      
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          markersLayerRef.current = null;
          clusterGroupRef.current = null;
          setMapReady(false);
          console.log('✅ Mapa limpiado');
        } catch (error) {
          console.error('❌ Error al limpiar mapa:', error);
        }
      }
    };
  }, [isClient, centroInicial]);

  // Efecto para actualizar marcadores cuando cambien las causas o el modo cluster
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) {
      console.log('⏸️ Esperando mapa para agregar marcadores...');
      return;
    }

    console.log(`📍 Agregando ${filteredCausas.length} marcadores... (Cluster: ${clusterEnabled ? 'ON' : 'OFF'})`);

    // Limpiar capas existentes
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
      mapInstanceRef.current.removeLayer(markersLayerRef.current);
    }
    
    if (clusterGroupRef.current) {
      clusterGroupRef.current.clearLayers();
      mapInstanceRef.current.removeLayer(clusterGroupRef.current);
    }

    // Determinar qué capa usar
    const targetLayer = clusterEnabled ? clusterGroupRef.current : markersLayerRef.current;
    
    if (!targetLayer) {
      console.error('❌ No hay capa disponible');
      return;
    }

    // Agregar nuevos marcadores
    let validMarkersCount = 0;
    filteredCausas.forEach((causa) => {
      const coordenadas = getPosicion(causa.coordenadasSs);
      if (!coordenadas.isValid) return;

      validMarkersCount++;
      const isCrimenOrg = typeof causa.esCrimenOrganizado === 'boolean' 
        ? causa.esCrimenOrganizado 
        : causa.esCrimenOrganizado === 1;

      const marker = L.marker([coordenadas.lat, coordenadas.lng], {
        icon: createCustomMarker(causa)
      });

      marker.bindPopup(`
        <div style="padding: 8px;">
          <h3 style="font-weight: bold; margin: 0 0 8px 0;">${causa.denominacionCausa || 'Sin denominación'}</h3>
          <p style="margin: 4px 0; font-size: 14px;">RUC: ${causa.ruc}</p>
          ${causa.delito ? `<p style="margin: 4px 0; font-size: 14px; color: #3498db;">Delito: ${causa.delito.nombre}</p>` : ''}
          ${isCrimenOrg ? '<p style="margin: 4px 0; font-size: 14px; font-weight: 600; color: #e74c3c;">Crimen Organizado</p>' : ''}
          <p style="margin: 4px 0; font-size: 12px; color: #666;">
            ${coordenadas.lat.toFixed(6)}, ${coordenadas.lng.toFixed(6)}
          </p>
        </div>
      `);

      targetLayer.addLayer(marker);
    });

    // Agregar la capa al mapa
    targetLayer.addTo(mapInstanceRef.current);

    console.log(`✅ ${validMarkersCount} marcadores agregados de ${filteredCausas.length} causas`);
  }, [filteredCausas, mapReady, showCrimenOrganizado, clusterEnabled]);

  // Handler para exportar
  const handleExport = async () => {
    if (!mapContainerRef.current) return;

    try {
      const { default: html2canvas } = await import('html2canvas');
      
      const canvas = await html2canvas(mapContainerRef.current, {
        useCORS: true,
        allowTaint: true
      });

      const link = document.createElement('a');
      link.download = `mapa-causas-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error al exportar mapa:', error);
      alert('Error al exportar el mapa. Por favor, intente nuevamente.');
    }
  };

  // Handler para toggle de cluster
  const handleClusterToggle = () => {
    setClusterEnabled(!clusterEnabled);
    console.log(`🔄 Cluster ${!clusterEnabled ? 'activado' : 'desactivado'}`);
  };

  if (!isClient) {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Preparando mapa...</p>
        </div>
      </div>
    );
  }

  if (filteredCausas.length === 0) {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">No hay causas para mostrar</p>
          <p className="text-sm text-gray-600">Intente ajustar los filtros</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .leaflet-container {
          height: 100%;
          width: 100%;
        }

        /* Estilos personalizados para clusters */
        .marker-cluster-small {
          background-color: rgba(59, 130, 246, 0.6);
        }
        .marker-cluster-small div {
          background-color: rgba(59, 130, 246, 0.8);
        }

        .marker-cluster-medium {
          background-color: rgba(249, 115, 22, 0.6);
        }
        .marker-cluster-medium div {
          background-color: rgba(249, 115, 22, 0.8);
        }

        .marker-cluster-large {
          background-color: rgba(239, 68, 68, 0.6);
        }
        .marker-cluster-large div {
          background-color: rgba(239, 68, 68, 0.8);
        }

        .marker-cluster {
          cursor: pointer;
        }

        .marker-cluster div {
          width: 30px;
          height: 30px;
          margin-left: 5px;
          margin-top: 5px;
          text-align: center;
          border-radius: 15px;
          font-weight: bold;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        /* Switch personalizado */
        .cluster-switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
        }

        .cluster-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .cluster-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #cbd5e1;
          transition: 0.3s;
          border-radius: 24px;
        }

        .cluster-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        input:checked + .cluster-slider {
          background-color: #3b82f6;
        }

        input:checked + .cluster-slider:before {
          transform: translateX(24px);
        }
      `}</style>

      {/* Controles superiores */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        {/* Switch de Clustering */}
        <div className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-lg border border-gray-300 flex items-center gap-3">
          <span className="text-sm font-medium">Agrupar</span>
          <label className="cluster-switch">
            <input 
              type="checkbox" 
              checked={clusterEnabled}
              onChange={handleClusterToggle}
            />
            <span className="cluster-slider"></span>
          </label>
        </div>

        {/* Botón de exportar */}
        {mapReady && (
          <button
            onClick={handleExport}
            className="bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg shadow-lg border border-gray-300 flex items-center gap-2"
            title="Exportar mapa"
          >
            <span>📸</span>
            <span className="text-sm font-medium">Exportar</span>
          </button>
        )}
      </div>

      {/* Contenedor del mapa */}
      <div
        ref={mapContainerRef}
        className="h-full w-full rounded-lg shadow-lg"
        style={{ position: 'relative', zIndex: 0 }}
      />
      
      {/* Overlay de carga o error */}
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          {initError ? (
            <div className="text-center">
              <p className="text-red-600 font-semibold">Error al inicializar mapa</p>
              <p className="text-sm text-gray-600 mt-2">{initError}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Recargar página
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600">Inicializando mapa...</p>
              <p className="text-sm text-gray-500 mt-2">Por favor espere</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}