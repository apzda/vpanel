import { type Ref } from 'vue'
import { useStorage } from '@vueuse/core'

export interface UserInfo {
  uid: string | number
  uuid?: string
  username?: string
  status: number
  login: boolean
  lastLoginTime?: number
  phone?: string
  email?: string
  avatar?: string
  timezone?: string
  language?: string
  token?: string
  refreshToken?: string
  tokenExpired?: number
  roles?: string[]
  authorities?: string[]
}

export const user: Ref<UserInfo> = useStorage<UserInfo>(
  '_json_user_info',
  { uid: 0, status: 0, login: false },
  localStorage,
  {
    mergeDefaults: true
  }
)

export const logout = (): void => {
  user.value.refreshToken = ''
  user.value.token = ''
  user.value.login = false
}

export const isSuperAdmin = (): boolean => {
  console.debug('isAdmin')
  if (!user.value.login) {
    return false
  }
  return hasRole('sa')
}

export const hasRole = (roles: string | string[], modifiers: Record<string, boolean> = {}): boolean => {
  console.debug('hasRole', roles, modifiers)
  if (!user.value.login || !user.value.roles) {
    return false
  }
  return user.value.roles.filter((r) => roles.indexOf(r) >= 0).length > 0
}

export const hasAuthority = (authorities: string | string[], modifiers: Record<string, boolean> = {}): boolean => {
  console.debug('hasAuthority', authorities, modifiers)
  if (!user.value.login) {
    return false
  }
  return false
}

export const hasPermission = (
  permission: string,
  args: any = null,
  modifiers: Record<string, boolean> = {}
): boolean => {
  console.debug('hasPermission', permission, modifiers, 'args =>', args)
  if (!user.value.login) {
    return false
  }
  return false
}
