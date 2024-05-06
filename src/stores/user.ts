import { useStorage } from '@vueuse/core'

import { toArray } from '@/utils'
import setting from '@/config/settings'

const ROLE_PREFIX = setting.rolePrefix ? setting.rolePrefix : 'ROLE_'
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
    .replaceAll(/([a-z0-9_-]+)(,[a-z0-9_-]+)+/gi, (m) => {
      return '(' + m.replaceAll(',', '|') + ')'
    })
    .replaceAll('.', '\\.')
    .replaceAll('*', '(.+?)')
  if (suffix) {
    key += '.*'
  }
  // console.debug('pattern:', authority, ' => ', key)
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

export interface UserInfo {
  uid?: string | number
  uuid?: string
  name?: string
  displayName?: string
  firstName?: string
  lastName?: string
  status?: string
  login?: boolean
  lastLoginTime?: number
  lastLoginIp?: string
  phone?: string
  phonePrefix?: string
  email?: string
  avatar?: string
  timezone?: string
  theme?: string
  lang?: string
  accessToken?: string
  refreshToken?: string
  mfa?: string
  authorities?: string[]
  tenants?: { [id: string]: Tenant }
  tenant?: Tenant
  organization?: Organization
  department?: Department
  job?: Job
}

export const user = useStorage<UserInfo>('_json_user_info', {}, localStorage, {
  mergeDefaults: true
})

export const logout = (): void => {
  user.value.refreshToken = ''
  user.value.accessToken = ''
  user.value.login = false
}

export const isSuperAdmin = (): boolean => {
  // console.debug('isAdmin')
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
  args: { id?: string | number; [key: string]: any } | (() => string)
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
