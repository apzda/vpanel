import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// import AutoImport from 'unplugin-auto-import/vite'
// import Components from 'unplugin-vue-components/vite'
// import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import ElementPlus from 'unplugin-element-plus/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    /*AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: 'sass'
        })
      ]
    }),*/
    ElementPlus({
      useSource: true
    })
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
        additionalData: `@use "@/styles/element/index.scss" as *;`
      }
    }
  },
  server: {
    proxy: {
      '/data': {
        target: '/data.json',
        selfHandleResponse: true,
        configure(proxy) {
          proxy.on('start', (req, res) => {
            if (req.headers.authorization == 'Bearer 121212') {
              res.statusCode = 401
            } else {
              res.writeHead(200, 'OK', { 'content-type': 'application/json' })
              res.write('{"errCode":0,"data":{"id":888}}')
            }
            res.end()
          })
        }
      },
      '/refresh-token': {
        target: '/refresh',
        selfHandleResponse: true,
        bypass(req, res) {
          res.writeHead(401)
          res.end()
        }
      }
    }
  }
})
