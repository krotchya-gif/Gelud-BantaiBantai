import { defineConfig } from 'vite';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';

const engineDirectory = new URL('./public/engine/', import.meta.url);
const engineVersion = createHash('sha256');

for (const name of readdirSync(engineDirectory).filter((file) => file.endsWith('.js')).sort()) {
  engineVersion.update(name);
  engineVersion.update(readFileSync(new URL(name, engineDirectory)));
}

const engineBuildId = engineVersion.digest('hex').slice(0, 12);

export default defineConfig({
  base: './',
  publicDir: 'public',
  define: {
    __ENGINE_BUILD_ID__: JSON.stringify(engineBuildId),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
  },
});
