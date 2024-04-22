import { nextTick } from 'vue'
import { createI18n, type I18nOptions, type I18n } from 'vue-i18n'
import { language } from '@/utils/lang'

type _I18n = I18n<{}, {}, {}, string, false>

export function setupI18n(options: I18nOptions) {
  const i18n = createI18n(options) as _I18n
  // @ts-ignore
  window.i18n = i18n.global
  setI18nLanguage(i18n, options.locale as string)
  return i18n
}

export function setI18nLanguage(i18n: _I18n, locale: string) {
  language.value = locale
  document.querySelector('html')?.setAttribute('lang', locale)
}

export async function loadLocaleMessages(i18n: _I18n, locale: string, callback?: () => void) {
  // load locale messages with dynamic import
  const messages = await import(`../lang/${locale}.ts`)
  // set locale and locale message
  i18n.global.setLocaleMessage(locale, messages.default)
  i18n.global.locale.value = locale
  console.debug('Language files loaded: ', locale)

  return nextTick(() => {
    if (typeof callback == 'function') {
      callback()
    }
    setI18nLanguage(i18n, locale)
  })
}
