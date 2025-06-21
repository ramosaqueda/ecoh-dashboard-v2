import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
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

interface CrimenOrganizadoParamsProps {
  causaId?: string;
}

const CrimenOrgParamsSelect: React.FC<CrimenOrganizadoParamsProps> = ({ causaId }) => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const [params, setParams] = useState<Option[]>([]);
  const [selectedParams, setSelectedParams] = useState<Option[]>([]);
  
  // Obtener el contexto del formulario - usar destructuring para estar seguros
  const { setValue, getValues, formState } = useFormContext();

  // Función para cargar los parámetros disponibles
  useEffect(() => {
    const fetchParams = async () => {
      try {
        console.log('Fetching crimen organizado params...');
        const response = await fetch(`${API_BASE_URL}/api/crimenorganizadoparams/`);
        if (!response.ok) {
          throw new Error('Error al cargar los parámetros');
        }
        const data: ParametroCrimenOrg[] = await response.json();
        console.log('Parámetros recibidos:', data);
        
        // Convertir a formato Option
        const options = Array.isArray(data) ? data.map((param: ParametroCrimenOrg) => ({
          value: param.id.toString(),
          label: param.label
        })) : [];
        
        setParams(options);
      } catch (error) {
        console.error('Error fetching Parámetros de Crimen Organizado:', error);
      }
    };
    fetchParams();
  }, [API_BASE_URL]);

  // Cargar parámetros seleccionados si es una edición
  useEffect(() => {
    if (causaId) {
      const fetchSelectedParams = async () => {
        try {
          console.log('Fetching selected params for causa:', causaId);
          const response = await fetch(`${API_BASE_URL}/api/causas-parametros?causaId=${causaId}`);
          if (!response.ok) {
            throw new Error('Error al cargar parámetros seleccionados');
          }
          const data: CausaParametro[] = await response.json();
          console.log('Parámetros seleccionados recibidos:', data);
          
          // Mapear los parámetros a formato Option
          const selectedOptions = data.map((item: CausaParametro) => ({
            value: item.parametroId.toString(),
            label: item.parametro?.label || `Parámetro ${item.parametroId}`
          }));
          
          setSelectedParams(selectedOptions);
          
          // Extraer solo los IDs como números
          const paramIds = selectedOptions.map(option => parseInt(option.value));
          console.log('Actualizando formulario con parámetros existentes:', paramIds);
          
          // Asegurarnos de que causasCrimenOrg sea array y contenga los IDs
          setValue('causasCrimenOrg', paramIds, {
            shouldValidate: true,
            shouldDirty: true
          });
        } catch (error) {
          console.error('Error fetching selected params:', error);
        }
      };
      
      fetchSelectedParams();
    }
  }, [causaId, API_BASE_URL, setValue]);

  // Cuando cambian las selecciones en MultipleSelector
  const handleParamsChange = (newParams: Option[]) => {
    console.log('Parámetros seleccionados cambiados:', newParams);
    setSelectedParams(newParams);
    
    // Extraer solo los IDs como números
    const paramIds = newParams.map(param => parseInt(param.value));
    console.log('Actualizando formulario con nuevos parámetros:', paramIds);
    
    // Actualizar el campo causasCrimenOrg en el formulario
    setValue('causasCrimenOrg', paramIds, {
      shouldValidate: true,
      shouldDirty: true
    });
    
    // Verificar que el valor se haya actualizado
    setTimeout(() => {
      const formValue = getValues('causasCrimenOrg');
      console.log('Valor actual en el formulario (causasCrimenOrg):', formValue);
    }, 100);
  };

  // Logging para verificar inicialización del formulario
  useEffect(() => {
    // Verificar los valores iniciales en el formulario
    const initialFormValue = getValues('causasCrimenOrg');
    console.log('Valor inicial de causasCrimenOrg en el formulario:', initialFormValue);
    console.log('Estado del formulario:', formState);
    
    // Forzar inicialización si está vacío
    if (!initialFormValue || !Array.isArray(initialFormValue)) {
      console.log('Inicializando causasCrimenOrg como array vacío');
      setValue('causasCrimenOrg', []);
    }
  }, [getValues, setValue, formState]);

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <MultipleSelector
          value={selectedParams}
          onChange={handleParamsChange}
          options={params}
          placeholder="Seleccione un parámetro"
          emptyIndicator={
            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
              No se encontraron resultados.
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
            <summary>Debug Info</summary>
            <pre>
              Selected Params: {JSON.stringify(selectedParams, null, 2)}
              <br />
              Form Value: {JSON.stringify(getValues('causasCrimenOrg'), null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default CrimenOrgParamsSelect;