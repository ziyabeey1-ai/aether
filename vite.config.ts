import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use a workaround to safely get the current working directory while avoiding TS errors
  const currentDir = (process as any).cwd ? (process as any).cwd() : '.';

  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, currentDir, '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(currentDir, "src"),
      },
    },
    define: {
      // Map the Gemini Key specifically to process.env.API_KEY as required by the service
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      // Polyfill process.env for other parts of the app if needed
      'process.env': env
    }
  }
})