import { babel } from '@rollup/plugin-babel'

const buildDir = 'dist'

const modules = ['server', 'swetch', 'axiosInterceptor']
const formats = [{ format: 'esm', extension: 'mjs' }, { format: 'cjs' }]

const config = formats.flatMap(({ format, extension = format }) =>
  modules.map(moduleName => ({
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
    plugins: [
      babel({
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env'],
      }),
    ],
    input: `src/lib/${moduleName}.mjs`,
    output: {
      file: `${buildDir}/${format}/${moduleName}.${extension}`,
      format,
      exports: 'named',
    },
  }))
)

export default config
