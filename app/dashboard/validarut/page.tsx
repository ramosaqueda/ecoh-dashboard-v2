'use client';
import React, { useState } from 'react';
import { Calculator, CheckCircle, AlertCircle, Copy } from 'lucide-react';

const RunValidator = () => {
  const [mantisa, setMantisa] = useState('');
  const [digitoVerificador, setDigitoVerificador] = useState('');
  const [runCompleto, setRunCompleto] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Algoritmo módulo 11 correcto para RUT chileno
  const calcularDigitoVerificador = (mantisa: string): string => {
    // Limpiar la mantisa de puntos y espacios
    const mantisaLimpia = mantisa.replace(/\./g, '').replace(/\s/g, '');
    
    // Validar que solo contenga números
    if (!/^\d+$/.test(mantisaLimpia)) {
      throw new Error('La mantisa debe contener solo números');
    }

    // Validar longitud (entre 7 y 8 dígitos)
    if (mantisaLimpia.length < 7 || mantisaLimpia.length > 8) {
      throw new Error('La mantisa debe tener entre 7 y 8 dígitos');
    }

    // 1. Reordenar los números de derecha a izquierda
    const digitos = mantisaLimpia.split('').map(Number).reverse();
    
    // 2. Multiplicar cada número por la serie 2, 3, 4, 5, 6, 7 repetidamente
    const multiplicadores = [2, 3, 4, 5, 6, 7];
    let suma = 0;
    
    for (let i = 0; i < digitos.length; i++) {
      suma += digitos[i] * multiplicadores[i % 6];
    }
    
    // 3. Dividir el resultado por 11 y obtener el resto
    const resto = suma % 11;
    
    // 4. Restar el resto de 11
    const digitoVerificador = 11 - resto;
    
    // 5. Casos especiales:
    // Si el resultado es 11, el dígito verificador será 0
    // Si es 10, el dígito será la letra K
    if (digitoVerificador === 11) {
      return '0';
    } else if (digitoVerificador === 10) {
      return 'K';
    } else {
      return digitoVerificador.toString();
    }
  };

  const formatearRun = (mantisa: string, dv: string): string => {
    // Formatear mantisa con puntos
    const mantisaLimpia = mantisa.replace(/\./g, '').replace(/\s/g, '');
    const mantisaFormateada = mantisaLimpia.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${mantisaFormateada}-${dv}`;
  };

  const handleCalcular = () => {
    setError('');
    setDigitoVerificador('');
    setRunCompleto('');
    setCopied(false);

    if (!mantisa.trim()) {
      setError('Por favor ingrese una mantisa');
      return;
    }

    try {
      const dv = calcularDigitoVerificador(mantisa);
      const runFormateado = formatearRun(mantisa, dv);
      
      setDigitoVerificador(dv);
      setRunCompleto(runFormateado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al calcular el dígito verificador');
    }
  };

  const handleCopiar = async () => {
    if (runCompleto) {
      try {
        await navigator.clipboard.writeText(runCompleto);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Error al copiar:', err);
      }
    }
  };

  const handleLimpiar = () => {
    setMantisa('');
    setDigitoVerificador('');
    setRunCompleto('');
    setError('');
    setCopied(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permitir solo números y puntos
    if (/^[\d.]*$/.test(value)) {
      setMantisa(value);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="text-center mb-6">
        <Calculator className="mx-auto h-12 w-12 text-blue-600 mb-3" />
        <h2 className="text-2xl font-bold text-gray-900">Calculadora RUN</h2>
        <p className="text-sm text-gray-600 mt-1">
          Algoritmo Módulo 11 - Dígito Verificador
        </p>
      </div>

      <div className="space-y-4">
        {/* Input para mantisa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mantisa del RUN
          </label>
          <input
            type="text"
            value={mantisa}
            onChange={handleInputChange}
            placeholder="Ej: 12345678"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
            maxLength={10}
          />
          <p className="text-xs text-gray-500 mt-1">
            Ingrese entre 7 y 8 dígitos (sin puntos ni guión)
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-2">
          <button
            onClick={handleCalcular}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            Calcular
          </button>
          <button
            onClick={handleLimpiar}
            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Limpiar
          </button>
        </div>

        {/* Resultado */}
        {digitoVerificador && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">
                Dígito Verificador Calculado
              </span>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700 mb-1">
                {digitoVerificador}
              </div>
              <div className="text-lg text-gray-700 mb-3">
                RUN Completo: <span className="font-mono font-bold">{runCompleto}</span>
              </div>
              <button
                onClick={handleCopiar}
                className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                <Copy className="h-4 w-4 mr-1" />
                {copied ? 'Copiado!' : 'Copiar RUN'}
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-sm font-medium text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Información adicional */}
      
      </div>
    </div>
  );
};

export default RunValidator;