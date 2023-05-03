import { babel } from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'

const buildDir = 'dist'

const modules = ['server', 'swetch', 'axiosInterceptor']
const formats = [{ format: 'esm', extension: 'mjs' }, { format: 'cjs' }]

const config = formats.flatMap(({ format, extension = format }) =>
  modules.map(
    moduleName =>
      /** @type {import('rollup').RollupOptions} */ ({
        external: [
          'node-fetch',
          'isomorphic-fetch',
          'koa',
          'koa-bodyparser',
          'crypto',
          'fs',
          'path',
          'os',
          'mime-types',
        ],
        plugins: [
          nodeResolve(),
          commonjs(),
          babel({
            babelHelpers: 'runtime',
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime'],
          }),
        ],
        input: `src/lib/${moduleName}.mjs`,
        output: {
          file: `${buildDir}/${format}/${moduleName}.${extension}`,
          format,
          exports: 'named',
          name: 'swetch.bundle',
        },
      })
  )
)

export default config
