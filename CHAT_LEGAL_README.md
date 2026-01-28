# Chat Legal con IA - ECOH Insight

Sistema de consultas en lenguaje natural a la base de datos usando Ollama con modelos locales.

## 🚀 Características

- ✅ Consultas en lenguaje natural a la base de datos PostgreSQL
- ✅ Dos modelos de IA disponibles:
  - **Llama 3.2**: Rápido y eficiente para consultas simples
  - **DeepSeek R1 8B**: Razonamiento avanzado para consultas complejas
- ✅ Generación automática de SQL validado y seguro
- ✅ Interfaz de chat moderna y responsive
- ✅ Visualización de resultados JSON
- ✅ Copia de queries SQL generadas
- ✅ Historial de conversación
- ✅ Validación de seguridad (solo SELECT queries)

## 📋 Requisitos previos

- Servidor Ollama ejecutándose en `http://172.17.100.45:11434`
- Modelos instalados:
  - `llama3.2`
  - `deepseek-r1:8b`

## 🧪 Probar la conexión

Ejecuta el script de prueba para verificar que todo funciona:

```bash
node test-ollama.js
```

Deberías ver:
```
🔍 Probando conexión con Ollama...
✅ Ollama está disponible
📦 Modelos instalados: 6
   - llama3.2:latest
   - deepseek-r1:8b
   ...
🎉 ¡Todas las pruebas pasaron exitosamente!
```

## 🎯 Uso

### Acceso a la aplicación

1. Inicia el servidor de desarrollo:
```bash
npm run dev
```

2. Navega a: `http://localhost:3000/dashboard/chat-legal`

3. Selecciona el modelo de IA que prefieres usar

4. Escribe tu pregunta en lenguaje natural

### Ejemplos de preguntas

```
¿Cuántas causas hay registradas en total?

Muestra los imputados con apellido González

¿Qué causas están asociadas al RUC 2400123456-7?

Lista las causas de ECOH Elqui que están en investigación

¿El imputado con RUT 12345678-9 tiene causas activas?

Muestra las actividades pendientes de esta semana

¿Cuántos imputados tienen más de 3 causas?

Lista los delitos más frecuentes por origen de causa
```

## 🏗️ Arquitectura

```
Usuario
   ↓
Frontend (Next.js + React)
   ↓
API Route (/api/chat-legal)
   ↓
Ollama Server (172.17.100.45:11434)
   ↓
Modelo IA (llama3.2 o deepseek-r1:8b)
   ↓
PostgreSQL Database
```

## 🔒 Seguridad

El sistema implementa varias capas de seguridad:

1. **Autenticación Clerk**: Solo usuarios autenticados pueden usar el chat
2. **Validación de queries**: Solo se permiten consultas SELECT
3. **Palabras bloqueadas**: DROP, DELETE, UPDATE, INSERT, ALTER, CREATE, TRUNCATE
4. **Sanitización**: Validación antes de ejecutar en la base de datos
5. **Rate limiting**: Control de uso por usuario
6. **Logging**: Todas las consultas se registran para auditoría

## 📁 Archivos principales

```
app/
├── api/
│   └── chat-legal/
│       └── route.ts          # API endpoint principal
└── dashboard/
    └── chat-legal/
        └── page.tsx           # Interfaz del chat

constants/
└── data.ts                    # Navegación (incluye link al chat)

test-ollama.js                 # Script de prueba de conexión
```

## 🛠️ Configuración del servidor Ollama

### Ver modelos instalados
```bash
ollama list
```

### Instalar modelos adicionales (si es necesario)
```bash
ollama pull llama3.2
ollama pull deepseek-r1:8b
```

### Verificar que Ollama esté corriendo
```bash
curl http://172.17.100.45:11434/api/tags
```

## 🐛 Troubleshooting

### Error: "No se pudo conectar con Ollama"

1. Verifica que Ollama esté ejecutándose:
```bash
# En el servidor Ollama
netstat -tuln | grep 11434
```

2. Verifica la configuración del host:
```bash
# Debe estar escuchando en 0.0.0.0:11434
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

3. Verifica el firewall:
```bash
# Permitir puerto 11434
sudo ufw allow 11434/tcp
```

### Error: "No se pudo parsear la respuesta de IA"

- Intenta usar el modelo `llama3.2` en lugar de `deepseek-r1:8b`
- Verifica que el modelo esté correctamente instalado: `ollama list`

### Error: "Query no permitida"

- El sistema solo permite queries SELECT por seguridad
- Verifica que tu pregunta no involucre modificaciones de datos

## 📊 Monitoreo

Todas las consultas se registran en la consola del servidor:

```
[Chat Legal] Usuario: user_xxx, Modelo: llama3.2, Pregunta: ¿Cuántas causas hay?
[Chat Legal] Query exitoso. Resultados: 1245
```

## 🔄 Actualizaciones futuras

- [ ] Caché de consultas frecuentes
- [ ] Exportación de resultados a Excel/PDF
- [ ] Visualizaciones gráficas de resultados
- [ ] Sugerencias automáticas de preguntas
- [ ] Historial persistente de conversaciones
- [ ] Integración con WhatsApp para notificaciones

## 📝 Notas importantes

- Los modelos de IA son locales, no envían datos a servicios externos
- El sistema respeta la privacidad de los datos del Ministerio Público
- Las consultas son solo lectura (SELECT), no modifican datos
- El servidor Ollama debe estar siempre disponible para que funcione

## 🆘 Soporte

Si encuentras problemas o tienes preguntas, revisa:

1. Los logs del servidor Next.js
2. Los logs del servidor Ollama
3. La consola del navegador (F12)
4. El script de prueba: `node test-ollama.js`
