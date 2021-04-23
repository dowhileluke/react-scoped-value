import { isAbsolute } from 'path'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { babel } from '@rollup/plugin-babel'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

export default {
  input: 'src/scope.js',
  external: id => !id.startsWith('.') && !isAbsolute(id),
  output: [
    {
      file: pkg.module,
      format: 'es',
    },
    {
      file: pkg.main,
      format: 'cjs',
    },
  ],
  plugins: [
    nodeResolve(),
    babel({ babelHelpers: 'bundled' }),
    terser(),
  ],
}
