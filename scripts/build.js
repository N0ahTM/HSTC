import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve();
const publicDir = path.join(root, 'public');
const distDir = path.join(root, 'dist');

if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir, { recursive: true });

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

copyRecursive(publicDir, distDir);

console.log('Static assets erfolgreich nach dist kopiert.');
