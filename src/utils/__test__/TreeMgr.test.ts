import { describe, it, expect } from 'vitest'

import { TreeMgr } from '../index'
import type { MenuItem } from '@/config/types'

describe('树型数据管理器测试', () => {
  it('TreeMgr should work ok - 1', () => {
    const menuMgr = new TreeMgr<MenuItem>('id')
    menuMgr.add([
      {
        id: 'home',
        name: 'Home',
        path: '/',
        children: [
          {
            id: 'profile',
            name: 'Profile'
          }
        ]
      }
    ])

    menuMgr.add([
      {
        id: 'home',
        children: [
          {
            id: 'test',
            name: 'Test'
          }
        ]
      }
    ])

    menuMgr.add([
      {
        id: 'test'
      }
    ])

    expect(menuMgr.nodes).toHaveLength(2)

    const home = menuMgr.get('home')
    expect(home).toHaveProperty('id', 'home')
    expect(home).toHaveProperty('name', 'Home')
    expect(home?.children).toHaveLength(2)

    const profile = menuMgr.get('home.profile')
    expect(profile).not.toBeNull()
    expect(profile).toStrictEqual({
      id: 'profile',
      name: 'Profile',
      level: 2
    })

    const test = menuMgr.get('home.test')
    expect(test).not.toBeNull()
    expect(test).toStrictEqual({
      id: 'test',
      name: 'Test',
      level: 2
    })
  })

  it('TreeMgr should work ok - 2', () => {
    const menuMgr = new TreeMgr<MenuItem>('id')
    menuMgr.add([
      {
        id: 'test'
      }
    ])
    // partial first
    menuMgr.add([
      {
        id: 'home',
        children: [
          {
            id: 'test',
            name: 'Test'
          }
        ]
      }
    ])

    menuMgr.add([
      {
        id: 'home',
        name: 'Home',
        path: '/',
        children: [
          {
            id: 'profile',
            name: 'Profile'
          }
        ],
        meta: {
          aaa: 'test'
        }
      }
    ])

    expect(menuMgr.nodes).toHaveLength(2)

    const home = menuMgr.get('home')
    expect(home).toHaveProperty('id', 'home')
    expect(home).toHaveProperty('name', 'Home')

    const profile = menuMgr.get('home.profile')
    expect(profile).not.toBeNull()
    expect(profile).toStrictEqual({
      id: 'profile',
      name: 'Profile',
      level: 2
    })

    const test = menuMgr.get('home.test')
    expect(test).not.toBeNull()
    expect(test).toStrictEqual({
      id: 'test',
      name: 'Test',
      level: 2
    })
  })
})
