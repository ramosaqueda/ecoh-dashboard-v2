'use client';

import { useState } from 'react';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Download,
  Calendar,
  Filter
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from 'sonner';

interface ConfiguracionVista {
  mostrarMetricas: boolean;
  mostrarResumenEjecutivo: boolean;
  mostrarTodoList: boolean;
  mostrarAsignadas: boolean;
  mostrarNotificaciones: boolean;
  mostrarGraficos: boolean;
  mostrarAccionesRapidas: boolean;
  periodoFiltro: 'semana' | 'mes' | 'trimestre' | 'año';
  autoRefresh: boolean;
}

interface ConfiguracionAnaliticaProps {
  onConfigChange?: (config: ConfiguracionVista) => void;
  onRefresh?: () => void;
}

export default function ConfiguracionAnalitica({ onConfigChange, onRefresh }: ConfiguracionAnaliticaProps) {
  const [config, setConfig] = useState<ConfiguracionVista>({
    mostrarMetricas: true,
    mostrarResumenEjecutivo: true,
    mostrarTodoList: true,
    mostrarAsignadas: true,
    mostrarNotificaciones: true,
    mostrarGraficos: true,
    mostrarAccionesRapidas: true,
    periodoFiltro: 'mes',
    autoRefresh: false
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleConfigChange = (key: keyof ConfiguracionVista, value: boolean | string) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
    toast.success('Configuración actualizada');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular refresh
      onRefresh?.();
      toast.success('Datos actualizados');
    } catch (error) {
      toast.error('Error al actualizar datos');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportData = () => {
    // Simular exportación de datos
    toast.success('Exportando datos...', {
      description: 'Se iniciará la descarga en breve'
    });
  };

  const resetToDefault = () => {
    const defaultConfig: ConfiguracionVista = {
      mostrarMetricas: true,
      mostrarResumenEjecutivo: true,
      mostrarTodoList: true,
      mostrarAsignadas: true,
      mostrarNotificaciones: true,
      mostrarGraficos: true,
      mostrarAccionesRapidas: true,
      periodoFiltro: 'mes',
      autoRefresh: false
    };
    setConfig(defaultConfig);
    onConfigChange?.(defaultConfig);
    toast.success('Configuración restaurada a valores por defecto');
  };

  return (
    <div className="flex items-center gap-2">
      {/* Botón de refresh rápido */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="h-8"
      >
        <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Actualizando...' : 'Actualizar'}
      </Button>

      {/* Selector de período */}
      <Select 
        value={config.periodoFiltro} 
        onValueChange={(value) => handleConfigChange('periodoFiltro', value)}
      >
        <SelectTrigger className="w-32 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="semana">Esta semana</SelectItem>
          <SelectItem value="mes">Este mes</SelectItem>
          <SelectItem value="trimestre">Trimestre</SelectItem>
          <SelectItem value="año">Este año</SelectItem>
        </SelectContent>
      </Select>

      {/* Botón de exportar */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportData}
        className="h-8"
      >
        <Download className="h-4 w-4 mr-1" />
        Exportar
      </Button>

      {/* Panel de configuración */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Settings className="h-4 w-4 mr-1" />
            Configurar Vista
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-3">Personalizar Vista</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="metricas" className="text-sm">Métricas Principales</Label>
                  <Switch
                    id="metricas"
                    checked={config.mostrarMetricas}
                    onCheckedChange={(checked) => handleConfigChange('mostrarMetricas', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="resumen" className="text-sm">Resumen Ejecutivo</Label>
                  <Switch
                    id="resumen"
                    checked={config.mostrarResumenEjecutivo}
                    onCheckedChange={(checked) => handleConfigChange('mostrarResumenEjecutivo', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="todo" className="text-sm">Lista TODO</Label>
                  <Switch
                    id="todo"
                    checked={config.mostrarTodoList}
                    onCheckedChange={(checked) => handleConfigChange('mostrarTodoList', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="asignadas" className="text-sm">Actividades Asignadas</Label>
                  <Switch
                    id="asignadas"
                    checked={config.mostrarAsignadas}
                    onCheckedChange={(checked) => handleConfigChange('mostrarAsignadas', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="notificaciones" className="text-sm">Notificaciones</Label>
                  <Switch
                    id="notificaciones"
                    checked={config.mostrarNotificaciones}
                    onCheckedChange={(checked) => handleConfigChange('mostrarNotificaciones', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="graficos" className="text-sm">Gráficos</Label>
                  <Switch
                    id="graficos"
                    checked={config.mostrarGraficos}
                    onCheckedChange={(checked) => handleConfigChange('mostrarGraficos', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="acciones" className="text-sm">Acciones Rápidas</Label>
                  <Switch
                    id="acciones"
                    checked={config.mostrarAccionesRapidas}
                    onCheckedChange={(checked) => handleConfigChange('mostrarAccionesRapidas', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="autorefresh" className="text-sm">Auto-actualizar</Label>
                  <Switch
                    id="autorefresh"
                    checked={config.autoRefresh}
                    onCheckedChange={(checked) => handleConfigChange('autoRefresh', checked)}
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefault}
                className="w-full"
              >
                Restaurar por defecto
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}