import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import replace from '@rollup/plugin-replace'
import dotenv from 'dotenv'

dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [replace({
    'process.env.VITE_AIRTABLE_API_KEY': JSON.stringify(process.env.VITE_AIRTABLE_API_KEY),
    'process.env.VITE_AIRTABLE_BASE_ID': JSON.stringify(process.env.VITE_AIRTABLE_BASE_ID),
  }),react()],
})
