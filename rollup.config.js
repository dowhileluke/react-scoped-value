import { isAbsolute } from 'path'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { babel } from '@rollup/plugin-babel'

export default {
  input: 'src/slice.js',
  external: id => !id.startsWith('.') && !isAbsolute(id),
  output: [
    {
      file: 'dist/index.js',
      format: 'es',
    },
    {
      file: 'dist/index.cjs',
      format: 'cjs',
    },
  ],
  plugins: [
    nodeResolve(),
    babel({ babelHelpers: 'bundled' }),
  ],
}
