const fs = require('fs');
const path = require('path');

console.log('🚀 Corrigiendo páginas dinámicas para Next.js 15...\n');

// Buscar todos los archivos page.tsx en carpetas con corchetes
function findDynamicPages(dir = './app') {
  const pages = [];
  
  function scan(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    
    const items = fs.readdirSync(currentDir);
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        // Buscar page.tsx en cualquier directorio
        const pageFile = path.join(fullPath, 'page.tsx');
        if (fs.existsSync(pageFile)) {
          // Extraer todos los parámetros dinámicos de la ruta
          const pagePath = path.relative('./app', fullPath);
          const paramMatches = pagePath.match(/\[([^\]]+)\]/g);
          
          if (paramMatches) {
            const params = paramMatches.map(match => match.replace(/[\[\]]/g, ''));
            pages.push({
              file: pageFile,
              params: params,
              path: pagePath,
              dir: fullPath
            });
          }
        }
        // Continuar escaneando recursivamente, excepto en ciertos directorios
        if (!['node_modules', '.next', 'api'].includes(item)) {
          scan(fullPath);
        }
      }
    }
  }
  
  scan(dir);
  return pages;
}

// Corregir un archivo de página
function fixPageFile(filePath, paramNames) {
  console.log(`📝 Corrigiendo: ${filePath} (parámetros: ${paramNames.join(', ')})`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  
  // Crear backup
  fs.writeFileSync(filePath + '.backup', content);
  
  // 1. Corregir props del componente principal
  const paramTypes = paramNames.map(name => `${name}: string`).join('; ');
  
  // Buscar el componente principal (export default function)
  const componentPattern = /export\s+default\s+function\s+\w+\s*\(\s*{\s*params\s*}\s*:\s*{\s*params:\s*{[^}]+}\s*}\s*\)/g;
  if (content.match(componentPattern)) {
    content = content.replace(componentPattern, (match) => {
      return match.replace(/params:\s*{[^}]+}/, `params: Promise<{ ${paramTypes} }>`);
    });
    changes++;
    console.log('  ✅ Props del componente corregidas');
  }
  
  // 2. Determinar qué patrón usar basado en las importaciones existentes
  const hasUseImport = content.includes('import') && content.includes('use');
  const hasUseEffectImport = content.includes('useEffect') && content.includes('useState');
  
  if (!hasUseImport && !hasUseEffectImport) {
    // Agregar imports necesarios para la versión useState/useEffect
    const importMatch = content.match(/import\s+{[^}]+}\s+from\s+['"]react['"];?/);
    if (importMatch) {
      const currentImports = importMatch[0];
      if (!currentImports.includes('useState')) {
        content = content.replace(currentImports, currentImports.replace('}', ', useState, useEffect }'));
        changes++;
        console.log('  ✅ Imports de React agregados');
      }
    } else {
      // Si no hay imports de React, agregar al inicio
      content = "import { useState, useEffect } from 'react';\n" + content;
      changes++;
      console.log('  ✅ Imports de React agregados');
    }
  }
  
  // 3. Buscar el cuerpo del componente principal y agregar lógica para manejar params
  const functionBodyPattern = /export\s+default\s+function\s+\w+[^{]*{\s*([^]*?)(?=\s*return\s|$)/;
  const functionBodyMatch = content.match(functionBodyPattern);
  
  if (functionBodyMatch) {
    const functionBody = functionBodyMatch[1];
    
    // Verificar si ya usa params directamente
    let usesDirectParams = false;
    for (const paramName of paramNames) {
      if (functionBody.includes(`params.${paramName}`)) {
        usesDirectParams = true;
        break;
      }
    }
    
    if (usesDirectParams) {
      // Agregar lógica para manejar Promise de params
      const stateDeclarations = paramNames.map(name => 
        `const [${name}, set${name.charAt(0).toUpperCase() + name.slice(1)}] = useState<string | null>(null);`
      ).join('\n  ');
      
      const stateUpdates = paramNames.map(name => 
        `set${name.charAt(0).toUpperCase() + name.slice(1)}(resolvedParams.${name});`
      ).join('\n      ');
      
      const paramsLogic = `
  ${stateDeclarations}
  const [isParamsLoaded, setIsParamsLoaded] = useState(false);

  useEffect(() => {
    params.then((resolvedParams) => {
      ${stateUpdates}
      setIsParamsLoaded(true);
    });
  }, [params]);

  if (!isParamsLoaded ${paramNames.map(name => `|| !${name}`).join(' ')}) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }
`;
      
      // Insertar al inicio del cuerpo de la función
      content = content.replace(functionBodyPattern, (match, body) => {
        return match.replace(body, paramsLogic + body);
      });
      
      // Reemplazar params.paramName con paramName
      for (const paramName of paramNames) {
        content = content.replace(new RegExp(`params\\.${paramName}`, 'g'), paramName);
      }
      
      changes++;
      console.log('  ✅ Lógica de params agregada');
    }
  }
  
  // Escribir archivo corregido
  fs.writeFileSync(filePath, content);
  
  if (changes > 0) {
    console.log(`  💾 ${changes} cambios aplicados\n`);
  } else {
    console.log(`  ℹ️  Sin cambios necesarios\n`);
  }
  
  return changes;
}

// Ejecutar
const pages = findDynamicPages();

if (pages.length === 0) {
  console.log('❌ No se encontraron páginas dinámicas');
  process.exit(0);
}

console.log(`✅ Encontradas ${pages.length} páginas dinámicas:\n`);
pages.forEach(page => {
  console.log(`  📄 ${page.file}`);
  console.log(`     Parámetros: ${page.params.join(', ')}`);
  console.log(`     Ruta: ${page.path}\n`);
});

let totalChanges = 0;
for (const page of pages) {
  const changes = fixPageFile(page.file, page.params);
  totalChanges += changes;
}

console.log(`🎉 ¡Completado! Total de páginas modificadas: ${pages.filter(p => p.changes > 0).length}`);
console.log('💡 Los archivos originales fueron respaldados como .backup');
console.log('🔧 Ejecuta "npm run build" para verificar que todo funcione correctamente');

if (totalChanges > 0) {
  console.log('\n📋 Para restaurar los archivos originales si algo sale mal:');
  console.log('   find ./app -name "*.backup" -exec bash -c \'mv "$1" "${1%.backup}"\' _ {} \\;');
}