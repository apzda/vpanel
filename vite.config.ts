import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import ElementPlus from 'unplugin-element-plus/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  console.log('Environment:', env)

  return {
    plugins: [
      vue(),
      // vueJsx(),
      AutoImport({
        // Auto import functions from Vue, e.g. ref, reactive, toRef...
        imports: ['vue'],
        resolvers: [
          // Auto import functions from Element Plus, e.g. ElMessage, ElMessageBox... (with style)
          ElementPlusResolver(),
          // Auto import icon components
          IconsResolver({
            prefix: 'Icon'
          })]
      }),
      Components({
        resolvers: [
          // Auto register icon components
          IconsResolver({
            enabledCollections: ['ep']
          }),
          // Auto register Element Plus components
          ElementPlusResolver()
        ]
      }),
      ElementPlus({}),
      Icons({
        autoInstall: true
      })
      //vueDevTools()
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '~': fileURLToPath(new URL('./src/modules', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `@use "@/styles/element/index.scss" as *;`
        }
      }
    }
  }
})
