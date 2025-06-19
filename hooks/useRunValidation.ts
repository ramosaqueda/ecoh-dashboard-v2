import { useState, useEffect } from 'react';

interface UseRunValidationReturn {
  isValid: boolean;
  error: string | null;
  formatRun: (run: string) => string;
  validateRun: (run: string) => boolean;
}

export function useRunValidation(
  initialValue?: string
): UseRunValidationReturn {
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function calcularDv(run: string): string {
    const runRevertido = run.split('').reverse();
    let suma = 0;
    let multiplicador = 2;

    for (const digito of runRevertido) {
      suma += parseInt(digito) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resto = suma % 11;
    const dv = 11 - resto;

    return dv === 11 ? '0' : dv === 10 ? 'K' : dv.toString();
  }

  function formatRun(run: string): string {
    const cleaned = run.replace(/[^\dkK]/g, '');
    if (cleaned.length <= 1) return cleaned;

    const dv = cleaned.slice(-1);
    const nums = cleaned.slice(0, -1);
    return `${nums}-${dv.toUpperCase()}`;
  }

  function validateRun(run: string): boolean {
    const cleaned = run.replace(/[^\dkK]/g, '');

    if (cleaned.length < 2) {
      setError('RUN demasiado corto');
      return false;
    }

    const dv = cleaned.slice(-1).toUpperCase();
    const nums = cleaned.slice(0, -1);

    if (!/^\d+$/.test(nums)) {
      setError('RUN debe contener solo números');
      return false;
    }

    const dvCalculado = calcularDv(nums);
    const esValido = dvCalculado === dv;

    setError(esValido ? null : 'Dígito verificador inválido');
    return esValido;
  }

  useEffect(() => {
    if (initialValue) {
      setIsValid(validateRun(initialValue));
    }
  }, [initialValue]);

  return {
    isValid,
    error,
    formatRun,
    validateRun
  };
}
