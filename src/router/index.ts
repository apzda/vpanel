import { ref } from 'vue'
import { createRouter, createWebHistory, type LocationQueryValue, type NavigationGuardNext } from 'vue-router'

import { TreeMgr } from '@/utils'
import { notify } from '@/utils/msgbox'
import { ts, tsc } from '@/utils/i18n'
import settings from '@/config/settings'

import useAppStore from '@/stores/app'
import { permit, user } from '@/stores/user'
import type { Route } from '@/@types'

// all routers
const routers = import.meta.glob('@/modules/**/router.ts', { eager: true, import: 'default' })

export const routerMgr = new TreeMgr<Route>('path', '/')

for (const m in routers) {
  routerMgr.add(routers[m] as Route[])
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routerMgr.nodes
})

const isLoading = ref<boolean>(false)
// const { isLoading } = useNProgress(0.1, {
//   showSpinner: false
// })

const fromArg = settings.fromArg || 'from'

export const sortRoute = (a: Route, b: Route): number => {
  const s1 = typeof a.sort == 'function' ? a.sort({ data: a, t: ts }) : a.sort == undefined ? 9999 : a.sort
  const s2 = typeof b.sort == 'function' ? b.sort({ data: b, t: ts }) : b.sort == undefined ? 9999 : b.sort
  return s1 - s2
}

export const gotoPage = (
  page: string,
  from?: string | LocationQueryValue[],
  next?: NavigationGuardNext
): boolean | void => {
  console.debug('gotoPage', page)
  const pageUrl = settings[page] || null
  from = from === settings.loginUrl ? '/' : from
  if (pageUrl?.match(/^https?:\/\/.+/)) {
    window.location.href = pageUrl + `?${fromArg}=` + encodeURI(location.href)
    isLoading.value = false
    return false
  } else if (pageUrl && pageUrl != location.pathname) {
    from = from || location.pathname + location.search
    if (next) {
      // console.debug('跳转到登录页: ' + settings.loginUrl)
      return next({
        path: settings.loginUrl,
        query: from === '/' ? {} : { [fromArg]: from }
      })
    } else {
      router
        .push({
          path: pageUrl,
          query: from === '/' ? {} : { [fromArg]: from }
        })
        .then(() => {})
    }
  } else if (pageUrl == location.pathname) {
    isLoading.value = false
  }
  return false
}

export const gotoLoginPage = (url?: string, next?: NavigationGuardNext): boolean | void => {
  return gotoPage('loginUrl', url, next)
}

export const currentPage = ref<string>('/')

router.beforeEach((to, from, next) => {
  isLoading.value = true
  // @ts-ignore
  const t = window.i18n.t as (str: string) => string
  if (
    to.meta?.login === false ||
    // @ts-ignore
    to.login === false ||
    !settings.loginUrl ||
    settings.whiteList.indexOf(to.path) !== -1
  ) {
    next()
  } else if (user.value.login) {
    if (user.value.credentialsExpired && settings.resetPwdUrl) {
      return gotoPage('resetPwdUrl', to.path)
    } else if (user.value.locked && settings.activeUrl) {
      return gotoPage('activeUrl', to.path)
    } else if (user.value.mfa == 'UNSET' && settings.mfaSetupUrl) {
      return gotoPage('mfaSetupUrl', to.path)
    } else if (user.value.mfa == 'PENDING' && settings.mfaVerifyUrl) {
      return gotoPage('mfaVerifyUrl', to.path)
    }
    //@ts-ignore
    if (permit(to.roles, to.authorities)) {
      next()
    } else {
      notify({ title: t('network.403'), message: t('alert.error'), type: 'error' })
      next({ ...from })
    }
  } else {
    return gotoLoginPage(to.path, next)
  }
})

router.afterEach((to, from, failure) => {
  if (!failure) {
    currentPage.value = to.path
    showSucProgress()
    if (to.meta && (to.meta.title || to.meta.name)) {
      const { setAppTitle } = useAppStore()
      //@ts-ignore
      setAppTitle(tsc(to.meta.title || to.meta.name, to))
    }
  } else {
    showErrorProgress()
  }
  hideProgress()
})

router.onError((err: Error) => {
  console.error('Router Error:', err)
  hideProgress()
})

const htmlTag = document?.getElementsByTagName('html')[0]
const showSucProgress = () => {
  if (htmlTag) {
    htmlTag.classList.add('rt-suc')
  }
}

const showErrorProgress = () => {
  if (htmlTag) {
    htmlTag.classList.add('rt-err')
  }
}

const hideProgress = () => {
  isLoading.value = false
  setTimeout(() => {
    if (htmlTag) {
      htmlTag.classList.remove('rt-err', 'rt-suc')
    }
  }, 300)
}

export default router
