import { describe, it, expect, beforeAll } from 'vitest'
import setting from '@/config/settings'
import { user, isSuperAdmin, hasPermission, hasAuthority, hasRole } from '@/stores/user'

beforeAll(() => {
  const RP = setting.rolePrefix ? setting.rolePrefix : 'ROLE_'
  user.value.login = true
  user.value.authorities = [RP + 'sa', RP + 'admin', '*:user.*', 'c,r,u:role.*', 'r,u:deprt.1,2,3.*', 'RUNAS', 'test']
})

describe('User Tests', () => {
  it('isSuperAdmin', () => {
    expect(isSuperAdmin()).toBeTruthy()
  })

  it('hasRole', () => {
    let permit = hasRole('sa')
    expect(permit).toBeTruthy()
    permit = hasRole(['sa'])
    expect(permit).toBeTruthy()
    permit = hasRole(['admin', 'sa'], { and: true })
    expect(permit).toBeTruthy()
    permit = hasRole(['admin', 'sa', 'test'], { and: true })
    expect(permit).toBeFalsy()
    permit = hasRole(['admin', 'test'])
    expect(permit).toBeTruthy()
    permit = hasRole('sax')
    expect(permit).toBeFalsy()
    permit = hasRole(['sax', 'test'])
    expect(permit).toBeFalsy()
  })

  it('hasAuthority', () => {
    let permit = hasAuthority('test')
    expect(permit).toBeTruthy()
    permit = hasAuthority(['test'])
    expect(permit).toBeTruthy()
    permit = hasAuthority('testx')
    expect(permit).toBeFalsy()
    permit = hasAuthority(['test', 'RUNAS'], { and: true })
    expect(permit).toBeTruthy()
    permit = hasAuthority(['test', 'RUNAS', 'aaa'])
    expect(permit).toBeTruthy()
    permit = hasAuthority(['test', 'RUNAS', 'aaa'], { and: true })
    expect(permit).toBeFalsy()
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
    expect(permit).toBeFalsy()

    permit = hasPermission('r:deprt.1.name')
    expect(permit).toBeTruthy()

    permit = hasPermission('r:deprt.5.name')
    expect(permit).toBeFalsy()

    permit = hasPermission('test')
    expect(permit).toBeTruthy()
  })
})
