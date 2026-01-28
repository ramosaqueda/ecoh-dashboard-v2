// Script de prueba para verificar conexión con Ollama
// Ejecutar con: node test-ollama.js

const OLLAMA_URL = 'http://172.17.100.45:11434';

async function testOllamaConnection() {
  console.log('🔍 Probando conexión con Ollama...\n');

  try {
    // 1. Verificar que Ollama esté disponible
    console.log('1️⃣ Verificando disponibilidad de Ollama...');
    const tagsResponse = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!tagsResponse.ok) {
      throw new Error(`Ollama no responde: ${tagsResponse.statusText}`);
    }
    
    const tagsData = await tagsResponse.json();
    console.log('✅ Ollama está disponible');
    console.log(`📦 Modelos instalados: ${tagsData.models.length}`);
    tagsData.models.forEach(model => {
      console.log(`   - ${model.name}`);
    });
    console.log('');

    // 2. Probar generación simple con llama3.2
    console.log('2️⃣ Probando generación con llama3.2...');
    const llamaResponse = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: 'Responde en español: ¿Qué es SQL?',
        stream: false
      })
    });

    if (!llamaResponse.ok) {
      throw new Error(`Error en llama3.2: ${llamaResponse.statusText}`);
    }

    const llamaData = await llamaResponse.json();
    console.log('✅ llama3.2 funciona correctamente');
    console.log(`💬 Respuesta: ${llamaData.response.substring(0, 100)}...`);
    console.log('');

    // 3. Probar generación con formato JSON
    console.log('3️⃣ Probando generación de SQL con formato JSON...');
    const sqlPrompt = `Genera una consulta SQL para PostgreSQL que cuente el total de registros en la tabla "Causa".

Responde SOLO con un objeto JSON válido (sin markdown, sin backticks) con esta estructura:
{
  "query": "SELECT ...",
  "explanation": "Explicación breve"
}`;

    const jsonResponse = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: sqlPrompt,
        stream: false,
        format: 'json',
        options: {
          temperature: 0.1
        }
      })
    });

    if (!jsonResponse.ok) {
      throw new Error(`Error en generación JSON: ${jsonResponse.statusText}`);
    }

    const jsonData = await jsonResponse.json();
    const parsedResponse = JSON.parse(jsonData.response);
    
    console.log('✅ Generación de SQL funciona');
    console.log(`📝 Query generada: ${parsedResponse.query}`);
    console.log(`💡 Explicación: ${parsedResponse.explanation}`);
    console.log('');

    // 4. Probar DeepSeek R1
    console.log('4️⃣ Probando DeepSeek R1 8B...');
    const deepseekResponse = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-r1:8b',
        prompt: 'Responde en español: Explica brevemente qué es una base de datos relacional.',
        stream: false
      })
    });

    if (!deepseekResponse.ok) {
      throw new Error(`Error en deepseek-r1: ${deepseekResponse.statusText}`);
    }

    const deepseekData = await deepseekResponse.json();
    console.log('✅ DeepSeek R1 funciona correctamente');
    console.log(`💬 Respuesta: ${deepseekData.response.substring(0, 100)}...`);
    console.log('');

    console.log('🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('✅ El sistema está listo para usar');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    console.error('');
    console.error('Posibles soluciones:');
    console.error('1. Verificar que Ollama esté ejecutándose en el servidor');
    console.error('2. Verificar la URL: http://172.17.100.45:11434');
    console.error('3. Verificar que los modelos estén instalados (ollama list)');
    console.error('4. Verificar configuración de firewall/red');
  }
}

testOllamaConnection();
