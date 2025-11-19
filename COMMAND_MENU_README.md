# Command Menu - ECOH Insight

## 🚀 Características Implementadas

### ✅ Command Palette Completo
- **Búsqueda rápida** de todas las secciones del sistema
- **Acciones rápidas** (crear causa, actividad, imputado)
- **Enlaces externos** (DUO, Clave Única, ECOH Link)
- **Navegación inteligente** organizada por categorías

## 🎯 Cómo Usar

### Keyboard Shortcuts
- **Windows/Linux**: `Ctrl + K`
- **Mac**: `Cmd + K`

### Botones
- **Desktop**: Botón "Buscar..." en el navbar (con indicador de shortcut)
- **Mobile**: Ícono de lupa en el navbar

## 📂 Archivos Modificados/Creados

### ✅ Nuevos archivos:
```
components/ui/command-menu.tsx
```

### ✅ Archivos modificados:
```
components/layout/header.tsx
```

## 🎨 Características del Componente

### Categorías Organizadas:
1. ⚡ **Acciones Rápidas**
   - Crear Nueva Causa
   - Crear Nueva Actividad
   - Registrar Imputado

2. 🏠 **Navegación**
   - Dashboard

3. 📂 **Gestión de Causas**
   - Causas
   - Tablero de Actividades

4. ✅ **Actividades**
   - Gestión de Actividades
   - Actividades por Usuario

5. 👥 **Personas**
   - Imputados o Sujetos de Interés
   - Víctimas

6. 🗺️ **Análisis y Visualización**
   - Mapas de Delitos
   - Genogramas

7. 🏢 **Organizaciones Criminales**
   - Gestión de Organizaciones
   - Network Graph

8. 📱 **Teléfonos**
   - Gestión de Teléfonos
   - Grafo de Teléfonos

9. 📊 **Reportes**
   - Reportes y Estadísticas

10. 🛠️ **Herramientas Útiles**
    - Correlativos
    - Validar RUN

11. 🔗 **Enlaces Externos**
    - Escritorio FN - DUO
    - Escritorio FN - Clave Única
    - ECOH Link

## 🔧 Para Probarlo

1. Inicia el servidor de desarrollo:
```bash
npm run dev
```

2. Presiona `Ctrl + K` (o `Cmd + K` en Mac)

3. Empieza a escribir:
   - "causas" → verás todas las opciones relacionadas con causas
   - "crear" → verás las acciones rápidas de creación
   - "mapa" → acceso directo a mapas
   - "duo" → enlace al Escritorio FN

## 🎯 Ventajas

✅ **Cero amontonamiento** - No agrega botones al navbar
✅ **Súper rápido** - Acceso en 2 segundos a cualquier sección
✅ **Escalable** - Puedes agregar 100+ opciones sin problema
✅ **Profesional** - Mismo estilo que GitHub, Vercel, Linear
✅ **Móvil friendly** - También funciona en dispositivos móviles
✅ **Teclado friendly** - Power users lo van a amar

## 📝 Para Agregar Más Opciones

Edita el archivo `components/ui/command-menu.tsx` y agrega nuevos `CommandItem`:

```tsx
<CommandItem
  onSelect={() => handleSelect(() => router.push('/tu-nueva-ruta'))}
>
  <TuIcono className="mr-2 h-4 w-4" />
  <span>Tu Nueva Opción</span>
</CommandItem>
```

## 🎨 Personalización

Si quieres cambiar los colores de los iconos de enlaces externos, edita las clases en:
```tsx
<ExternalLink className="mr-2 h-4 w-4 text-green-600" /> // Cambia el color aquí
```

## 🐛 Troubleshooting

Si el Command Menu no aparece:
1. Verifica que estés autenticado (SignedIn)
2. Revisa la consola del navegador por errores
3. Asegúrate de tener todas las dependencias instaladas:
```bash
npm install
```

## 💡 Tips

- El componente se cierra automáticamente al seleccionar una opción
- Usa ESC para cerrarlo sin seleccionar nada
- La búsqueda es instantánea y busca en títulos y categorías
- Los enlaces externos se abren en nueva pestaña automáticamente
