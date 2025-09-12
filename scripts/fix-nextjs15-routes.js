const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Corrigiendo rutas dinámicas para Next.js 15...\n');

// Buscar todos los archivos route.ts en carpetas con corchetes
function findDynamicRoutes(dir = './app/api') {
  const routes = [];
  
  function scan(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    
    const items = fs.readdirSync(currentDir);
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        // Buscar route.ts en cualquier directorio
        const routeFile = path.join(fullPath, 'route.ts');
        if (fs.existsSync(routeFile)) {
          // Extraer todos los parámetros dinámicos de la ruta
          const routePath = path.relative('./app/api', fullPath);
          const paramMatches = routePath.match(/\[([^\]]+)\]/g);
          
          if (paramMatches) {
            const params = paramMatches.map(match => match.replace(/[\[\]]/g, ''));
            routes.push({
              file: routeFile,
              params: params,
              path: routePath,
              dir: fullPath
            });
          }
        }
        scan(fullPath);
      }
    }
  }
  
  scan(dir);
  return routes;
}

// Corregir un archivo
function fixFile(filePath, paramNames) {
  console.log(`📝 Corrigiendo: ${filePath} (parámetros: ${paramNames.join(', ')})`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  
  // Crear backup
  fs.writeFileSync(filePath + '.backup', content);
  
  // 1. Corregir tipos de parámetros (manejar múltiples parámetros)
  const paramTypes = paramNames.map(name => `${name}: string`).join('; ');
  const oldParamPattern = new RegExp(`{\\s*params\\s*}:\\s*{\\s*params:\\s*{[^}]+}\\s*}`, 'g');
  
  if (content.match(oldParamPattern)) {
    content = content.replace(oldParamPattern, `{ params }: { params: Promise<{ ${paramTypes} }> }`);
    changes++;
    console.log('  ✅ Tipo de parámetros corregido');
  }
  
  // 2. Corregir interfaces (manejar múltiples parámetros)
  const interfaceParamTypes = paramNames.map(name => `${name}: string`).join('; ');
  const interfacePattern = /interface\s+\w*Props?\s*{\s*params:\s*{[^}]+}\s*;?\s*}/g;
  if (content.match(interfacePattern)) {
    content = content.replace(interfacePattern, (match) => {
      return match.replace(/params:\s*{[^}]+}/, `params: Promise<{ ${interfaceParamTypes} }>`);
    });
    changes++;
    console.log('  ✅ Interface corregida');
  }
  
  // 3. Corregir acceso a parámetros en funciones (manejar múltiples parámetros)
  const methodPattern = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\([^{]+\)\s*{/g;
  let methodMatch;
  
  while ((methodMatch = methodPattern.exec(content)) !== null) {
    const methodStart = methodMatch.index + methodMatch[0].length;
    const methodName = methodMatch[1];
    
    // Buscar si usa params.paramName en esta función
    const funcStart = methodStart;
    let braceCount = 1;
    let funcEnd = funcStart;
    
    for (let i = funcStart; i < content.length && braceCount > 0; i++) {
      if (content[i] === '{') braceCount++;
      if (content[i] === '}') braceCount--;
      funcEnd = i;
    }
    
    const funcContent = content.slice(funcStart, funcEnd);
    
    // Verificar si usa algún parámetro directamente
    let usesDirectParams = false;
    for (const paramName of paramNames) {
      const paramAccess = new RegExp(`params\\.${paramName}`, 'g');
      if (paramAccess.test(funcContent)) {
        usesDirectParams = true;
        break;
      }
    }
    
    if (usesDirectParams) {
      // Agregar await params al inicio de la función
      const tryIndex = funcContent.indexOf('try {');
      if (tryIndex !== -1) {
        const paramDestructure = paramNames.join(', ');
        const awaitLine = `\n    const { ${paramDestructure} } = await params;`;
        const insertPoint = funcStart + tryIndex + 5;
        
        content = content.slice(0, insertPoint) + awaitLine + content.slice(insertPoint);
        
        // Reemplazar todos los params.paramName con paramName
        for (const paramName of paramNames) {
          content = content.replace(new RegExp(`params\\.${paramName}`, 'g'), paramName);
        }
        
        changes++;
        console.log(`  ✅ Método ${methodName} corregido`);
      }
    }
  }
  
  // 4. Corregir auth() si existe
  if (content.includes('const { userId } = auth();')) {
    content = content.replace(/const\s*{\s*userId\s*}\s*=\s*auth\(\);/g, 'const { userId } = await auth();');
    changes++;
    console.log('  ✅ Auth() corregido');
  }
  
  // 5. Corregir importación de Clerk
  if (content.includes("from '@clerk/nextjs'")) {
    content = content.replace("from '@clerk/nextjs'", "from '@clerk/nextjs/server'");
    changes++;
    console.log('  ✅ Import de Clerk corregido');
  }
  
  // 6. Corregir Prisma
  if (content.includes('const prisma = new PrismaClient()')) {
    content = content.replace(
      /import { PrismaClient } from '@prisma\/client';\s*const prisma = new PrismaClient\(\);/g,
      "import { prisma } from '@/lib/prisma';"
    );
    changes++;
    console.log('  ✅ Prisma corregido');
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
const routes = findDynamicRoutes();

if (routes.length === 0) {
  console.log('❌ No se encontraron rutas dinámicas');
  process.exit(0);
}

console.log(`✅ Encontradas ${routes.length} rutas dinámicas:\n`);
routes.forEach(route => {
  console.log(`  📄 ${route.file}`);
  console.log(`     Parámetros: ${route.params.join(', ')}`);
  console.log(`     Ruta: ${route.path}\n`);
});

let totalChanges = 0;
for (const route of routes) {
  const changes = fixFile(route.file, route.params);
  totalChanges += changes;
}

console.log(`🎉 ¡Completado! Total de archivos modificados: ${routes.filter(r => r.changes > 0).length}`);
console.log('💡 Los archivos originales fueron respaldados como .backup');
console.log('🔧 Ejecuta "npm run build" para verificar que todo funcione correctamente');

if (totalChanges > 0) {
  console.log('\n📋 Para restaurar los archivos originales si algo sale mal:');
  console.log('   find ./app/api -name "*.backup" -exec bash -c \'mv "$1" "${1%.backup}"\' _ {} \\;');
}