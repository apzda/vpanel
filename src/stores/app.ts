import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { version } from './../../package.json'

import { useTitle, useDark } from '@vueuse/core'

export const useAppStore = defineStore('application', () => {
  const title = ref('Dashboard')

  const appTitle = computed(
    () => title.value + ' | ' + import.meta.env.VITE_APP_NAME + ' [' + version + ']'
  )

  function setAppTitle(titleStr: string) {
    title.value = titleStr
  }

  useTitle(appTitle)

  const isDark = useDark()

  return { appTitle, setAppTitle, title, isDark }
})
