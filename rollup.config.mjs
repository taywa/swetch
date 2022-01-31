import path from 'path'
import { babel } from '@rollup/plugin-babel'

const outputDir = 'dist'

export default {
  external: [
    'node-fetch',
    'isomorphic-fetch',
    'koa',
    'koa-bodyparser',
    'crypto',
    'fs',
    'path',
    'os',
  ],
  input: [
    'src/lib/server.mjs',
    'src/lib/swetch.mjs',
    'src/lib/axiosInterceptor.mjs',
  ],
  output: [
    {
      dir: 'esmodules',
      format: 'esm',
    },
    {
      dir: 'commonjs',
      format: 'cjs',
    },
  ].map(({ dir, ...output }) => ({
    ...output,
    exports: 'named',
    dir: path.join(outputDir, dir),
  })),
  plugins: [babel({ babelHelpers: 'bundled', presets: ['@babel/preset-env'] })],
}
