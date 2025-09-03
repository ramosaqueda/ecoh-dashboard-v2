import { UseFormReturn } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { CausaFormData } from '@/schemas/causaSchema';

/**
 * Hook personalizado para obtener valores seguros de selectores
 * Maneja correctamente null, undefined y conversiones de string
 */
export function useSafeSelectValue(
  form: UseFormReturn<CausaFormData>,
  fieldName: keyof CausaFormData
) {
  const value = form.watch(fieldName);
  const [isReady, setIsReady] = useState(false);
  
  // Dar tiempo para que los datos se carguen
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Función para convertir valor a string seguro para selectores
  const toSafeString = (val: any): string => {
    if (val === null || val === undefined) {
      return '';
    }
    return val.toString();
  };
  
  // Función para convertir string de selector a valor numérico
  const fromSafeString = (strVal: string): number | undefined => {
    if (!strVal || strVal === '') {
      return undefined;
    }
    const parsed = parseInt(strVal, 10);
    return isNaN(parsed) ? undefined : parsed;
  };
  
  const safeValue = toSafeString(value);
  
  // Debug log cuando el valor cambie
  useEffect(() => {
    if (isReady) {
      console.log(`🔍 DEBUG useSafeSelectValue(${fieldName}):`, {
        rawValue: value,
        safeValue,
        isReady
      });
    }
  }, [value, safeValue, isReady, fieldName]);
  
  return {
    value: safeValue,
    isReady,
    setValue: (newValue: string) => {
      console.log(`🔍 DEBUG useSafeSelectValue(${fieldName}) - setValue:`, newValue);
      const numericValue = fromSafeString(newValue);
      form.setValue(fieldName, numericValue as any, {
        shouldValidate: true,
        shouldDirty: true
      });
    }
  };
}

/**
 * Hook para manejo específico de origenCausaId
 */
export function useOrigenCausaValue(form: UseFormReturn<CausaFormData>) {
  return useSafeSelectValue(form, 'origenCausaId');
}

/**
 * Hook para manejo específico de estadoCausaId
 */
export function useEstadoCausaValue(form: UseFormReturn<CausaFormData>) {
  return useSafeSelectValue(form, 'estadoCausaId');
}

/**
 * Utilidad para debug de valores de formulario
 */
export function debugFormValue(form: UseFormReturn<CausaFormData>, fieldName: keyof CausaFormData) {
  const value = form.watch(fieldName);
  console.log(`🔍 DEBUG ${fieldName}:`, {
    raw: value,
    type: typeof value,
    string: value ? value.toString() : '',
    isNull: value === null,
    isUndefined: value === undefined,
    isEmpty: value === ''
  });
}
