import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgrPlugin from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },
  plugins: [react(), svgrPlugin()],
  server: {
    https: {
      // @ts-ignore
      maxSessionMemory: 100,
    },
  },
  build: {
    target: 'esnext',
  },
})
