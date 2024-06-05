import { merge } from 'lodash-es'
import type { Ref } from 'vue'
import { useStorage } from '@vueuse/core'
import settings from '@/config/settings'

export interface Msg {
  [key: string]: string | number | Msg
}

const gp = /^\/.+\/(.+)\.json$/

export function loadMessages(messages: Msg) {
  const msgs: Msg = {}
  const paths = Object.keys(messages).sort((a, b) => {
    const af = a.replace(gp, '$1')
    const bf = b.replace(gp, '$1')
    return af === bf ? (a > b ? 1 : -1) : af > bf ? 1 : -1
  })

  for (const path of paths) {
    merge(msgs, messages[path])
  }

  return msgs
}

export const SUPPORT_LOCALES: string[] = Object.keys(settings.languages)

let defaultLang: string = settings.language || navigator.language || 'en'
console.debug('Supported Languages:', SUPPORT_LOCALES)
if (!SUPPORT_LOCALES.includes(defaultLang)) {
  defaultLang = defaultLang.substring(0, 2)
  if (!SUPPORT_LOCALES.includes(defaultLang)) {
    defaultLang = 'en'
  }
}

settings.language = defaultLang

export const language: Ref<string> = useStorage('lang', defaultLang)
