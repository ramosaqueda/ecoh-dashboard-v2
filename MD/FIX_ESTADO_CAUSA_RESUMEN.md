# SOLUCIÓN: Campo estadoCausa no se registra en Base de Datos

## Problema Identificado
El campo `estadoCausaId` estaba definido correctamente en:
- ✅ Esquema de validación (`schemas/causaSchema.ts`)
- ✅ Formulario (`components/forms/CausaForm/index.tsx`)
- ✅ Selector (`EstadoCausaSelector`)

Pero **FALTABA** en los endpoints de la API para crear y actualizar causas.

## Cambios Realizados

### 1. Actualización del Endpoint POST (`/api/causas/route.ts`)
- ✅ Agregado procesamiento y validación de `estadoCausaId`
- ✅ Agregada verificación de existencia del estado antes de crear
- ✅ Incluido `estadoCausaId` en la creación inicial de la causa
- ✅ Agregados logs de debug para seguimiento

### 2. Actualización del Endpoint PUT (`/api/causas/[id]/route.ts`)
- ✅ Agregado procesamiento y validación de `estadoCausaId` 
- ✅ Incluido `estadoCausaId` en la actualización de causa
- ✅ Agregados logs de debug para seguimiento
- ✅ Actualizada consulta GET para incluir relación `estadoCausa`

### 3. Actualización de Consultas
- ✅ Agregada relación `estadoCausa` en consultas GET
- ✅ Mantenida consistencia con `origenCausa` existente

## Código Agregado

### Validación en POST:
```typescript
// Procesar y validar estadoCausaId
let estadoCausaIdProcessed = null;
if (data.estadoCausaId !== undefined && data.estadoCausaId !== null && data.estadoCausaId !== '') {
  if (typeof data.estadoCausaId === 'string') {
    estadoCausaIdProcessed = parseInt(data.estadoCausaId, 10);
    if (isNaN(estadoCausaIdProcessed)) {
      estadoCausaIdProcessed = null;
    }
  } else if (typeof data.estadoCausaId === 'number') {
    estadoCausaIdProcessed = data.estadoCausaId;
  }
}

// Verificar si el estado existe
if (estadoCausaIdProcessed) {
  const estadoExists = await prisma.estadoCausa.findUnique({
    where: { id: estadoCausaIdProcessed }
  });
  
  if (!estadoExists) {
    return NextResponse.json(
      { error: `El estado de causa con ID ${estadoCausaIdProcessed} no existe` },
      { status: 400 }
    );
  }
}
```

### Inclusión en Datos de Creación/Actualización:
```typescript
const causaData = {
  denominacionCausa: data.denominacionCausa || '',
  origenCausaId: origenCausaIdProcessed,
  estadoCausaId: estadoCausaIdProcessed, // ✅ AGREGADO
  // ... otros campos
};
```

### Consultas Actualizadas:
```typescript
include: {
  origenCausa: {
    select: {
      id: true,
      nombre: true,
      codigo: true,
      color: true
    }
  },
  estadoCausa: { // ✅ AGREGADO
    select: {
      id: true,
      nombre: true,
      codigo: true,
      color: true
    }
  },
  // ... otras relaciones
}
```

## Verificaciones Implementadas
1. ✅ Validación de tipo de datos (string → number)
2. ✅ Verificación de existencia del estado en BD
3. ✅ Logs de debug para seguimiento
4. ✅ Manejo de valores null/undefined
5. ✅ Inclusión en consultas de retorno

## Resultado
- El campo `estadoCausaId` ahora se guarda correctamente en la base de datos
- Se mantiene consistencia con el campo `origenCausaId` existente
- Funciona tanto para creación (POST) como actualización (PUT)
- Las consultas retornan la información completa del estado de causa

## Estado: ✅ SOLUCIONADO
El problema ha sido corregido. El campo `estadoCausa` ahora se registra correctamente en la base de datos.
