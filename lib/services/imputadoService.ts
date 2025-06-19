// /lib/services/imputadoService.ts
import axios from 'axios';

/**
 * Recupera todas las causas en las que está involucrado un imputado
 * @param imputadoId ID del imputado
 * @returns Arreglo de causas relacionadas con el imputado
 */
export async function getImputadoCausas(imputadoId: number | string) {
  try {
    const response = await axios.get(`/api/imputado/${imputadoId}/causas`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener causas del imputado:', error);
    throw error;
  }
}

/**
 * Verifica si un imputado está presente en múltiples causas
 * @param imputadoId ID del imputado
 * @param currentCausaId ID de la causa actual (para excluirla de los resultados)
 * @returns Objeto con la cantidad de otras causas y los detalles de estas
 */
export async function checkImputadoMultiplesCausas(imputadoId: number | string, currentCausaId: number | string) {
  try {
    const causas = await getImputadoCausas(imputadoId);
    
    // Filtrar para excluir la causa actual
    const otrasCausas = causas.filter((causa: any) => causa.id !== Number(currentCausaId));
    
    return {
      tieneMultiplesCausas: otrasCausas.length > 0,
      cantidadCausas: otrasCausas.length,
      causas: otrasCausas
    };
  } catch (error) {
    console.error('Error al verificar múltiples causas:', error);
    return {
      tieneMultiplesCausas: false,
      cantidadCausas: 0,
      causas: []
    };
  }
}