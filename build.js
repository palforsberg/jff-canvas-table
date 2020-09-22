const { build } = require('esbuild')

build({
  entryPoints: ['./src/main.js'],
  outfile: './lib/index.js',
  minify: true,
  bundle: true,
  platform: 'node',
}).catch(() => process.exit(1))