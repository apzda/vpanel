import { describe, it, expect, beforeAll } from 'vitest'
import setting from '@/config/settings'
import { user, isSuperAdmin, hasPermission } from '@/stores/user'

beforeAll(() => {
  const RP = setting.rolePrefix ? setting.rolePrefix : 'ROLE_'
  user.value.login = true
  user.value.authorities = [RP + 'admin', '*:*', 'test']
})

describe('User Tests2', () => {
  it('isSuperAdmin', () => {
    expect(isSuperAdmin()).toBeFalsy()
  })

  it('hasPermission', () => {
    let permit = hasPermission('r:user.name')
    expect(permit).toBeTruthy()

    permit = hasPermission('r:user')
    expect(permit).toBeTruthy()

    permit = hasPermission('r:user', () => {
      return '1'
    })
    expect(permit).toBeTruthy()

    permit = hasPermission('r:user', { id: '2' })
    expect(permit).toBeTruthy()

    permit = hasPermission('r:role.name')
    expect(permit).toBeTruthy()

    permit = hasPermission('d:role')
    expect(permit).toBeTruthy()

    permit = hasPermission('r:deprt.1.name')
    expect(permit).toBeTruthy()

    permit = hasPermission('r:deprt.5.name')
    expect(permit).toBeTruthy()

    permit = hasPermission('test')
    expect(permit).toBeTruthy()
  })
})
