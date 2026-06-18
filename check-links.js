const fs = require('fs');
const path = require('path');

// Define a raiz do projeto
const rootDir = path.resolve(__dirname);

/**
 * Encontra recursivamente todos os arquivos HTML
 */
function getAllHtmlFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') getAllHtmlFiles(fullPath, files);
    } else if (fullPath.endsWith('.html')) {
      files.push(fullPath);
    }
  });
  return files;
}

const htmlFiles = getAllHtmlFiles(rootDir);
let brokenLinksCount = 0;

console.log(`--- Verificando links em ${htmlFiles.length} arquivos ---\n`);

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const fileDir = path.dirname(file);
  
  // Procura por src="..." e href="..." (ignora links externos e âncoras)
  const regex = /(?:src|href)="([^"#:?]+)"/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const link = match[1];
    
    // Ignora links externos, protocolos especiais, variáveis de template JS ${...} e placeholders
    if (link.startsWith('http') || link.startsWith('//') || 
        link.startsWith('mailto:') || link.startsWith('tel:') ||
        link.includes('${') || 
        link.includes('[') || // Ignora qualquer placeholder entre colchetes
        link.includes('[') // Ignora qualquer placeholder entre colchetes
       ) continue;
    
    const absolutePath = path.resolve(fileDir, link);
    if (!fs.existsSync(absolutePath)) {
      console.error(`❌ ERRO em [${path.relative(rootDir, file)}]: "${link}" não encontrado.`);
      brokenLinksCount++;
    }
  }
});

if (brokenLinksCount > 0) {
  console.error(`\n--- Falha: ${brokenLinksCount} links quebrados encontrados. ---`);
  process.exit(1); // Encerra com erro para bloquear o push
} else {
  console.log('\n--- Sucesso: Todos os links estão íntegros! ---');
  process.exit(0);
}