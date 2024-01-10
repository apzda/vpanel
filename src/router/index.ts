import { createRouter, createWebHistory, type NavigationGuardNext, type RouteRecordRaw } from 'vue-router'
import { useNProgress } from '@vueuse/integrations/useNProgress'

import { TreeMgr } from '@/utils'
import settings from './../config/settings'

import { useAppStore } from './../stores/app'
import { hasAuthority, hasRole, user } from './../stores/user'

// all routers
const routers = import.meta.glob('@/modules/**/router.ts', { eager: true, import: 'default' })

const routerMgr = new TreeMgr<RouteRecordRaw>('path')

for (const m in routers) {
  routerMgr.add(routers[m] as RouteRecordRaw[])
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routerMgr.nodes
})

const { isLoading } = useNProgress(0.3, {
  showSpinner: false
})

export const gotoLoginPage = (url?: string, next?: NavigationGuardNext): boolean | void => {
  const fromArg = settings.fromArg || 'from'

  if (settings.loginUrl.match(/^https?:\/\/.+/)) {
    window.location.href = settings.loginUrl + `?${fromArg}=` + encodeURI(location.href)
    return false
  } else if (settings.loginUrl && settings.loginUrl != location.pathname) {
    url = url || location.pathname + location.search
    if (next) {
      // console.debug('跳转到登录页: ' + settings.loginUrl)
      next({
        path: settings.loginUrl,
        query: url === '/' ? {} : { [fromArg]: url }
      })
    } else {
      router.push({
        path: settings.loginUrl,
        query: url === '/' ? {} : { [fromArg]: url }
      })
    }
  } else if (settings.loginUrl == location.pathname) {
    console.debug('已经在登录页了')
    isLoading.value = false
  }
}

router.beforeEach((to, from, next) => {
  isLoading.value = true
  // @ts-ignore
  const t = window.i18n.t as (str: string) => string
  // console.debug('beforeEach', [isLogin.value, to, from])
  if (!settings.loginUrl || settings.whiteList.indexOf(to.path) !== -1) {
    // console.debug('放行 -- ' + settings.whiteList.indexOf(to.path))
    next()
  } else if (user.value.login) {
    // console.debug('beforeEach - 1', [isLogin.value, to, from])
    let hasA = true
    let hasR = true
    if (to.meta.authorities) {
      hasA = hasAuthority(to.meta.authorities as string[])
    }
    if (to.meta.roles) {
      hasR = hasRole(to.meta.roles as string[], { or: true })
    }
    if (hasR && hasA) {
      next()
    } else {
      alert(t('network.403'))
      next({ ...from })
      return false
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
      if (typeof to.meta.title === 'function') {
        // @ts-ignore
        setAppTitle(to.meta.title({ route: to, t: window.i18n.t }) as string)
      } else {
        setAppTitle(to.meta.title as string)
      }
    }
  }
})

export default router