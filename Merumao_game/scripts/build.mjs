// Build: esbuild bundles src → dist/app.js + app.css; copies index.html and public/assets.
import { build, context } from 'esbuild';
import { cpSync, mkdirSync, rmSync, copyFileSync } from 'node:fs';
const watch = process.argv.includes('--watch');
rmSync('dist', { recursive: true, force: true }); mkdirSync('dist', { recursive: true });
const opts = { entryPoints: { app: 'src/main.tsx' }, bundle: true, outdir: 'dist', format: 'esm', jsx: 'automatic', minify: !watch, sourcemap: watch,
  target: ['es2020'], define: { 'process.env.NODE_ENV': watch ? '"development"' : '"production"' }, loader: { '.json': 'json' }, logLevel: 'info' };
copyFileSync('index.html', 'dist/index.html'); copyFileSync('artifact.html', 'dist/merumao.html');
cpSync('public/assets', 'dist/assets', { recursive: true, filter: s => !s.endsWith('manifest.json') });
if (watch) { const c = await context(opts); await c.watch(); } else await build(opts);
