import type { Plugin } from 'vue'
import { createApp, watch, nextTick } from 'vue'
import { createPinia } from 'pinia'

import './styles/main.scss'
import 'nprogress/nprogress.css'

import { language as locale } from './utils/lang'
import { setupI18n, loadLocaleMessages, setI18nLanguage } from './i18n'

const i18n = setupI18n({
  legacy: false,
  locale: locale.value,
  fallbackLocale: 'en'
})

watch(
  locale,
  async (lang) => {
    console.debug('current language: ', lang)
    await loadLocaleMessages(i18n, lang)
    nextTick()
    setI18nLanguage(i18n, lang)
  },
  { immediate: true }
)

// 配置axios
import './utils/axios'

import App from './App.vue'
import router from './router'

// load custom plugins
const plugins = import.meta.glob('./**/plugins/*.ts', { import: 'default', eager: true })

const app = createApp(App)
app.use(i18n)
app.use(createPinia())

// install plugins
for (const path in plugins) {
  app.use(plugins[path] as Plugin)
}

app.use(router)
app.mount('#app')
