import { config } from '@vue/test-utils'
import { setupI18n, loadLocaleMessages } from '@/i18n'

const i18n = setupI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en'
})

loadLocaleMessages(i18n, 'zh-CN')

config.global.plugins = [i18n]
