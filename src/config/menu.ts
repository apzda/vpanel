import { TreeMgr } from './../utils'
import { type MenuItem } from './types'

// all menus
const menus = import.meta.glob('@/modules/**/menu.ts', { eager: true, import: 'default' })

const menuMgr = new TreeMgr<MenuItem>('id')

for (const m in menus) {
  menuMgr.add(menus[m] as MenuItem[])
}

export default menuMgr.nodes
