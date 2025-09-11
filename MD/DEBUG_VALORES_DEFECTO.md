# DEBUG: Valores por defecto en modo edición para origenCausa y estadoCausa

## Problema
Los selectores de `origenCausa` y `estadoCausa` no muestran los valores seleccionados por defecto cuando se abre una causa en modo edición.

## Cambios Realizados para Debug

### 1. API Endpoint (GET `/api/causas/[id]`) 
✅ **Agregados logs detallados**:
```typescript
console.log('🔍 DEBUG GET - Respuesta final construida:');
console.log('origenCausaId:', causa.origenCausaId);
console.log('origenCausa:', causa.origenCausa);
console.log('estadoCausaId:', causa.estadoCausaId);
console.log('estadoCausa:', causa.estadoCausa);
```

### 2. CausaService (`transformInitialData`)
✅ **Agregados logs para seguimiento**:
```typescript
console.log('🔍 DEBUG transformInitialData - Datos recibidos:', data);
console.log('🔍 DEBUG transformInitialData - origenCausaId:', data.origenCausaId);
console.log('🔍 DEBUG transformInitialData - estadoCausaId:', data.estadoCausaId);
// ... más logs
```

### 3. CausaForm (useEffect de initialValues)
✅ **Corregido manejo de valores y agregados logs**:
```typescript
// ANTES - Problema: parseSelectValue se ejecutaba siempre
origenCausaId: initialValues.origenCausaId ? parseSelectValue(initialValues.origenCausaId.toString()) : undefined,

// DESPUÉS - Corregido: Validar primero si no es null/undefined
origenCausaId: initialValues.origenCausaId !== undefined && initialValues.origenCausaId !== null 
  ? (typeof initialValues.origenCausaId === 'number' ? initialValues.origenCausaId : parseSelectValue(initialValues.origenCausaId.toString()))
  : undefined,
```

✅ **Agregados logs detallados**:
```typescript
console.log('🔍 DEBUG CausaForm - Initial values received:', initialValues);
console.log('🔍 DEBUG CausaForm - origenCausaId inicial:', initialValues.origenCausaId);
console.log('🔍 DEBUG CausaForm - estadoCausaId inicial:', initialValues.estadoCausaId);
// ... más logs para seguimiento del flujo
```

### 4. OrigenCausaSelector 
✅ **Agregados logs de debug**:
```typescript
console.log('🔍 OrigenCausaSelector - Props changed:', {
  value,
  origenesLoaded: origenes.length,
  isLoading,
  valueExists: origenes.some(o => o.id.toString() === value)
});
```

✅ **Agregado key para forzar re-render**:
```typescript
<Select key={`origen-${value}-${origenes.length}`}>
```

### 5. EstadoCausaSelector
✅ **Ya tenía logs de debug** (estaba mejor implementado)

## Puntos de Verificación

### Flujo de Datos:
1. **API GET** → ¿Los datos incluyen `origenCausaId` y `estadoCausaId`?
2. **CausaService** → ¿La transformación mantiene los valores correctos?
3. **CausaForm** → ¿Los initialValues se setean correctamente?
4. **Selectores** → ¿Reciben y muestran los valores apropiados?

### Possible Issues a Verificar:
1. ✅ **Timing**: Los selectores cargan después de recibir los valores
2. ✅ **Tipo de datos**: Los valores son number pero los selectores esperan string
3. ✅ **Estado del formulario**: Los valores se pierden al re-renderizar
4. ✅ **Conversión**: Los valores null se convierten incorrectamente

## Pruebas a Realizar

1. **Abrir causa en modo edición** y revisar la consola:
   - Verificar logs de API GET
   - Verificar logs de transformInitialData
   - Verificar logs de CausaForm
   - Verificar logs de selectores

2. **Verificar valores en la base de datos**:
   - Confirmar que existen valores para `origenCausaId` y `estadoCausaId`

3. **Verificar endpoints de opciones**:
   - `/api/origenes-causa` retorna datos
   - `/api/estados-causa` retorna datos

## Estado Actual
🔄 **EN DEBUG** - Se agregaron logs extensivos para identificar en qué punto se pierden los valores por defecto.

## Próximos Pasos
1. Ejecutar prueba en modo edición
2. Revisar logs de consola  
3. Identificar punto de falla específico
4. Aplicar corrección precisa
