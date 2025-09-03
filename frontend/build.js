const esbuild = require('esbuild');
const { copy } = require('esbuild-plugin-copy');

esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  minify: true,
  sourcemap: true,
  outfile: 'public/bundle.js',
  loader: { 
    '.js': 'jsx',
    '.png': 'file',
    '.jpg': 'file',
    '.svg': 'file',
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.REACT_APP_API_URL': '"http://localhost:5000"'
  },
  plugins: [
    copy({
      assets: {
        from: ['public/*'],
        to: ['../dist'],
      },
    }),
  ],
}).catch(() => process.exit(1));