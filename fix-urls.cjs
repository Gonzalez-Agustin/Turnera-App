const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('d:/TurneraApp/src');
const BAD_STR1 = '`${import.meta.env.VITE_API_URL || "http://localhost:3001"}`';

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Undo the mess completely
  // What did I run? 
  // (Get-Content $file.FullName) -replace 'http://localhost:3001', '`${import.meta.env.VITE_API_URL || "http://localhost:3001"}`'
  // So 'http://localhost:3001' became '`${import.meta.env.VITE_API_URL || "http://localhost:3001"}`'
  
  // So if it was: fetch('http://localhost:3001/api')
  // It became: fetch('`${import.meta.env.VITE_API_URL || "http://localhost:3001"}`/api')
  
  // We want to turn: '`${import.meta.env.VITE_API_URL || "http://localhost:3001"}`/api'
  // into: `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api`
  
  content = content.replaceAll(/\'`\$\{import\.meta\.env\.VITE_API_URL \|\| "http:\/\/localhost:3001"\}`(.*?)'/g, '`${import.meta.env.VITE_API_URL || "http://localhost:3001"}$1`');
  
  content = content.replaceAll(/\"`\$\{import\.meta\.env\.VITE_API_URL \|\| "http:\/\/localhost:3001"\}`(.*?)\"/g, '`${import.meta.env.VITE_API_URL || "http://localhost:3001"}$1`');
  
  content = content.replaceAll(/``\$\{import\.meta\.env\.VITE_API_URL \|\| "http:\/\/localhost:3001"\}`(.*?)`/g, '`${import.meta.env.VITE_API_URL || "http://localhost:3001"}$1`');

  fs.writeFileSync(file, content);
});

console.log('Done');
