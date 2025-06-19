// lib/api-utils.ts

import { NextResponse } from 'next/server';

/**
 * Helper para extraer mensajes de error de forma segura en TypeScript
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

/**
 * Helper para crear respuestas de error estandarizadas
 */
export function createErrorResponse(
  message: string, 
  error: unknown, 
  status: number = 500
): NextResponse {
  console.error(`API Error: ${message}`, error);
  return NextResponse.json(
    { 
      message, 
      error: getErrorMessage(error),
      timestamp: new Date().toISOString()
    },
    { status }
  );
}

/**
 * Helper para crear respuestas de éxito estandarizadas
 */
export function createSuccessResponse(
  data: any, 
  status: number = 200,
  message?: string
): NextResponse {
  const response: any = { data };
  if (message) response.message = message;
  response.timestamp = new Date().toISOString();
  
  return NextResponse.json(response, { status });
}

/**
 * Helper para validar campos requeridos
 */
export function validateRequiredFields(
  data: Record<string, any>, 
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(field => 
    !data[field] || (typeof data[field] === 'string' && data[field].trim() === '')
  );
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

/**
 * Helper para parsear parámetros de consulta como números
 */
export function parseQueryId(id: string | null): number | null {
  if (!id) return null;
  const parsed = parseInt(id, 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Helper para crear respuesta de validación de campos
 */
export function createValidationErrorResponse(missingFields: string[]): NextResponse {
  return NextResponse.json(
    { 
      message: 'Campos requeridos faltantes',
      missingFields,
      timestamp: new Date().toISOString()
    },
    { status: 400 }
  );
}

/**
 * Helper para crear respuesta de recurso no encontrado
 */
export function createNotFoundResponse(resource: string, id?: string | number): NextResponse {
  const message = id 
    ? `${resource} con ID ${id} no encontrado`
    : `${resource} no encontrado`;
    
  return NextResponse.json(
    { 
      message,
      timestamp: new Date().toISOString()
    },
    { status: 404 }
  );
}

/**
 * Helper para manejo común de parámetros de paginación
 */
export function parsePaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}