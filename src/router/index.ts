import { createRouter, createWebHistory, type NavigationGuardNext } from 'vue-router'
import { useNProgress } from '@vueuse/integrations/useNProgress'

import { TreeMgr } from '@/utils'
import { notify } from '@/utils/msgbox'
import settings from '@/config/settings'

import { useAppStore } from '@/stores/app'
import { hasAuthority, hasRole, user } from '@/stores/user'
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

const { isLoading } = useNProgress(0.3, {
  showSpinner: false
})

const fromArg = settings.fromArg || 'from'

export const gotoPage = (page: string, from?: string, next?: NavigationGuardNext): boolean | void => {
  const pageUrl = settings[page] || null
  from = from === settings.loginUrl ? '/' : from
  if (pageUrl?.match(/^https?:\/\/.+/)) {
    window.location.href = pageUrl + `?${fromArg}=` + encodeURI(location.href)
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
      router.push({
        path: pageUrl,
        query: from === '/' ? {} : { [fromArg]: from }
      })
    }
  } else if (pageUrl == location.pathname) {
    isLoading.value = false
  }
}

export const gotoLoginPage = (url?: string, next?: NavigationGuardNext): boolean | void => {
  return gotoPage('loginUrl', url, next)
}

router.beforeEach((to, from, next) => {
  isLoading.value = true
  // @ts-ignore
  const t = window.i18n.t as (str: string) => string
  // @ts-ignore
  if (to.login === false || !settings.loginUrl || settings.whiteList.indexOf(to.path) !== -1) {
    next()
  } else if (user.value.login) {
    if (user.value.credentialsExpired && settings.resetPwdUrl) {
      return gotoPage('resetPwdUrl', to.path, next)
    } else if (user.value.locked && settings.activeUrl) {
      return gotoPage('activeUrl', to.path, next)
    } else if (user.value.mfa == 'UNSET' && settings.mfaSetupUrl) {
      return gotoPage('mfaSetupUrl', to.path, next)
    } else if (user.value.mfa == 'VERIFY' && settings.mfaVerifyUrl) {
      return gotoPage('mfaVerifyUrl', to.path, next)
    }
    let hasA = true
    let hasR = true
    //@ts-ignore
    if (to.authorities) {
      //@ts-ignore
      hasA = hasAuthority(to.authorities as string[])
    }
    //@ts-ignore
    if (to.roles) {
      //@ts-ignore
      hasR = hasRole(to.roles as string[], { or: true })
    }
    if (hasR && hasA) {
      next()
    } else {
      notify({ title: t('network.403'), message: t('alert.error'), type: 'error' })
      return next({ ...from })
    }
  } else {
    return gotoLoginPage(to.path, next)
  }
})

router.afterEach((to, from, failure) => {
  isLoading.value = false
  if (!failure) {
    const { setAppTitle } = useAppStore()
    if (to.meta && to.meta.title) {
      if (typeof to.meta.title == 'function') {
        // @ts-ignore
        setAppTitle(to.meta.title({ route: to, t: window.i18n.t }) as string)
      } else {
        setAppTitle(to.meta.title as string)
      }
    }
  }
})

export default router
