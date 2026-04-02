import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path' // Imports the path module
import { fileURLToPath } from 'url' // Required to define __dirname in ESM

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Now 'path' and '__dirname' are defined and will work
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./src/components/shared"),
    },
  },
})