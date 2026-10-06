// Builds the two bundles Webflow loads:
//   dist/site.min.js + dist/site.min.css             every page
//   dist/resources.min.js + dist/resources.min.css   Resource Library pages only
//
//   npm run build   minified production build (commit dist/ before tagging a release)
//   npm run dev     rebuilds on save and serves dist/ at http://localhost:3000 (see webflow/README.md)

import * as esbuild from 'esbuild';
import { readFileSync } from 'node:fs';

const dev = process.argv.includes('--dev');
const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
const banner = `/* eternity-website v${version} | github.com/vsventuresx/eternity-website */`;

const options = {
  // JS and CSS share an output name; the extension comes from the input type
  entryPoints: [
    { in: 'src/site.js', out: 'site.min' },
    { in: 'src/resources.js', out: 'resources.min' },
    { in: 'src/styles/site.css', out: 'site.min' },
    { in: 'src/styles/resources.css', out: 'resources.min' },
  ],
  outdir: 'dist',
  bundle: true,
  minify: !dev,
  sourcemap: true,
  target: ['es2018', 'chrome90', 'safari14', 'firefox90'],
  format: 'iife',
  banner: { js: banner, css: banner },
  logLevel: 'info',
};

if (dev) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  const { port } = await ctx.serve({ servedir: 'dist', port: 3000 });
  console.log(`\nServing dist/ at http://localhost:${port}  (turn on dev mode in the browser: see webflow/README.md)\n`);
} else {
  await esbuild.build(options);
}
