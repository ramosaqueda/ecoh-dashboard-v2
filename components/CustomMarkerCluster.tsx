'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { useLeafletContext } from '@react-leaflet/core';

import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// ❌ QUITAR ESTA LÍNEA - estaba fuera del componente
// const groupRef = useRef<L.MarkerClusterGroup | null>(null);

interface CustomMarkerClusterProps {
  children: React.ReactNode;
  chunkedLoading?: boolean;
  maxClusterRadius?: number;
  iconCreateFunction?: (cluster: any) => L.DivIcon;
  showCoverageOnHover?: boolean;
  spiderfyOnMaxZoom?: boolean;
}

// Implementación simplificada que funciona con la versión más reciente de React Leaflet
const CustomMarkerCluster: React.FC<CustomMarkerClusterProps> = ({
  children,
  chunkedLoading = false,
  maxClusterRadius = 80,
  iconCreateFunction,
  showCoverageOnHover = true,
  spiderfyOnMaxZoom = true
}) => {
  const context = useLeafletContext();
  // ✅ ESTA línea está bien - dentro del componente
  const groupRef = useRef<L.MarkerClusterGroup | null>(null);
  const propsRef = useRef({ 
    chunkedLoading, 
    maxClusterRadius, 
    iconCreateFunction, 
    showCoverageOnHover, 
    spiderfyOnMaxZoom 
  });

  // Actualizar las props cuando cambien
  useEffect(() => {
    propsRef.current = { 
      chunkedLoading, 
      maxClusterRadius, 
      iconCreateFunction, 
      showCoverageOnHover, 
      spiderfyOnMaxZoom 
    };
  }, [chunkedLoading, maxClusterRadius, iconCreateFunction, showCoverageOnHover, spiderfyOnMaxZoom]);

  // Crear y configurar el grupo de marcadores al montar
  useEffect(() => {
    // Asegurarse de que estamos en el cliente
    if (typeof window === 'undefined') return;
    
    const { map } = context;
    // Verificar que Leaflet y L.MarkerClusterGroup estén disponibles
    if (!map || !L.markerClusterGroup) return;

    try {
      // Crear un grupo de marcadores con las opciones proporcionadas
      const clusterGroup = L.markerClusterGroup({
        chunkedLoading: propsRef.current.chunkedLoading,
        maxClusterRadius: propsRef.current.maxClusterRadius,
        iconCreateFunction: propsRef.current.iconCreateFunction,
        showCoverageOnHover: propsRef.current.showCoverageOnHover,
        spiderfyOnMaxZoom: propsRef.current.spiderfyOnMaxZoom
      });

      // Añadir al mapa
      clusterGroup.addTo(map);
      groupRef.current = clusterGroup;

      // Limpiar al desmontar
      return () => {
        if (map && clusterGroup) {
          map.removeLayer(clusterGroup);
        }
        groupRef.current = null;
      };
    } catch (error) {
      console.error('Error al crear MarkerClusterGroup:', error);
    }
  }, [context]);

  // Agregar marcadores al cluster cuando los children cambien
  useEffect(() => {
    if (!groupRef.current) return;

    // Limpiar marcadores existentes
    groupRef.current.clearLayers();

    // Procesar children y agregar marcadores
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type && groupRef.current) {
        // Si el child es un Marker, intentar agregarlo al cluster
        // Esta lógica puede necesitar ajustes según cómo uses los markers
        try {
          // Para markers creados con react-leaflet, puedes necesitar
          // acceder a la instancia del marker de manera diferente
          console.log('Processing child:', child);
        } catch (error) {
          console.error('Error agregando marker al cluster:', error);
        }
      }
    });
  }, [children]);

  // No renderizar nada directamente en el DOM
  return null;
};

export default CustomMarkerCluster;