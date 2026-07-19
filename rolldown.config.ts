import { defineConfig } from 'rolldown'

export default defineConfig({
  input: 'src/app/index.ts',
  output: {
    dir: 'lib',
    entryFileNames: 'index.js',
    format: 'cjs',
    cleanDir: true,
  },
  platform: 'node',
})
