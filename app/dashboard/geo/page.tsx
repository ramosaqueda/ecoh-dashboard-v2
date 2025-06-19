'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dynamic from 'next/dynamic';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { StatsPanel } from '@/components/StatsPanel';
import { Input } from '@/components/ui/input';
import { Search, Maximize2 } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';

interface Causa {
  id: number;
  ruc: string;
  denominacionCausa?: string;
  fechaDelHecho: string;
  delitoId?: number;
  causaEcoh: boolean;  
  esCrimenOrganizado?: boolean | number;
  coordenadasSs?: string | null;
  delito?: {
    id: number;
    nombre: string;
  };
}

// ✅ AGREGADO: Interfaz para delitos
interface Delito {
  id: number;
  nombre: string;
}

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Mapa Delitos', link: '/dashboard/geo' }
];

// Carga dinámica del mapa para evitar problemas de SSR
const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => <p>Cargando mapa...</p>
});

export default function MapPage() {
  const [selectedDelito, setSelectedDelito] = useState<string>('todos');
  const [selectedYear, setSelectedYear] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showEcohOnly, setShowEcohOnly] = useState<boolean>(false);
  const [showCrimenOrganizadoOnly, setShowCrimenOrganizadoOnly] = useState<boolean>(false);

  // ✅ CORREGIDO: Fetch de causas con tipado correcto
  const { data: causas = [], isLoading: isLoadingCausas } = useQuery<Causa[]>({
    queryKey: ['causas'],
    queryFn: async (): Promise<Causa[]> => {
      const { data } = await axios.get<Causa[]>('/api/causas');
      return data;
    }
  });

  // ✅ CORREGIDO: Fetch de delitos con tipado correcto
  const { data: delitos = [], isLoading: isLoadingDelitos } = useQuery<Delito[]>({
    queryKey: ['delitos'],
    queryFn: async (): Promise<Delito[]> => {
      const { data } = await axios.get<Delito[]>('/api/delito');
      return data;
    }
  });

  // ✅ Obtener años únicos de las causas (ahora con tipos correctos)
  const yearsAvailable: number[] = Array.from(
    new Set(
      causas.map((causa: Causa) => { // ✅ Tipo explícito para mayor claridad
        const date = new Date(causa.fechaDelHecho);
        return date.getFullYear();
      })
    )
  ).sort((a, b) => b - a);

  // ✅ Filtrado de causas (ahora con tipos correctos)
  const causasFiltradas: Causa[] = causas
    .filter((causa: Causa) =>
      selectedDelito === 'todos'
        ? true
        : causa.delitoId?.toString() === selectedDelito
    )
    .filter((causa: Causa) => {
      if (selectedYear === 'todos') return true;
      const causaYear = new Date(causa.fechaDelHecho).getFullYear().toString();
      return causaYear === selectedYear;
    })
    .filter((causa: Causa) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        causa.ruc?.toLowerCase().includes(searchLower) ||
        causa.denominacionCausa?.toLowerCase().includes(searchLower)
      );
    })
    .filter((causa: Causa) => {
      if (!showEcohOnly) return true;
      return causa.causaEcoh === true;
    })
    .filter((causa: Causa) => {
      if (!showCrimenOrganizadoOnly) return true;
      
      // Manejar caso donde esCrimenOrganizado puede ser booleano o número
      if (typeof causa.esCrimenOrganizado === 'boolean') {
        return causa.esCrimenOrganizado === true;
      } else if (typeof causa.esCrimenOrganizado === 'number') {
        return causa.esCrimenOrganizado === 1;
      }
      
      return false;
    });

  // ✅ Transformar causas para que coincidan con lo que espera LeafletMap
  const causasParaMapa = causasFiltradas.map((causa: Causa) => ({
    id: causa.id,
    ruc: causa.ruc,
    denominacionCausa: causa.denominacionCausa || 'Sin denominación', // ✅ Proporcionar valor por defecto
    coordenadasSs: causa.coordenadasSs ?? null, // ✅ Convertir undefined a null
    delito: causa.delito
  }));

  // Para debugging
  useEffect(() => {
    if (showEcohOnly) {
      console.log('Causas ECOH encontradas:', causas.filter(c => c.causaEcoh).length);
    }
    if (showCrimenOrganizadoOnly) {
      const causasCrimen = causas.filter(c => {
        if (typeof c.esCrimenOrganizado === 'boolean') return c.esCrimenOrganizado === true;
        if (typeof c.esCrimenOrganizado === 'number') return c.esCrimenOrganizado === 1;
        return false;
      });
      console.log('Causas Crimen Organizado encontradas:', causasCrimen.length);
    }
  }, [showEcohOnly, showCrimenOrganizadoOnly, causas]);

  // ✅ Función mejorada para abrir el mapa en una nueva ventana
  const openMapInNewWindow = (): void => {
    try {
      // Usar las causas ya transformadas para mayor consistencia
      const filteredCausas = causasParaMapa.map((causa) => ({
        id: causa.id,
        ruc: causa.ruc,
        denominacionCausa: causa.denominacionCausa, // Ya está garantizado que no es undefined
        coordenadasSs: causa.coordenadasSs,
        esCrimenOrganizado: causasFiltradas.find(c => c.id === causa.id)?.esCrimenOrganizado,
        delito: causa.delito
      }));

      // Solo enviar los delitos que se están utilizando
      const filteredDelitos = delitos.filter((delito: Delito) => 
        selectedDelito === 'todos' || delito.id.toString() === selectedDelito
      );
      
      // Crear un objeto con los filtros actuales y los datos necesarios
      const mapData = {
        causas: filteredCausas,
        showCrimenOrganizado: showCrimenOrganizadoOnly,
        delitos: filteredDelitos,
        filters: {
          delito: selectedDelito,
          year: selectedYear,
          search: searchTerm,
          ecoh: showEcohOnly,
          crimenOrganizado: showCrimenOrganizadoOnly
        }
      };
      
      // Verificar tamaño antes de serializar
      console.log(`Enviando ${filteredCausas.length} causas al mapa`);
      
      // Advertencia si hay demasiadas causas
      if (filteredCausas.length > 1000) {
        if (!confirm(`Está intentando cargar ${filteredCausas.length} causas en el mapa. Esto puede hacer que el navegador funcione lento. ¿Desea continuar?`)) {
          return;
        }
      }
      
      // Serializar los datos y codificarlos para pasarlos como parámetro de URL
      const serializedData = encodeURIComponent(JSON.stringify(mapData));
      console.log(`Tamaño de datos para URL: ${serializedData.length} caracteres`);
      
      // Verificar si el tamaño es demasiado grande para un hash de URL
      if (serializedData.length > 1500000) {
        alert('Los datos son demasiado grandes para ser mostrados. Por favor, aplique más filtros para reducir la cantidad de causas.');
        return;
      }
      
      // Abrir una nueva ventana con parámetros de URL que contienen los datos
      const newWindow = window.open(`/geo#data=${serializedData}`, '_blank');
      
      // Asegurarnos de que se enfoque la nueva ventana
      if (newWindow) {
        newWindow.focus();
      } else {
        alert('El navegador ha bloqueado la apertura de una nueva ventana. Por favor, permita ventanas emergentes para este sitio.');
      }
    } catch (error) {
      console.error('Error al abrir el mapa en pantalla completa:', error);
      alert('Error al abrir el mapa en pantalla completa. Por favor, intente de nuevo con menos datos.');
    }
  };

  if (isLoadingCausas || isLoadingDelitos) {
    return (
      <PageContainer>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-lg">Cargando datos...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable={true}>
      <div className="flex h-full flex-col">
        <div className="border-b bg-background px-6 py-4">
          <Breadcrumbs items={breadcrumbItems} />
          <h1 className="mt-4 text-2xl font-bold">Mapa de Causas</h1>
        </div>

        <div className="flex-1 px-6 py-4">
          {/* Panel reducido de estadísticas */}
          <div className="mb-4">
            <StatsPanel
              causas={causasParaMapa}
              selectedDelito={selectedDelito}
            />
          </div>

          {/* Barra de filtros en línea */}
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3 shadow-sm">
            {/* Filtros en línea */}
            <div className="flex items-center gap-2">
              <Label htmlFor="ecoh-mode" className="whitespace-nowrap font-medium">
                Solo ECOH:
              </Label>
              <Switch
                id="ecoh-mode"
                checked={showEcohOnly}
                onCheckedChange={setShowEcohOnly}
              />
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <Label htmlFor="crimen-organizado-mode" className="whitespace-nowrap font-medium">
                Solo Crimen Organizado:
              </Label>
              <Switch
                id="crimen-organizado-mode"
                checked={showCrimenOrganizadoOnly}
                onCheckedChange={setShowCrimenOrganizadoOnly}
              />
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <Label className="whitespace-nowrap font-medium">Delito:</Label>
              <Select value={selectedDelito} onValueChange={setSelectedDelito}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por delito" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="todos">Todos los delitos</SelectItem>
                    {delitos.map((delito: Delito) => (
                      <SelectItem key={delito.id} value={delito.id.toString()}>
                        {delito.nombre}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <Label className="whitespace-nowrap font-medium">Año:</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filtrar por año" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="todos">Todos</SelectItem>
                    {yearsAvailable.map((year: number) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-1 items-center gap-2 ml-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por RUC o denominación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground ml-auto">
              {causasParaMapa.length} / {causas.length} causas
              {showEcohOnly && ' (ECOH)'}
              {showCrimenOrganizadoOnly && ' (Crimen Org.)'}
            </div>

            <div className="mb-2 flex justify-end">
              <Button 
                onClick={openMapInNewWindow}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Maximize2 className="h-4 w-4" />
                Abrir en pantalla completa
              </Button>
            </div>
          </div>

          {/* Mapa con mayor altura */}
          <div 
            key="leaflet-map-container" 
            className="h-[calc(100vh-300px)] min-h-[600px] w-full rounded-lg border"
          >
            <LeafletMap 
              causas={causasParaMapa} 
              showCrimenOrganizado={showCrimenOrganizadoOnly}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}