import { config } from '@vue/test-utils'
import { setupI18n, loadLocaleMessages } from '@/i18n'

const i18n = setupI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en'
})

loadLocaleMessages(i18n, 'zh-CN')

config.global.plugins = [i18n]

const plugins = import.meta.glob('./**/plugins/*.ts', { import: 'default', eager: true })

// install plugins
for (const path in plugins) {
  config.global.plugins.push(plugins[path])
}
