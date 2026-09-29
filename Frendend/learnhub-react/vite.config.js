import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/LearnHub-Online-Learning-Platform/',
  plugins: [react()],
})