import React, { useState, useEffect } from 'react';
import MultipleSelector, { Option } from '@/components/ui/multiple-selector';
import CrimenOrgGauge from '@/components/CrimenorgGauge';

// Interfaces para tipificar los datos
interface ParametroCrimenOrg {
  id: number;
  label: string;
  value: string;
  description?: string;
}

interface CausaParametro {
  parametroId: number;
  causaId: number;
  parametro?: ParametroCrimenOrg;
}

// ✅ FIX: Interface actualizada para recibir props directamente
interface CrimenOrganizadoParamsProps {
  causaId?: string | number;
  value?: number[];              // ✅ Valor del formulario
  onChange?: (value: number[]) => void;  // ✅ Callback para cambios
  onBlur?: () => void;          // ✅ Para react-hook-form
  name?: string;                // ✅ Para react-hook-form
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
        console.log('🔍 DEBUG CrimenOrg - Parámetros recibidos:', data);
        
        // Convertir a formato Option
        const options = Array.isArray(data) ? data.map((param: ParametroCrimenOrg) => ({
          value: param.id.toString(),
          label: param.label
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

  // ✅ FIX: Cargar parámetros seleccionados si es una edición (solo una vez)
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
          
          // ✅ Llamar onChange para actualizar el formulario
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

  // ✅ FIX: Sincronizar selectedParams cuando cambie el valor del formulario
  useEffect(() => {
    if (params.length > 0 && Array.isArray(value)) {
      console.log('🔍 DEBUG CrimenOrg - Sincronizando con valor del formulario:', value);
      
      // Convertir IDs del formulario a Options
      const newSelectedParams = value
        .map(id => {
          const param = params.find(p => p.value === id.toString());
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

  // ✅ FIX: Manejar cambios del MultipleSelector
  const handleParamsChange = (newParams: Option[]) => {
    console.log('🔍 DEBUG CrimenOrg - Parámetros seleccionados cambiados:', newParams);
    
    // Actualizar estado local
    setSelectedParams(newParams);
    
    // Extraer solo los IDs como números
    const paramIds = newParams.map(param => parseInt(param.value));
    console.log('🔍 DEBUG CrimenOrg - Nuevos IDs para formulario:', paramIds);
    
    // ✅ Llamar onChange si está disponible
    if (onChange) {
      onChange(paramIds);
    }
  };

  // ✅ Manejar onBlur para react-hook-form
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
      
      {/* Depuración - mostrar valores actuales */}
      {process.env.NODE_ENV === 'development' && (
        <div className="col-span-3 mt-2 text-xs text-gray-500">
          <details>
            <summary>🔍 Debug Info CrimenOrg</summary>
            <div className="mt-2 space-y-1">
              <div><strong>Params disponibles:</strong> {params.length}</div>
              <div><strong>Selected Params:</strong> {selectedParams.length}</div>
              <div><strong>Form Value (props):</strong> {JSON.stringify(value)}</div>
              <div><strong>CausaId:</strong> {causaId || 'No causaId'}</div>
              <div><strong>Is Loading:</strong> {isLoading ? 'Sí' : 'No'}</div>
              <div><strong>Has Loaded Initial:</strong> {hasLoadedInitialData ? 'Sí' : 'No'}</div>
              <div><strong>OnChange disponible:</strong> {onChange ? 'Sí' : 'No'}</div>
            </div>
            <details className="mt-2">
              <summary>Ver JSON completo</summary>
              <pre className="text-[10px]">
Selected Params: {JSON.stringify(selectedParams, null, 2)}
Form Value: {JSON.stringify(value, null, 2)}
Available Params: {JSON.stringify(params.slice(0, 3), null, 2)}...
              </pre>
            </details>
          </details>
        </div>
      )}
    </div>
  );
};

export default CrimenOrgParamsSelect;