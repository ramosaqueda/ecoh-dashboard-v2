import React, { useEffect, useState } from 'react';
import OrigenCausaSelector from '@/components/select/OrigenCausaSelector';
import EstadoCausaSelector from '@/components/select/EstadoCausaSelector';

interface ControlledSelectProps {
  type: 'origen' | 'estado';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  includeEmpty?: boolean;
  emptyLabel?: string;
}

/**
 * Wrapper para los selectores que maneja mejor el timing y el estado
 */
export const ControlledSelect: React.FC<ControlledSelectProps> = ({
  type,
  value,
  onChange,
  error,
  includeEmpty = true,
  emptyLabel
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isReady, setIsReady] = useState(false);
  
  // Sincronizar valor interno con valor externo
  useEffect(() => {
    if (value !== internalValue) {
      console.log(`🔍 DEBUG ControlledSelect(${type}) - Sincronizando valor:`, { external: value, internal: internalValue });
      setInternalValue(value);
    }
  }, [value, internalValue, type]);
  
  // Dar tiempo para que los componentes se carguen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
      console.log(`🔍 DEBUG ControlledSelect(${type}) - Ready con valor:`, value);
    }, 200);
    return () => clearTimeout(timer);
  }, [type, value]);
  
  const handleChange = (newValue: string) => {
    console.log(`🔍 DEBUG ControlledSelect(${type}) - Cambio detectado:`, newValue);
    setInternalValue(newValue);
    onChange(newValue);
  };
  
  if (!isReady) {
    return (
      <div className="h-10 bg-gray-100 animate-pulse rounded-md flex items-center px-3">
        <span className="text-sm text-gray-500">Cargando...</span>
      </div>
    );
  }
  
  const props = {
    value: internalValue,
    onChange: handleChange,
    error,
    includeEmpty,
    emptyLabel: emptyLabel || `Sin ${type} específico`
  };
  
  if (type === 'origen') {
    return <OrigenCausaSelector {...props} />;
  } else {
    return <EstadoCausaSelector {...props} />;
  }
};

export default ControlledSelect;
