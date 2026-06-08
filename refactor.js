const fs = require('fs');
const path = require('path');

const API_URL_DECL = "const API_URL = import.meta.env.VITE_API_URL || '';\n";

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('frontend/src', function(filePath) {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    if (content.includes("fetch('/api/") || content.includes("fetch(`/api/")) {
      if (!content.includes("const API_URL")) {
        // Insert after imports
        const lines = content.split('\n');
        let lastImportIdx = -1;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) lastImportIdx = i;
        }
        lines.splice(lastImportIdx + 1, 0, '\n' + API_URL_DECL);
        content = lines.join('\n');
      }

      content = content.replace(/fetch\('\/api\//g, "fetch(API_URL + '/api/");
      content = content.replace(/fetch\(`\/api\//g, "fetch(`${API_URL}/api/");
      
      fs.writeFileSync(filePath, content);
      console.log('Updated: ' + filePath);
    }
  }
});
