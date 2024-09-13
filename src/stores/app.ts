import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { version } from './../../package.json'

import { useDark, useStorage, useTitle, useToggle } from '@vueuse/core'

export const useAppStore = defineStore('application', () => {
  const title = ref('Dashboard')

  const appTitle = computed(
    () => title.value + ' - ' + import.meta.env.VITE_APP_NAME + ' [' + version + ']'
  )

  function setAppTitle(titleStr: string) {
    title.value = titleStr
  }

  useTitle(appTitle)

  const isDark = useDark()
  const toggleDark = useToggle(isDark)

  const appCfg = useStorage<{
    [key: string]: any
    asideExpand: boolean
  }>('appdata', {
    asideExpand: true
  }, localStorage, {
    mergeDefaults: true
  })

  return { appTitle, setAppTitle, title, isDark, toggleDark, appCfg }
})
