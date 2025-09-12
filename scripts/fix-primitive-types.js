const fs = require('fs');
const path = require('path');

class PrimitiveTypesFixer {
  constructor() {
    this.processedFiles = 0;
    this.changesCount = 0;
    this.extensions = ['.ts', '.tsx', '.js', '.jsx'];
    
    // Mapeo de tipos objeto a tipos primitivos
    this.typeReplacements = [
      { from: /\bString\b/g, to: 'string', name: 'String → string' },
      { from: /\bNumber\b/g, to: 'number', name: 'Number → number' },
      { from: /\bBoolean\b/g, to: 'boolean', name: 'Boolean → boolean' },
      { from: /\bObject\b/g, to: 'object', name: 'Object → object' },
      // Casos específicos en interfaces/types
      { from: /:\s*String\s*([;,\}])/g, to: ': string$1', name: 'Interface String → string' },
      { from: /:\s*Number\s*([;,\}])/g, to: ': number$1', name: 'Interface Number → number' },
      { from: /:\s*Boolean\s*([;,\}])/g, to: ': boolean$1', name: 'Interface Boolean → boolean' },
    ];
  }

  // Buscar archivos TypeScript/JavaScript
  findFiles(dir = './app', excludeDirs = ['node_modules', '.next', '.git']) {
    const files = [];
    const extensions = this.extensions;
    
    const scan = (currentDir) => {
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
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    };
    
    scan(dir);
    return files;
  }

  // Verificar si el reemplazo debe evitarse en ciertos contextos
  shouldSkipReplacement(content, matchIndex, matchText) {
    // Evitar reemplazar en comentarios
    const beforeMatch = content.slice(0, matchIndex);
    const lines = beforeMatch.split('\n');
    const currentLine = lines[lines.length - 1];
    
    // Si está en un comentario de línea
    if (currentLine.includes('//')) {
      return true;
    }
    
    // Si está en un bloque de comentario
    const commentStart = content.lastIndexOf('/*', matchIndex);
    const commentEnd = content.lastIndexOf('*/', matchIndex);
    if (commentStart > commentEnd && commentStart !== -1) {
      return true;
    }
    
    // Evitar reemplazar en strings/templates
    const beforeString = content.slice(Math.max(0, matchIndex - 50), matchIndex);
    const afterString = content.slice(matchIndex, matchIndex + 50);
    
    if (beforeString.includes('"') || beforeString.includes("'") || 
        beforeString.includes('`') || afterString.includes('"') || 
        afterString.includes("'") || afterString.includes('`')) {
      // Verificar si estamos dentro de una string
      const quotes = (beforeString.match(/["'`]/g) || []).length;
      if (quotes % 2 !== 0) {
        return true;
      }
    }
    
    return false;
  }

  // Procesar un archivo
  processFile(filePath) {
    console.log(`📝 Procesando: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fileChanges = 0;
    let changeLog = [];
    
    // Crear backup
    fs.writeFileSync(filePath + '.backup', content);
    
    // Aplicar reemplazos
    this.typeReplacements.forEach(replacement => {
      let match;
      let matchCount = 0;
      
      // Reset regex
      replacement.from.lastIndex = 0;
      
      while ((match = replacement.from.exec(content)) !== null) {
        const matchIndex = match.index;
        const matchText = match[0];
        
        // Verificar si debemos evitar este reemplazo
        if (!this.shouldSkipReplacement(content, matchIndex, matchText)) {
          matchCount++;
        }
        
        // Evitar loop infinito con regex global
        if (replacement.from.global && replacement.from.lastIndex === match.index) {
          break;
        }
      }
      
      if (matchCount > 0) {
        // Reset regex y aplicar reemplazo
        replacement.from.lastIndex = 0;
        const newContent = content.replace(replacement.from, replacement.to);
        
        if (newContent !== content) {
          content = newContent;
          fileChanges += matchCount;
          changeLog.push(`  ✅ ${replacement.name}: ${matchCount} cambio(s)`);
        }
      }
    });
    
    // Guardar archivo modificado
    if (fileChanges > 0) {
      fs.writeFileSync(filePath, content);
      changeLog.forEach(log => console.log(log));
      console.log(`  💾 ${fileChanges} cambios totales aplicados\n`);
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
    console.log('🚀 Iniciando corrección de tipos primitivos...\n');
    console.log('📋 Conversiones que se aplicarán:');
    this.typeReplacements.forEach(replacement => {
      console.log(`   • ${replacement.name}`);
    });
    console.log('');
    
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
      console.log('3. Revisa los cambios con "git diff" antes de hacer commit');
      console.log('4. Si algo sale mal, restaura desde los archivos .backup');
      console.log('\n📋 Para restaurar archivos:');
      console.log('find . -name "*.backup" -exec bash -c \'mv "$1" "${1%.backup}"\' _ {} \\;');
      console.log('\n📋 Para eliminar backups después de verificar:');
      console.log('find . -name "*.backup" -delete');
    }
    
    console.log('\n🎉 ¡Corrección de tipos primitivos completada!');
  }
}

// Ejecutar el script
const fixer = new PrimitiveTypesFixer();
fixer.run().catch(console.error);