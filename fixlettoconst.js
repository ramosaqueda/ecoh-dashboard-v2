const fs = require('fs');
const path = require('path');

class LetToConstFixer {
  constructor() {
    this.processedFiles = 0;
    this.changesCount = 0;
    this.extensions = ['.ts', '.tsx', '.js', '.jsx'];
  }

  // Buscar archivos TypeScript/JavaScript
  findFiles(dir = './app', excludeDirs = ['node_modules', '.next', '.git']) {
    const files = [];
    const extensions = this.extensions; // ✅ Capturar la referencia
    
    const scan = (currentDir) => { // ✅ Arrow function para mantener contexto
      if (!fs.existsSync(currentDir)) return;
      
      const items = fs.readdirSync(currentDir);
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!excludeDirs.includes(item)) {
            scan(fullPath);
          }
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (extensions.includes(ext)) { // ✅ Usar la variable capturada
            files.push(fullPath);
          }
        }
      }
    };
    
    scan(dir);
    return files;
  }

  // Analizar si una variable declarada con let se reasigna
  isVariableReassigned(content, varName, declarationIndex) {
    // Buscar reasignaciones después de la declaración
    const afterDeclaration = content.slice(declarationIndex);
    
    // Patrones que indican reasignación
    const reassignmentPatterns = [
      new RegExp(`\\b${varName}\\s*=\\s*[^=]`, 'g'), // variable = algo (no ==)
      new RegExp(`\\b${varName}\\+\\+`, 'g'),        // variable++
      new RegExp(`\\+\\+${varName}\\b`, 'g'),        // ++variable
      new RegExp(`\\b${varName}--`, 'g'),            // variable--
      new RegExp(`--${varName}\\b`, 'g'),            // --variable
      new RegExp(`\\b${varName}\\s*\\+=`, 'g'),      // variable +=
      new RegExp(`\\b${varName}\\s*-=`, 'g'),        // variable -=
      new RegExp(`\\b${varName}\\s*\\*=`, 'g'),      // variable *=
      new RegExp(`\\b${varName}\\s*\\/=`, 'g'),      // variable /=
    ];
    
    return reassignmentPatterns.some(pattern => {
      pattern.lastIndex = 0; // Reset regex
      return pattern.test(afterDeclaration);
    });
  }

  // Procesar un archivo
  processFile(filePath) {
    console.log(`📝 Procesando: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fileChanges = 0;
    
    // Crear backup
    fs.writeFileSync(filePath + '.backup', content);
    
    // Buscar declaraciones let
    const letPattern = /\blet\s+([a-zA-Z_$][\w$]*)\s*(?::\s*[^=]+)?\s*=\s*([^;]+);?/g;
    let match;
    const replacements = [];
    
    while ((match = letPattern.exec(content)) !== null) {
      const fullMatch = match[0];
      const varName = match[1];
      const declarationIndex = match.index;
      
      // Verificar si la variable se reasigna
      if (!this.isVariableReassigned(content, varName, declarationIndex)) {
        replacements.push({
          original: fullMatch,
          replacement: fullMatch.replace(/\blet\b/, 'const'),
          index: declarationIndex,
          varName: varName
        });
      }
    }
    
    // Aplicar reemplazos (de atrás hacia adelante para no alterar índices)
    replacements.reverse().forEach(replacement => {
      content = content.slice(0, replacement.index) + 
                replacement.replacement + 
                content.slice(replacement.index + replacement.original.length);
      fileChanges++;
      console.log(`  ✅ ${replacement.varName}: let → const`);
    });
    
    // Guardar archivo modificado
    if (fileChanges > 0) {
      fs.writeFileSync(filePath, content);
      console.log(`  💾 ${fileChanges} cambios aplicados\n`);
      this.changesCount += fileChanges;
    } else {
      // Eliminar backup si no hubo cambios
      fs.unlinkSync(filePath + '.backup');
      console.log(`  ℹ️  Sin cambios necesarios\n`);
    }
    
    this.processedFiles++;
    return fileChanges;
  }

  // Ejecutar el script
  async run() {
    console.log('🚀 Iniciando conversión de let a const...\n');
    
    const files = this.findFiles();
    console.log(`✅ Encontrados ${files.length} archivos para procesar\n`);
    
    for (const file of files) {
      try {
        this.processFile(file);
      } catch (error) {
        console.error(`❌ Error procesando ${file}:`, error.message);
      }
    }
    
    console.log('📊 RESUMEN:');
    console.log(`✅ Archivos procesados: ${this.processedFiles}`);
    console.log(`🔧 Total de cambios: ${this.changesCount}`);
    
    if (this.changesCount > 0) {
      console.log('\n💡 NOTAS:');
      console.log('1. Se crearon archivos .backup para cada archivo modificado');
      console.log('2. Ejecuta "npm run build" para verificar que todo funcione');
      console.log('3. Si algo sale mal, restaura desde los archivos .backup');
      console.log('\n📋 Para restaurar archivos:');
      console.log('find . -name "*.backup" -exec bash -c \'mv "$1" "${1%.backup}"\' _ {} \\;');
    }
    
    console.log('\n🎉 ¡Conversión completada!');
  }
}

// Ejecutar el script
const fixer = new LetToConstFixer();
fixer.run().catch(console.error);