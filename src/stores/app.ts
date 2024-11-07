import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { name, version } from './../../package.json'
import { useDark, useStorage, useTitle, useToggle } from '@vueuse/core'

const storagePrefix = name || ''
export const useAppStore = defineStore(storagePrefix + '::application', () => {
  const title = ref('Dashboard')

  const appTitle = computed(
    () => title.value + ' - ' + import.meta.env.VITE_APP_NAME + ' [' + version + ']'
  )

  function setAppTitle(titleStr: string) {
    title.value = titleStr
  }

  useTitle(appTitle)

  const isDark = useDark({
    storageKey: storagePrefix + '::theme'
  })
  const toggleDark = useToggle(isDark)

  const appCfg = useStorage<{
    [key: string]: any
    asideExpand: boolean
  }>(storagePrefix + '::appData', {
    asideExpand: true,
    path: '/'
  }, localStorage, {
    mergeDefaults: true
  })

  return { appTitle, setAppTitle, title, isDark, toggleDark, appCfg }
})
