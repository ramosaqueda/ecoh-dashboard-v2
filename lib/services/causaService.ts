import { CausaFormData, Causa } from '@/types/causa';

interface ErrorResponse {
  error: string;
  message?: string;
  statusCode?: number;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const causaService = {
  /**
   * Obtiene todas las causas
   */
  async getAll(): Promise<Causa[]> {
    try {
      const response = await fetch('/api/causas', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new ApiError(
          response.status,
          errorData.message || 'Error al obtener las causas'
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al conectar con el servidor');
    }
  },

  /**
   * Obtiene una causa por su ID
   */
  async getById(id: number): Promise<Causa> {
    try {
      const response = await fetch(`/api/causas/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new ApiError(
          response.status,
          errorData.message || 'Error al obtener la causa'
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al conectar con el servidor');
    }
  },

  /**
   * Crea una nueva causa
   */
  async create(data: CausaFormData): Promise<Causa> {
    try {
      const transformedData = this.transformFormData(data);

      const response = await fetch('/api/causas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transformedData)
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new ApiError(
          response.status,
          errorData.message || 'Error al crear la causa'
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al conectar con el servidor');
    }
  },

  /**
   * Actualiza una causa existente
   */
  async update(id: number, data: CausaFormData): Promise<Causa> {
    try {
      console.log('🔍 DEBUG causaService.update - Datos del formulario antes de transformar:', data);
      console.log('🔍 DEBUG causaService.update - Valor de atvt en el formulario:', data.atvt);

      const transformedData = this.transformFormData(data);
      console.log('🔍 DEBUG causaService.update - Datos transformados:', transformedData);
      console.log('🔍 DEBUG causaService.update - atvtId transformado:', transformedData.atvtId);

      const response = await fetch(`/api/causas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transformedData)
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new ApiError(
          response.status,
          errorData.message || 'Error al actualizar la causa'
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al conectar con el servidor');
    }
  },

  /**
   * Elimina una causa
   */
  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/causas/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new ApiError(
          response.status,
          errorData.message || 'Error al eliminar la causa'
        );
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al conectar con el servidor');
    }
  },

  /**
   * Transforma los datos del formulario para enviar al servidor
   */
  transformFormData(data: CausaFormData): Record<string, any> {
    // Log para depuración
    console.log('🔍 DEBUG transformFormData - Datos originales del formulario:', data);
    console.log('🔍 DEBUG transformFormData - atvt original:', data.atvt);

    const transformedData: Record<string, any> = {
      // Campos booleanos
      causaEcoh: data.causaEcoh,
      causaLegada: data.causaLegada,
      constituyeSs: data.constituyeSs,
      homicidioConsumado: data.homicidioConsumado,

      // Campos de texto
      denominacionCausa: data.denominacionCausa,
      ruc: data.ruc,
      folioBw: data.folioBw,
      coordenadasSs: data.coordenadasSs,
      rit: data.rit,
      numeroIta: data.numeroIta,
      numeroPpp: data.numeroPpp,
      observacion: data.observacion,

      // Fechas - con validación y manejo de nulos
      fechaHoraTomaConocimiento: data.fechaHoraTomaConocimiento
        ? new Date(data.fechaHoraTomaConocimiento).toISOString()
        : null,
      fechaDelHecho: data.fechaDelHecho
        ? new Date(`${data.fechaDelHecho}T00:00:00.000Z`).toISOString()
        : null,
      fechaIta: data.fechaIta
        ? new Date(`${data.fechaIta}T00:00:00.000Z`).toISOString()
        : null,
      fechaPpp: data.fechaPpp
        ? new Date(`${data.fechaPpp}T00:00:00.000Z`).toISOString()
        : null,

      // Relaciones - con validación
      delitoId: data.delito ? parseInt(data.delito.toString()) : null,
      focoId: data.foco ? parseInt(data.foco.toString()) : null,
      tribunalId: data.tribunal ? parseInt(data.tribunal.toString()) : null,
      fiscalId: data.fiscalACargo
        ? parseInt(data.fiscalACargo.toString())
        : null,
      abogadoId: data.abogado ? parseInt(data.abogado.toString()) : null,
      analistaId: data.analista ? parseInt(data.analista.toString()) : null,
      // ✅ FIX: Mejor manejo de atvt
      atvtId: (() => {
        if (data.atvt === undefined || data.atvt === null || data.atvt === 0) {
          return null;
        }
        const parsed = parseInt(data.atvt.toString());
        return isNaN(parsed) || parsed === 0 ? null : parsed;
      })(),

      // AÑADIR causasCrimenOrg - Asegurarse de que sea un array
      causasCrimenOrg: Array.isArray(data.causasCrimenOrg)
        ? data.causasCrimenOrg.map((id) =>
            typeof id === 'string' ? parseInt(id) : id
          )
        : [],

      // Estado de crimen organizado
      esCrimenOrganizado:
        data.esCrimenOrganizado === true
          ? 0
          : data.esCrimenOrganizado === false
          ? 1
          : 2
    };

    console.log('🔍 DEBUG transformFormData - atvtId antes de limpiar:', transformedData.atvtId);

    // ✅ FIX PRINCIPAL: Lista de campos que SIEMPRE deben incluirse, incluso si son null
    const alwaysIncludeFields = [
      'atvtId', 
      'abogadoId', 
      'analistaId', 
      'fiscalId', 
      'tribunalId', 
      'focoId'
    ];

    // ✅ FIX: Eliminar solo campos undefined, pero mantener null para relaciones importantes
    const cleanedData: Record<string, any> = {};
    Object.entries(transformedData).forEach(([key, value]) => {
      if (value !== undefined) {
        // Incluir todos los campos que no son undefined
        cleanedData[key] = value;
      } else if (alwaysIncludeFields.includes(key)) {
        // Incluir campos importantes incluso si son undefined (convertir a null)
        cleanedData[key] = null;
      }
    });

    // Log para depuración
    console.log('🔍 DEBUG transformFormData - Datos finales para enviar al API:', cleanedData);
    console.log('🔍 DEBUG transformFormData - atvtId final:', cleanedData.atvtId);
    console.log('🔍 DEBUG transformFormData - causasCrimenOrg en datos transformados:', cleanedData.causasCrimenOrg);

    return cleanedData;
  },

  /**
   * Transforma los datos iniciales para el formulario
   */
  transformInitialData(data: any): Record<string, any> {
    if (!data) return {};

    console.log('🔍 DEBUG transformInitialData - Datos recibidos para inicializar formulario:', data);
    console.log('🔍 DEBUG transformInitialData - atvtId recibido:', data.atvtId);

    // Extraer los IDs de los parámetros de crimen organizado si existen
    let causasCrimenOrg: number[] = [];
    if (data.causasCrimenOrg && Array.isArray(data.causasCrimenOrg)) {
      causasCrimenOrg = data.causasCrimenOrg.map((item: any) =>
        item.parametroId ? item.parametroId : parseInt(item.toString())
      );
    }

    console.log('🔍 DEBUG transformInitialData - causasCrimenOrg extraídos:', causasCrimenOrg);

    const transformedData = {
      id: data.id,
      causaEcoh: data.causaEcoh || false,
      causaLegada: data.causaLegada || false,
      constituyeSs: data.constituyeSs || false,
      denominacionCausa: data.denominacionCausa || '',
      homicidioConsumado: data.homicidioConsumado || false,
      ruc: data.ruc || '',
      foliobw: data.foliobw || '',
      coordenadasSs: data.coordenadasSs || '',
      rit: data.rit || '',
      numeroIta: data.numeroIta || '',
      numeroPpp: data.numeroPpp || '',
      observacion: data.observacion || '',

      // Formateo de fechas para los inputs
      fechaHoraTomaConocimiento: data.fechaHoraTomaConocimiento
        ? new Date(data.fechaHoraTomaConocimiento).toISOString().slice(0, 16)
        : '',
      fechaDelHecho: data.fechaDelHecho
        ? new Date(data.fechaDelHecho).toISOString().slice(0, 10)
        : '',
      fechaIta: data.fechaIta
        ? new Date(data.fechaIta).toISOString().slice(0, 10)
        : '',
      fechaPpp: data.fechaPpp
        ? new Date(data.fechaPpp).toISOString().slice(0, 10)
        : '',

      // Relaciones
      delito: data.delitoId || null,
      foco: data.focoId || null,
      tribunal: data.tribunalId || null,
      fiscalACargo: data.fiscalId || null,
      abogado: data.abogadoId || null,
      analista: data.analistaId || null,
      // ✅ FIX: Mejorar el mapeo de atvt
      atvt: data.atvtId || null,

      // Añadir causasCrimenOrg
      causasCrimenOrg: causasCrimenOrg,

      // Estado de crimen organizado
      esCrimenOrganizado:
        data.esCrimenOrganizado === 0
          ? true
          : data.esCrimenOrganizado === 1
          ? false
          : null
    };

    console.log('🔍 DEBUG transformInitialData - atvt final mapeado:', transformedData.atvt);
    console.log('🔍 DEBUG transformInitialData - datos transformados finales:', transformedData);

    return transformedData;
  },

  /**
   * Valida si una fecha es válida
   */
  isValidDate(date: string): boolean {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  }
};