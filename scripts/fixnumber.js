const fs = require('fs');
const path = require('path');

class NumberFunctionFixer {
  constructor() {
    this.processedFiles = 0;
    this.changesCount = 0;
    this.extensions = ['.ts', '.tsx', '.js', '.jsx'];
    
    // Patrones específicos para number() -> Number()
    this.patterns = [
      {
        regex: /\bnumber\s*\(\s*([^)]+)\s*\)/g,
        replacement: 'Number($1)',
        description: 'number(variable) → Number(variable)'
      },
      // Casos específicos comunes en Prisma
      {
        regex: /where:\s*{\s*id:\s*number\s*\(\s*([^)]+)\s*\)\s*}/g,
        replacement: 'where: { id: Number($1) }',
        description: 'Prisma where clause fix'
      },
      // Casos en parseInt mal escrito
      {
        regex: /parseInt\s*\(\s*number\s*\(\s*([^)]+)\s*\)\s*\)/g,
        replacement: 'parseInt($1, 10)',
        description: 'parseInt(number(x)) → parseInt(x, 10)'
      }
    ];
  }

  // Buscar archivos TypeScript/JavaScript
  findFiles(dir = './app', excludeDirs = ['node_modules', '.next', '.git', 'dist', 'build']) {
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

  // Verificar si el archivo contiene el patrón problemático
  hasNumberFunction(content) {
    return /\bnumber\s*\(/g.test(content);
  }

  // Procesar un archivo
  processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar si el archivo tiene el problema
    if (!this.hasNumberFunction(content)) {
      return 0; // No hay cambios necesarios
    }
    
    console.log(`📝 Procesando: ${filePath}`);
    
    let fileChanges = 0;
    let changeLog = [];
    
    // Crear backup
    fs.writeFileSync(filePath + '.backup', content);
    
    // Aplicar cada patrón
    this.patterns.forEach(pattern => {
      const originalContent = content;
      let matchCount = 0;
      
      // Contar coincidencias
      const matches = content.match(pattern.regex);
      if (matches) {
        matchCount = matches.length;
      }
      
      // Aplicar reemplazo
      content = content.replace(pattern.regex, pattern.replacement);
      
      if (content !== originalContent && matchCount > 0) {
        fileChanges += matchCount;
        changeLog.push(`  ✅ ${pattern.description}: ${matchCount} cambio(s)`);
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

  // Buscar archivos que contienen el problema
  findProblematicFiles() {
    console.log('🔍 Buscando archivos con number() function...\n');
    
    const allFiles = this.findFiles();
    const problematicFiles = [];
    
    allFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (this.hasNumberFunction(content)) {
          problematicFiles.push(file);
        }
      } catch (error) {
        console.error(`❌ Error leyendo ${file}:`, error.message);
      }
    });
    
    return problematicFiles;
  }

  // Ejecutar el script
  async run() {
    console.log('🚀 Iniciando corrección de number() → Number()...\n');
    
    // Primero buscar archivos problemáticos
    const problematicFiles = this.findProblematicFiles();
    
    if (problematicFiles.length === 0) {
      console.log('✅ No se encontraron archivos con number() function');
      return;
    }
    
    console.log(`📋 Encontrados ${problematicFiles.length} archivos con number() function:`);
    problematicFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });
    console.log('');
    
    // Mostrar patrones que se aplicarán
    console.log('🔧 Patrones de corrección:');
    this.patterns.forEach(pattern => {
      console.log(`   • ${pattern.description}`);
    });
    console.log('');
    
    // Procesar archivos
    console.log('📝 Iniciando procesamiento...\n');
    
    for (const file of problematicFiles) {
      try {
        this.processFile(file);
      } catch (error) {
        console.error(`❌ Error procesando ${file}:`, error.message);
      }
    }
    
    // Resumen final
    console.log('📊 RESUMEN FINAL:');
    console.log(`✅ Archivos procesados: ${this.processedFiles}`);
    console.log(`🔧 Total de cambios: ${this.changesCount}`);
    console.log(`📁 Archivos con problemas encontrados: ${problematicFiles.length}`);
    
    if (this.changesCount > 0) {
      console.log('\n💡 PRÓXIMOS PASOS:');
      console.log('1. 🧪 Ejecuta "npm run build" para verificar que no hay errores');
      console.log('2. 🔍 Revisa algunos cambios con "git diff"');
      console.log('3. 🧹 Si todo está bien, elimina los backups:');
      console.log('   find . -name "*.backup" -delete');
      console.log('4. 🔄 Si algo sale mal, restaura desde backups:');
      console.log('   find . -name "*.backup" -exec bash -c \'mv "$1" "${1%.backup}"\' _ {} \\;');
      
      console.log('\n📋 VERIFICACIÓN RÁPIDA:');
      console.log('Buscar si quedan problemas:');
      console.log('grep -r "number(" --include="*.ts" --include="*.tsx" ./app | head -5');
    }
    
    console.log('\n🎉 ¡Corrección masiva completada!');
  }
}

// Ejecutar el script
const fixer = new NumberFunctionFixer();
fixer.run().catch(console.error);