import { useStorage } from '@vueuse/core'
import setting from '@/config/settings'

import useAxios from '@/utils/axios'
import { toArray } from '@/utils'
import { t } from '@/utils/i18n'
import { name } from './../../package.json'
import handlers from '@/config/handler'
import type { ErrorEvent } from '@/@types/request'
import { notify } from '@/utils/msgbox'

const axios = useAxios()
const ROLE_PREFIX = setting.rolePrefix || 'ROLE_'
const storagePrefix = name || ''
const patterns = new Map<string, RegExp>()

const getPattern = (authority: string): RegExp | undefined => {
  if (patterns.has(authority)) {
    return patterns.get(authority)
  }
  let suffix = false,
    key = authority
  if (key.endsWith('.*')) {
    key = key.substring(0, key.length - 2)
    suffix = true
  }
  key = key
    .replace(/([a-z0-9_-]+)(,[a-z0-9_-]+)+/gi, (m: string) => {
      return '(' + m.replace(/,/g, '|') + ')'
    })
    .replace(/\./g, '\\.')
    .replace(/\*/g, '(.+?)')
  if (suffix) {
    key += '.*'
  }
  patterns.set(authority, new RegExp('^' + key + '$'))
  return patterns.get(authority)
}

export interface Job {
  id: string
  name: string
  title: string
  level: number
  icon?: string
  current?: true
}

export interface Department {
  id: string
  name: string
  desc?: string
  icon?: string
  current?: true
  jobs?: { [id: string]: Job }
}

export interface Organization {
  id: string
  name: string
  desc?: string
  icon?: string
  current?: true
  departments?: { [id: string]: Department }
}

export interface Tenant {
  id: string
  name: string
  current?: true
  organizations?: { [id: string]: Organization }
}

export interface Role {
  id: string
  name: string
  role: string
}

export interface UserInfo {
  [key: string]: any

  uid?: string | number
  uuid?: string
  name?: string
  displayName?: string
  firstName?: string
  lastName?: string
  status?: string
  login?: boolean
  landingUrl?: string
  lastLoginTime?: number
  lastLoginIp?: string
  phone?: string
  phonePrefix?: string
  email?: string
  provider?: string
  avatar?: string
  timezone?: string
  theme?: string
  lang?: string
  accessToken?: string
  refreshToken?: string
  mfa?: string
  locked?: boolean
  credentialsExpired?: boolean
  runAs?: string
  authorities?: string[]
  roles?: Role[]
  tenants?: { [id: string]: Tenant }
  tenant?: Tenant
  organization?: Organization
  department?: Department
  job?: Job
}

export const user = useStorage<UserInfo>(storagePrefix + '::userData', {}, localStorage, {
  mergeDefaults: true
})

export const refresh = (data: UserInfo, event: ErrorEvent) => {
  data.login = true
  if (!data.lastLoginTime) {
    data.lastLoginTime = user.value?.lastLoginTime
    data.lastLoginIp = user.value?.lastLoginIp
  }
  user.value = data

  if (!data.uid || data.uid == 0) {
    if (typeof handlers['onErr808'] === 'function') {
      handlers['onErr808'](event)
    } else {
      notify({
        title: t('alert.error'),
        message: t('auth.unbind'),
        type: 'warning'
      })
    }
    return false
  }
  return true
}

export const logout = (): void => {
  user.value = {
    login: false,
    uuid: user.value?.uuid
  }
}

export const switchTo = (user: { username: string }) => {
  if (setting.switchToApi) {
    return axios.post(setting.switchToApi, {
      data: user
    })
  }
  throw new Error(t('user.switch_api_not_set'))
}

export const switchBack = () => {
  if (setting.switchBackApi) {
    return axios.post(setting.switchBackApi)
  }
  throw new Error(t('user.switch_api_not_set'))
}

export const isSuperAdmin = (): boolean => {
  return hasRole('sa')
}

export const hasRole = (roles: string | string[], modifiers: Record<string, boolean> = {}): boolean => {
  //console.debug('hasRole', roles, modifiers)
  if (!user.value.login || !user.value.authorities) {
    return false
  }
  const toBeChecked = toArray(roles).map((r) => ROLE_PREFIX + r)
  return hasAuthority(toBeChecked, modifiers)
}

export const hasAuthority = (authorities: string | string[], modifiers: Record<string, boolean> = {}): boolean => {
  // console.debug('hasAuthority', authorities, modifiers)
  if (!user.value.login || !user.value.authorities) {
    return false
  }
  const toBeChecked = toArray(authorities)
  const matched = toBeChecked.filter((r) => {
    return user.value.authorities?.includes(r)
  })

  if (modifiers['and']) {
    return matched.length > 0 && matched.length == toBeChecked.length
  }

  return matched.length > 0
}

export const hasPermission = (
  permission: string,
  args?: { id?: string | number; [key: string]: any } | (() => string)
): boolean => {
  // console.debug('hasPermission: ', permission, ', args =>', args)
  if (!user.value.login || !user.value.authorities) {
    return false
  }
  let id = permission
  if (args) {
    if (typeof args == 'function') {
      id += '.' + args()
    } else {
      id += '.' + args.id
    }
  }

  if (hasAuthority(id)) {
    return true
  }

  // console.debug('Real permission to check:', id)
  const authority = user.value.authorities
    .filter((a) => a.indexOf('*') >= 0)
    .find((authority) => {
      const pattern = getPattern(authority)
      return pattern && pattern.test(id)
    })
  // console.debug('matched =>', authority)
  return authority != undefined
}

export const permit = (roles: string | string[] | undefined, authorities: string | string[] | undefined) => {
  let hasA = true
  let hasR = true
  if (authorities) {
    hasA = hasAuthority(authorities)
  }
  if (roles) {
    hasR = hasRole(roles, { or: true })
  }
  return hasA && hasR
}
export const avatar = () => {
  if (user.value.avatar) {
    return user.value.avatar
  } else if (user.value.displayName) {
    return user.value.displayName.substring(0, 1).toUpperCase()
  }
  return 'U'
}