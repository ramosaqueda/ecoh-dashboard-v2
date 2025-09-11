# 🚀 MIGRACIÓN DE ENDPOINTS - GUÍA DE IMPLEMENTACIÓN

## 📋 Resumen Ejecutivo

Esta guía te ayudará a migrar todos los endpoints que utilizan campos lógicos obsoletos (`causaEcoh`, `causaSACFI`, `causaLegada`) al nuevo esquema con `origenCausa` y `estadoCausa`.

## ⚠️ IMPORTANTE - ANTES DE EMPEZAR

1. **Backup completo**: Asegúrate de tener backup de tu base de datos
2. **Verificar migración BD**: Confirma que el script SQL de migración se ejecutó correctamente
3. **Entorno de desarrollo**: Ejecuta primero en desarrollo, luego en producción

## 🔍 VERIFICACIÓN PREVIA

Ejecuta esta consulta SQL para confirmar que la migración de datos está completa:

```sql
-- Verificar estructura migrada
SELECT 
    COUNT(*) as total_causas,
    SUM(CASE WHEN "origenCausaId" = 1 THEN 1 ELSE 0 END) as sacfi,
    SUM(CASE WHEN "origenCausaId" = 2 THEN 1 ELSE 0 END) as ecoh_elqui,
    SUM(CASE WHEN "origenCausaId" = 4 THEN 1 ELSE 0 END) as otras_fiscalias,
    SUM(CASE WHEN "origenCausaId" IS NULL THEN 1 ELSE 0 END) as sin_origen
FROM "Causa";
```

Si ves datos en las columnas, puedes proceder.

## 📁 ARCHIVOS IDENTIFICADOS PARA MIGRACIÓN

### ✅ ARCHIVOS YA MIGRADOS
- `/api/causas/route.ts` - **COMPLETO**
- `/api/analytics/crimen-organizado/route.ts` - **COMPLETO**

### 🔴 ARCHIVOS CRÍTICOS (REQUIEREN MIGRACIÓN)
1. `/api/reportes/fiscales/route.ts`
2. `/api/reportes/fiscales/export/route.ts`

### 🟡 ARCHIVOS A VERIFICAR
3. `/api/analytics/causas-abogado/route.ts`
4. `/api/analytics/causas-analista/route.ts`
5. `/api/causas/search/route.ts`

## 🛠️ PLAN DE EJECUCIÓN PASO A PASO

### PASO 1: Crear Backups (5 min)

```bash
# Crear directorio de backup
mkdir backup-migracion-$(date +%Y%m%d)

# Backup de archivos críticos
cp app/api/reportes/fiscales/route.ts backup-migracion-$(date +%Y%m%d)/
cp app/api/reportes/fiscales/export/route.ts backup-migracion-$(date +%Y%m%d)/
```

### PASO 2: Actualizar Tipos TypeScript (10 min)

Crea/actualiza el archivo `types/reporte.ts`:

```typescript
// ✅ MIGRADO: Interface de filtros actualizada
export interface ReporteFiltros {
  fechaInicio?: string;
  fechaFin?: string;
  fiscalId?: number;
  
  // ✅ NUEVOS CAMPOS
  origenCausaId?: number;
  estadoCausaId?: number;
  
  // ✅ COMPATIBILIDAD TEMPORAL
  causaEcoh?: boolean;  // @deprecated
  causaSacfi?: boolean; // @deprecated  
  causaLegada?: boolean; // @deprecated
  
  esCrimenOrganizado?: boolean;
}

// Agregar nuevos campos a interfaces existentes...
```

### PASO 3: Migrar Endpoint Principal (30 min)

Reemplaza el contenido de `app/api/reportes/fiscales/route.ts`:

```typescript
// Constantes de mapeo
const ORIGEN_IDS = {
  SACFI: 1,
  ECOH_ELQUI: 2,
  ECOH_LIMARI: 3,
  OTRAS_FISCALIAS: 4
} as const;

// Actualizar filtros para compatibilidad
const filtros: ReporteFiltros = {
  // ... campos existentes
  
  // ✅ NUEVOS CAMPOS
  origenCausaId: searchParams.get('origenCausaId') ? parseInt(searchParams.get('origenCausaId')!) : undefined,
  
  // ✅ COMPATIBILIDAD TEMPORAL
  ...(searchParams.get('causaEcoh') === 'true' && { origenCausaId: ORIGEN_IDS.ECOH_ELQUI }),
  ...(searchParams.get('causaSacfi') === 'true' && { origenCausaId: ORIGEN_IDS.SACFI }),
  ...(searchParams.get('causaLegada') === 'true' && { origenCausaId: ORIGEN_IDS.OTRAS_FISCALIAS }),
};

// Actualizar whereConditions
if (filtros.origenCausaId !== undefined) {
  whereConditions.origenCausaId = filtros.origenCausaId;
}

// Actualizar include para nuevas relaciones
include: {
  fiscal: true,
  delito: true,
  foco: true,
  origenCausa: { // ✅ NUEVO
    select: {
      id: true,
      nombre: true,
      color: true
    }
  },
  estadoCausa: { // ✅ NUEVO
    select: {
      id: true,
      nombre: true,
      codigo: true,
      color: true
    }
  },
  _count: {
    select: {
      imputados: true,
      victimas: true,
    }
  }
}

// Actualizar lógica de conteo
causas.forEach(causa => {
  // ... código existente
  
  // ✅ NUEVO: Conteo basado en origenCausaId
  if (causa.origenCausaId === ORIGEN_IDS.ECOH_ELQUI || causa.origenCausaId === ORIGEN_IDS.ECOH_LIMARI) {
    stats.totales.ecoh++;
  }
  if (causa.origenCausaId === ORIGEN_IDS.SACFI) {
    stats.totales.sacfi++;
  }
  if (causa.origenCausaId === ORIGEN_IDS.OTRAS_FISCALIAS) {
    stats.totales.legadas++;
  }
});
```

### PASO 4: Migrar Endpoint de Exportación (20 min)

Actualiza `app/api/reportes/fiscales/export/route.ts` con la misma lógica:

```typescript
// Usar las mismas constantes y lógica de filtros
// Actualizar columnas de exportación:

'Origen': causa.origenCausa?.nombre || 'Sin Origen',
'Estado Causa': causa.estadoCausa?.nombre || 'Sin Estado',
'Es ECOH': (causa.origenCausaId === ORIGEN_IDS.ECOH_ELQUI || causa.origenCausaId === ORIGEN_IDS.ECOH_LIMARI) ? 'Sí' : 'No',
'Es SACFI': causa.origenCausaId === ORIGEN_IDS.SACFI ? 'Sí' : 'No',
'Es Legada': causa.origenCausaId === ORIGEN_IDS.OTRAS_FISCALIAS ? 'Sí' : 'No',
```

### PASO 5: Pruebas y Verificación (15 min)

```bash
# Reiniciar servidor de desarrollo
npm run dev

# Probar endpoints principales
curl http://localhost:3000/api/reportes/fiscales

# Probar con filtro nuevo
curl "http://localhost:3000/api/reportes/fiscales?origenCausaId=2"

# Probar compatibilidad temporal
curl "http://localhost:3000/api/reportes/fiscales?causaEcoh=true"

# Probar exportación
curl "http://localhost:3000/api/reportes/fiscales/export?formato=xlsx" -o test.xlsx
```

## ✅ CRITERIOS DE ÉXITO

- [ ] Endpoints responden sin errores 500
- [ ] Filtros por `origenCausaId` funcionan correctamente
- [ ] Compatibilidad temporal con campos obsoletos mantiene funcionalidad
- [ ] Exportaciones incluyen nuevas columnas
- [ ] Conteos de causas son consistentes
- [ ] No hay pérdida de datos

## 🔧 ENDPOINTS ADICIONALES A VERIFICAR

### Analytics que podrían necesitar actualización:

1. **causas-abogado** - Verificar si usa filtros de origen
2. **causas-analista** - Verificar si usa filtros de origen
3. **causas-atvt** - Verificar si usa filtros de origen

```bash
# Verificar contenido de archivos analytics
grep -n "causaEcoh\|causaSacfi\|causaLegada" app/api/analytics/*/route.ts
```

## 🚨 SOLUCIÓN DE PROBLEMAS COMUNES

### Error: "origenCausa relation not found"
**Solución**: Verificar que el schema de Prisma incluye la relación:
```prisma
model Causa {
  origenCausaId Int?
  origenCausa   OrigenCausa? @relation(fields: [origenCausaId], references: [id])
}
```

### Error: "Cannot read property of undefined"
**Solución**: Agregar verificaciones null-safe:
```typescript
causa.origenCausa?.nombre || 'Sin Origen'
```

### Error: Conteos incorrectos
**Solución**: Verificar que los IDs de origen coinciden:
```sql
SELECT id, nombre FROM origenes_causa;
```

## 📊 VALIDACIÓN DE DATOS

### Consultas SQL para verificar migración:

```sql
-- Verificar consistency entre campos obsoletos y nuevos
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN "causaEcoh" = true AND "origenCausaId" IN (2,3) THEN 1 END) as ecoh_consistente,
    COUNT(CASE WHEN "causaSacfi" = true AND "origenCausaId" = 1 THEN 1 END) as sacfi_consistente,
    COUNT(CASE WHEN "causaLegada" = true AND "origenCausaId" = 4 THEN 1 END) as legada_consistente
FROM "Causa"
WHERE "causaEcoh" = true OR "causaSacfi" = true OR "causaLegada" = true;

-- Verificar distribución por origen
SELECT 
    oc.nombre,
    COUNT(c.id) as cantidad
FROM origenes_causa oc
LEFT JOIN "Causa" c ON c."origenCausaId" = oc.id
GROUP BY oc.id, oc.nombre
ORDER BY cantidad DESC;
```

## 🔄 PLAN DE ROLLBACK

Si algo sale mal, puedes revertir rápidamente:

```bash
# Restaurar archivos desde backup
cp backup-migracion-*/route.ts app/api/reportes/fiscales/
cp backup-migracion-*/route.ts app/api/reportes/fiscales/export/

# Reiniciar servidor
npm run dev
```

## 📈 MEJORAS ADICIONALES SUGERIDAS

### Una vez completada la migración:

1. **Crear endpoint para origenes-causa**:
```typescript
// app/api/origenes-causa/route.ts
export async function GET() {
  const origenes = await prisma.origenCausa.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' }
  });
  return NextResponse.json(origenes);
}
```

2. **Crear endpoint para estados-causa**:
```typescript
// app/api/estados-causa/route.ts  
export async function GET() {
  const estados = await prisma.estadoCausa.findMany({
    where: { activo: true },
    orderBy: { orden: 'asc' }
  });
  return NextResponse.json(estados);
}
```

3. **Actualizar formularios frontend**:
   - Reemplazar checkboxes por dropdown de orígenes
   - Agregar filtro por estado de causa
   - Actualizar componentes de visualización

## 📋 CHECKLIST FINAL

### Backend (Endpoints)
- [ ] `/api/reportes/fiscales/route.ts` migrado y probado
- [ ] `/api/reportes/fiscales/export/route.ts` migrado y probado
- [ ] Endpoints analytics verificados
- [ ] Búsquedas funcionan correctamente
- [ ] Compatibilidad temporal mantenida

### Base de Datos
- [ ] Migración SQL ejecutada
- [ ] Datos verificados con consultas
- [ ] No hay inconsistencias detectadas
- [ ] Rendimiento mantenido

### Frontend (Para posterior)
- [ ] Componentes de filtros actualizados
- [ ] Formularios usan nuevos campos
- [ ] Tablas muestran información correcta
- [ ] Reportes se exportan correctamente

### Cleanup (Después de confirmar)
- [ ] Eliminar campos obsoletos de BD
- [ ] Remover código de compatibilidad temporal
- [ ] Actualizar documentación
- [ ] Eliminar archivos de backup antiguos

## 🎯 PRÓXIMOS PASOS DESPUÉS DE LA MIGRACIÓN

1. **Monitorear logs** por 24-48 horas
2. **Ejecutar reportes en producción** para verificar
3. **Actualizar componentes frontend** progresivamente
4. **Planificar eliminación de campos obsoletos** (en 2-4 semanas)
5. **Documentar cambios** para el equipo

## 📞 CONTACTO Y SOPORTE

Si encuentras problemas durante la migración:

1. Revisa los logs del servidor: `tail -f logs/server.log`
2. Verifica la consola del navegador en frontend
3. Ejecuta las consultas SQL de verificación
4. Consulta el backup para comparar diferencias

---

**¡Migración completada!** 🎉

*Recuerda: Esta migración mantiene compatibilidad total hacia atrás. Los campos obsoletos seguirán funcionando hasta que decidas eliminarlos definitivamente.*