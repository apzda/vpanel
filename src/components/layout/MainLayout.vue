<template>
  <div class="common-layout">
    <el-container class="h-full">
      <el-aside class="bg-sky-900 dark:bg-gray-900 text-white"
                :class="{'aside-expand':expand,'aside-collapse':!expand}">
        <div class="px-5 py-2 h-full overflow-hidden flex flex-col justify-between">
          <div class="flex-initial flex-shrink-0 flex justify-start items-center gap-3 pt-2 mb-5 h-[36px]">
            <img :src="assets('logo.svg')" alt="" class="expand w-[32px] h-[32px] flex-shrink-0">
            <h1 class="expand text-2xl font-bold flex-grow">{{ settings.appName || 'VPANEL' }}</h1>
            <span class="icon-[mdi--microsoft] w-6 h-6 flex-shrink-0 cursor-pointer"></span>
          </div>
          <div class="flex-initial flex-shrink-0 border-b border-gray-500 dark:border-gray-800">
            <nav-item v-for="(menu,idx) in topMenus" :menu="menu" :key="idx" />
          </div>
          <div class="flex-grow border-b border-gray-500 dark:border-gray-800 py-1 overflow-hidden">
            <el-scrollbar class="h-full">
              <nav-item v-for="i in 100" :key="i" />
            </el-scrollbar>
          </div>
          <div class="flex-initial flex-shrink-0">
            <nav-item :avatar="avatar" :text="user.displayName" @click="gotoUserProfile" />
          </div>
          <div class="flex-initial flex-shrink-0 flex justify-between gap-2 items-center h-[30px]">
            <span class="w-6 h-6 cursor-pointer"
                  :class="{'icon-[mdi--chevron-double-left]':expand,'icon-[mdi--chevron-double-right]':!expand}"
                  @click="toggleExpand"></span>
            <span class="expand text-md cursor-pointer flex-grow" @click="toggleExpand">折叠侧边栏</span>
            <el-switch
              class="expand"
              v-model="dark"
              :active-action-icon="Moon"
              :inactive-action-icon="Sunny"
            />
          </div>
        </div>
      </el-aside>
      <slot>
        <el-container>
          <el-header class="shadow-xl">
            aaaa
          </el-header>
          <el-main style="--el-main-padding: 10px">
            <router-view></router-view>
          </el-main>
        </el-container>
      </slot>
    </el-container>
  </div>
</template>
<script lang="ts" setup>
import { computed, onBeforeMount, provide, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { hasAuthority, hasRole, user } from '@/stores/user'

import { gotoLoginPage, routerMgr } from '@/router'
import { CURRENT_MENU_NODE, type Route } from '@/@types'
import { ts } from '@/utils/i18n'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { assets, deepClone } from '@/utils'
import settings from '@/config/settings'
import NavItem from '@/components/layout/widgets/NavItem.vue'
// hooks
const $route = useRoute()
// constants
const groups = new Set<string>()
// data bindings
const menus = ref<Route[]>([])
const topMenus = ref<Route[]>([])
const bottomMenus = ref<Route[]>([])
const groupMenus = ref<Route[][]>([])
const cNode = ref<Route | null>(null)
const { isDark, toggleDark, appCfg } = useAppStore()
const expand = ref<boolean>(appCfg.asideExpand)
const dark = ref<boolean>(isDark)
watch(dark, toggleDark)
provide(CURRENT_MENU_NODE, cNode)

// === methods ===
// 展开/折叠侧边栏
const toggleExpand = () => {
  expand.value = !expand.value
  appCfg.asideExpand = expand.value
}
// 菜单排序
const sortMenuItem = (a: Route, b: Route): number => {
  const s1 = typeof a.sort == 'function' ? a.sort({ data: a, t: ts }) : a.sort || 9999
  const s2 = typeof b.sort == 'function' ? b.sort({ data: b, t: ts }) : b.sort || 9999
  return s1 - s2
}
// 过滤菜单
const filterMenuItem = (menu: Route) => {
  if (menu.menu === true) {
    let hasA = true
    let hasR = true
    if (menu.authorities) {
      hasA = hasAuthority(menu.authorities as string[])
    }
    if (menu.roles) {
      hasR = hasRole(menu.roles as string[], { or: true })
    }
    return hasA && hasR
  }
  return false
}
// 创建子菜单
const createMenuItem = (menu: Route, parent: Route): Route => {
  const m = deepClone(menu)
  if (!m.path.startsWith('/')) {
    m.path = parent.path + (parent.path == '/' || !m.path ? '' : '/') + m.path
  }
  if (m.children && m.children.length > 0) {
    const items: Route[] = []
    m.children.filter(filterMenuItem).sort(sortMenuItem).forEach((item: Route) => {
      items.push(createMenuItem(item, m))
    })
    m.children = items
  }
  return m
}
// === handlers ===
const gotoUserProfile = () => {
  console.log('打开用户')
}
// === computed ===
const avatar = computed(() => {
  if (user.value.avatar) {
    return user.value.avatar
  } else if (user.value.displayName) {
    return user.value.displayName.substring(0, 1).toUpperCase()
  }
  return 'U'
})
// === lifecycles ===
onBeforeMount(() => {
  if (!user.value.login) {
    gotoLoginPage($route.path)
  } else {
    const nodes = routerMgr.nodes.sort(sortMenuItem)

    if (nodes.length > 0) {
      const items: Route[] = []
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].children?.filter(filterMenuItem).sort(sortMenuItem).forEach(item => {
          items.push(createMenuItem(item, nodes[i]))
          if (item.group != 'top' && item.group != 'bottom') {
            groups.add(item.group || '1')
          }
        })
      }

      if (items) {
        menus.value = items.sort(sortMenuItem)
        let match = 0
        let mNode: Route | null = null
        menus.value.forEach(item => {
          if ($route.path.startsWith(item.path) && item.path.length > match) {
            match = item.path.length
            mNode = item
          }
        })
        if (match > 0) {
          cNode.value = mNode
        } else {
          cNode.value = menus.value.find(item => item.path == '') || menus.value[0]
        }
        // group
        menus.value.filter(item => item.group == 'top').forEach(item => {
          topMenus.value.push(item)
        })
        menus.value.filter(item => item.group == 'bottom').forEach(item => {
          bottomMenus.value.push(item)
        })
        Array.from(groups).sort().forEach(group => {
          const ms: Route[] = []
          menus.value.filter(item => item.group == group).forEach(item => {
            ms.push(item)
          })
          groupMenus.value.push(ms)
        })
      }

      console.debug('menu items:', menus.value)
    }
  }
})
</script>

<style lang="scss">
.common-layout {
  height: 100vh;
}

.aside-expand {
  --el-aside-width: 220px
}

.aside-collapse {
  --el-aside-width: 64px;

  .expand {
    display: none;
  }
}
</style>