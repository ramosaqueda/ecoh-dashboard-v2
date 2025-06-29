import React, { useState, useEffect } from 'react';
import MultipleSelector, { Option } from '@/components/ui/multiple-selector';
import CrimenOrgGauge from '@/components/CrimenorgGauge';

// ✅ FIX: Interface corregida para coincidir con el endpoint
interface ParametroCrimenOrg {
  value: number;      // ✅ El endpoint devuelve "value" como number
  label: string;
  description?: string;
}

interface CausaParametro {
  parametroId: number;
  causaId: number;
  parametro?: ParametroCrimenOrg;
}

interface CrimenOrganizadoParamsProps {
  causaId?: string | number;
  value?: number[];
  onChange?: (value: number[]) => void;
  onBlur?: () => void;
  name?: string;
}

const CrimenOrgParamsSelect: React.FC<CrimenOrganizadoParamsProps> = ({ 
  causaId, 
  value = [], 
  onChange,
  onBlur,
  name 
}) => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const [params, setParams] = useState<Option[]>([]);
  const [selectedParams, setSelectedParams] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

  // ✅ FIX: Función para limpiar labels
  const cleanLabel = (label: string): string => {
    return label.replace(/\n/g, '').trim();
  };

  // Función para cargar los parámetros disponibles
  useEffect(() => {
    const fetchParams = async () => {
      try {
        console.log('🔍 DEBUG CrimenOrg - Fetching params...');
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/crimenorganizadoparams/`);
        if (!response.ok) {
          throw new Error('Error al cargar los parámetros');
        }
        const data: ParametroCrimenOrg[] = await response.json();
        console.log('🔍 DEBUG CrimenOrg - Parámetros recibidos del endpoint:', data);
        
        // ✅ FIX: Mapear correctamente usando "value" en lugar de "id"
        const options = Array.isArray(data) ? data.map((param: ParametroCrimenOrg) => ({
          value: param.value.toString(), // ✅ Usar param.value que sí existe
          label: cleanLabel(param.label)  // ✅ Limpiar caracteres de nueva línea
        })) : [];
        
        setParams(options);
        console.log('🔍 DEBUG CrimenOrg - Options formateadas:', options);
      } catch (error) {
        console.error('Error fetching Parámetros de Crimen Organizado:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchParams();
  }, [API_BASE_URL]);

  // Cargar parámetros seleccionados si es una edición (solo una vez)
  useEffect(() => {
    if (causaId && params.length > 0 && !hasLoadedInitialData) {
      const fetchSelectedParams = async () => {
        try {
          console.log('🔍 DEBUG CrimenOrg - Fetching selected params for causa:', causaId);
          const response = await fetch(`${API_BASE_URL}/api/causas-parametros?causaId=${causaId}`);
          if (!response.ok) {
            throw new Error('Error al cargar parámetros seleccionados');
          }
          const data: CausaParametro[] = await response.json();
          console.log('🔍 DEBUG CrimenOrg - Parámetros seleccionados recibidos:', data);
          
          // Extraer solo los IDs como números
          const paramIds = data.map((item: CausaParametro) => item.parametroId);
          console.log('🔍 DEBUG CrimenOrg - IDs extraídos:', paramIds);
          
          // Llamar onChange para actualizar el formulario
          if (onChange && paramIds.length > 0) {
            onChange(paramIds);
          }
          
          setHasLoadedInitialData(true);
        } catch (error) {
          console.error('Error fetching selected params:', error);
          setHasLoadedInitialData(true);
        }
      };
      
      fetchSelectedParams();
    }
  }, [causaId, API_BASE_URL, params.length, hasLoadedInitialData, onChange]);

  // Sincronizar selectedParams cuando cambie el valor del formulario
  useEffect(() => {
    if (params.length > 0 && Array.isArray(value)) {
      console.log('🔍 DEBUG CrimenOrg - Sincronizando con valor del formulario:', value);
      console.log('🔍 DEBUG CrimenOrg - Params disponibles:', params);
      
      // Convertir IDs del formulario a Options
      const newSelectedParams = value
        .map(id => {
          const param = params.find(p => p.value === id.toString());
          console.log(`🔍 DEBUG CrimenOrg - Buscando param con value=${id}, encontrado:`, param);
          return param;
        })
        .filter(Boolean) as Option[];
      
      console.log('🔍 DEBUG CrimenOrg - Nuevos selectedParams:', newSelectedParams);
      setSelectedParams(newSelectedParams);
    } else if (!value || value.length === 0) {
      // Si el valor está vacío, limpiar selectedParams
      setSelectedParams([]);
    }
  }, [value, params]);

  // Manejar cambios del MultipleSelector
  const handleParamsChange = (newParams: Option[]) => {
    console.log('🔍 DEBUG CrimenOrg - Parámetros seleccionados cambiados:', newParams);
    
    // Actualizar estado local
    setSelectedParams(newParams);
    
    // Extraer solo los IDs como números
    const paramIds = newParams.map(param => parseInt(param.value));
    console.log('🔍 DEBUG CrimenOrg - Nuevos IDs para formulario:', paramIds);
    
    // Llamar onChange si está disponible
    if (onChange) {
      onChange(paramIds);
    }
  };

  // Manejar onBlur para react-hook-form
  const handleBlur = () => {
    if (onBlur) {
      onBlur();
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <MultipleSelector
          value={selectedParams}
          onChange={handleParamsChange}
          onBlur={handleBlur}
          options={params}
          placeholder={isLoading ? "Cargando parámetros..." : "Seleccione un parámetro"}
          disabled={isLoading}
          emptyIndicator={
            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
              {isLoading ? "Cargando..." : "No se encontraron resultados."}
            </p>
          }
        />
      </div>
      
      <div>
        <CrimenOrgGauge
          selectedParams={selectedParams}
          totalParams={params}
        />
      </div>
      

    </div>
  );
};

export default CrimenOrgParamsSelect;