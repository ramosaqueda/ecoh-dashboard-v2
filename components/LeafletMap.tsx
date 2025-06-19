'use client';

import { useRef, useEffect, useState } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMap, 
  LayersControl 
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Función para inicializar los iconos de Leaflet
const initializeLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png'
  });
};

// Componente para exportar el mapa
function ExportButton() {
  const map = useMap();

  const handleExport = async () => {
    try {
      // Importación dinámica de html2canvas
      const { default: html2canvas } = await import('html2canvas');
      const mapContainer = map.getContainer();

      const canvas = await html2canvas(mapContainer, {
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

  return (
    <div className="leaflet-top leaflet-left" style={{ marginTop: '80px' }}>
      <div className="leaflet-control leaflet-bar">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleExport();
          }}
          title="Exportar mapa"
          className="export-button flex items-center justify-center"
          style={{ width: '34px', height: '34px' }}
        >
          📸
        </a>
      </div>
    </div>
  );
}

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
  const mapRef = useRef<L.Map | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Inicializar Leaflet solo en el cliente
  useEffect(() => {
    setIsClient(true);
    initializeLeafletIcons();
  }, []);

  // Filtrar causas según el modo de crimen organizado
  const filteredCausas = showCrimenOrganizado 
    ? causas.filter(causa => {
        if (typeof causa.esCrimenOrganizado === 'boolean') {
          return causa.esCrimenOrganizado === true;
        } else if (typeof causa.esCrimenOrganizado === 'number') {
          return causa.esCrimenOrganizado === 1;
        }
        return false;
      })
    : causas;

  if (!isClient || filteredCausas.length === 0) {
    // No renderizar nada hasta que estemos en el cliente y haya causas
    return <div className="h-full w-full bg-gray-100 flex items-center justify-center">Cargando mapa...</div>;
  }

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
        console.warn('Coordenadas inválidas o fuera de rango:', coordStr);
        return defaultCoords;
      }

      return { lat, lng, isValid: true };
    } catch (error) {
      console.warn('Error al procesar coordenadas:', coordStr, error);
      return defaultCoords;
    }
  };

  // Encontrar un punto válido para centrar el mapa
  const primerPuntoValido = filteredCausas.find(causa => {
    const coords = getPosicion(causa.coordenadasSs);
    return coords.isValid;
  });

  const centroInicial = primerPuntoValido
    ? getPosicion(primerPuntoValido.coordenadasSs)
    : getPosicion(null);

  // Función para obtener el color del marcador
  const getMarkerColor = (causa: any) => {
    if (showCrimenOrganizado) {
      return '#e74c3c'; // Rojo para crimen organizado
    }

    // Color por tipo de delito
    const colorMap: { [key: number]: string } = {
      1: '#e74c3c', // Rojo
      2: '#3498db', // Azul
      3: '#2ecc71', // Verde
      4: '#f1c40f' // Amarillo
    };

    return causa.delito?.id ? colorMap[causa.delito.id] || '#95a5a6' : '#95a5a6';
  };

  // Crear un icono personalizado para un marcador
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

        .export-button {
          background: white !important;
          cursor: pointer;
          font-size: 1.2rem;
        }
        
        .export-button:hover {
          background: #f4f4f4 !important;
        }
      `}</style>

      <MapContainer
        ref={(map) => {
          mapRef.current = map;
        }}
        key={`map-container-${showCrimenOrganizado ? 'crimen-org' : 'normal'}`}
        center={[centroInicial.lat, centroInicial.lng]}
        zoom={12}
        className="h-full w-full rounded-lg shadow-lg"
      >
        {/* Control de capas */}
        <LayersControl position="topright">
          {/* Capa base: OpenStreetMap */}
          <LayersControl.BaseLayer checked name="Mapa Estándar">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          
          {/* Capa satelital de ESRI */}
          <LayersControl.BaseLayer name="Satelital">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
          
          {/* Capa híbrida: Satelital con etiquetas */}
          <LayersControl.BaseLayer name="Híbrido">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Botón de exportar */}
        <ExportButton />

        {/* Marcadores simples en lugar de agrupados */}
        {filteredCausas.map((causa) => {
          const coordenadas = getPosicion(causa.coordenadasSs);
          if (!coordenadas.isValid) return null;

          const isCrimenOrg = typeof causa.esCrimenOrganizado === 'boolean' 
            ? causa.esCrimenOrganizado 
            : causa.esCrimenOrganizado === 1;

          return (
            <Marker
              key={causa.id}
              position={[coordenadas.lat, coordenadas.lng]}
              icon={createCustomMarker(causa)}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">{causa.denominacionCausa || 'Sin denominación'}</h3>
                  <p className="text-sm">RUC: {causa.ruc}</p>
                  {causa.delito && (
                    <p className="text-sm text-blue-600">
                      Delito: {causa.delito.nombre}
                    </p>
                  )}
                  {isCrimenOrg && (
                    <p className="text-sm font-semibold text-red-600">
                      Crimen Organizado
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-600">
                    {coordenadas.lat.toFixed(6)}, {coordenadas.lng.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}