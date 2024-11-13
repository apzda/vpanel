import { nextTick } from 'vue'
import { createI18n, type I18n, type I18nOptions } from 'vue-i18n'
import { language } from '@/utils/lang'
import { toArray } from '@/utils/index'

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

export function t(msg: string, args?: any): string {
  //@ts-ignore
  return window.i18n.t(msg, args)
}

export function ts(message: string | string[], defaultString?: string, args?: any): string {
  const texts = toArray(message)
  const text = texts.map(msg => t(msg, args)).join('')

  if (text == message) {
    return defaultString || message
  }
  return text
}

export function tsc<T>(message: string | ((arg: {
  context: T,
  ts: ((text: string, defaultString?: string, args?: any) => string)
}) => string) | null | undefined, context: T): string {
  if (typeof message == 'function') {
    return message({ context, ts })
  } else if (typeof message == 'string' && message.startsWith('{') && message.endsWith('}')) {
    return ts(message.substring(1, message.length - 1))
  } else if (typeof message == 'string') {
    return message
  }

  return String(message)
}