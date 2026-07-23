import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pagesではプロジェクトページ(https://<user>.github.io/StageOrderSys/)
  // としてサブパス配信になるため、アセットの参照パスをそれに合わせる。
  base: '/StageOrderSys/',
  plugins: [react()],
})
