"use client";

import React from 'react';
import { DiligenciaMatrix } from './components/DiligenciaMatrix';

export default function DiligenciasPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[95%] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Matriz de Diligencias</h1>
          <p className="mt-2 text-gray-600">Gestión centralizada de diligencias mínimas en causa.</p>
        </div>
        
        <DiligenciaMatrix />
      </div>
    </div>
  );
}
