import type { Plugin } from 'vue'
import { createApp, readonly, ref, watch } from 'vue'
import { createPinia } from 'pinia'

import './styles/main.scss'
import 'nprogress/nprogress.css'

import { language as locale } from '@/utils/lang'
import { loadLocaleMessages, setupI18n } from '@/utils/i18n'
import { LANGUAGE_LOAD_KEY } from '@/@types'
// 配置axios
import '@/utils/axios'

import App from './App.vue'
import router from './router'

const i18n = setupI18n({
  legacy: false,
  locale: locale.value,
  fallbackLocale: 'en',
  silentTranslationWarn: true,
  silentFallbackWarn: true,
  missingWarn: false
})
const languageLoaded = ref(false)

watch(
  locale,
  async (lang) => {
    console.debug('Language switch to:', lang)
    await loadLocaleMessages(i18n, lang, () => {
      languageLoaded.value = true
    })
  },
  { immediate: true }
)

// load custom plugins
const plugins = import.meta.glob('./**/plugins/*.ts', { import: 'default', eager: true })

const app = createApp(App)
app.provide(LANGUAGE_LOAD_KEY, readonly(languageLoaded))
app.use(i18n)
app.use(createPinia())

// install plugins
for (const path in plugins) {
  app.use(plugins[path] as Plugin)
}

app.use(router)
app.mount('#app')
