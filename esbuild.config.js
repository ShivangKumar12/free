// esbuild.config.js
import { build } from 'esbuild';
import { existsSync } from 'fs';

const entry = 'server/index.ts';

if (!existsSync(entry)) {
  console.error(`❌ Entry file "${entry}" not found.`);
  process.exit(1);
}

build({
  entryPoints: [entry],
  platform: 'node',
  bundle: true,
  format: 'esm',
  outdir: 'dist',
  external: [
    'lightningcss',            // Exclude known native modules
    'sharp',                   // Example of another native package
    'canvas',
    'pkg'                      // Explicitly exclude problematic dynamic imports
  ],
  logLevel: 'info'
}).catch((err) => {
  console.error('❌ esbuild failed:', err);
  process.exit(1);
});
