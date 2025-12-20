"use client";

import React from 'react';
import BasicPrimitivesDiagram from '@/components/Genograma/BasicPrimitivesDiagram';
import { Persona, Relacion } from '@/components/Genograma/types';

// Mock Data
const MOCK_PERSONAS: Persona[] = [
  { id: '1', nombre: 'Juan', apellido: 'Perez', genero: 'masculino', nombreCompleto: 'Juan Perez' },
  { id: '2', nombre: 'Maria', apellido: 'Gomez', genero: 'femenino', nombreCompleto: 'Maria Gomez' },
  { id: '3', nombre: 'Pedro', apellido: 'Perez', genero: 'masculino', nombreCompleto: 'Pedro Perez Gomez', fechaNacimiento: '2000-01-01' },
  { id: '4', nombre: 'Ana', apellido: 'Perez', genero: 'femenino', nombreCompleto: 'Ana Perez Gomez', fechaNacimiento: '2002-05-05' },
];

const MOCK_RELACIONES: Relacion[] = [
  // Juan and Maria are parents of Pedro and Ana
  { idOrigen: '1', idDestino: '3', tipo: 'padres' },
  { idOrigen: '2', idDestino: '3', tipo: 'padres' },
  { idOrigen: '1', idDestino: '4', tipo: 'padres' },
  { idOrigen: '2', idDestino: '4', tipo: 'padres' },
];

export default function GenogramaPoCPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Prueba de Concepto - Genograma BasicPrimitives</h1>
      <p className="mb-4 text-gray-600">
        Esta página demuestra la visualización de un árbol familiar utilizando la librería BasicPrimitives.
      </p>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <BasicPrimitivesDiagram 
          personas={MOCK_PERSONAS} 
          relaciones={MOCK_RELACIONES} 
        />
      </div>
    </div>
  );
}
