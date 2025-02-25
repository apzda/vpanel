<template>
  <div class="common-layout">
    <el-container class="h-full">
      <!-- 侧边栏 -->
      <el-aside class="bg-sky-900 dark:bg-gray-900 text-white"
                :class="{'aside-expand':expand,'aside-collapse':!expand}">
        <div class="px-5 py-2 h-full overflow-hidden flex flex-col justify-between">
          <div class="flex-initial shrink-0 flex justify-start items-center gap-3 pt-2 mb-5 h-[2.57142rem]">
            <img :src="assets('logo.svg')" alt="" class="expand w-[2.28571rem] h-[2.28571rem] shrink-0">
            <h1 class="expand text-2xl font-bold grow">{{ settings.appName || 'VPANEL' }}</h1>
            <span class="icon-[mdi--search] w-6 h-6 shrink-0 cursor-pointer" @click="showSearchDlg=true"></span>
          </div>
          <!-- 顶部固定导航: group = 0 -->
          <div class="flex-initial shrink-0 border-b border-gray-500 dark:border-gray-800">
            <nav-item v-for="(menu,idx) in topMenus" :menu="menu" :key="idx" />
          </div>
          <!-- 导航: 0 < group < 999 -->
          <div class="grow border-b border-gray-500 dark:border-gray-800 py-1 overflow-hidden">
            <el-scrollbar class="h-full">
              <template v-for="(items,idx) in groupMenus" :key="idx">
                <template v-for="(item,idx1) in items" :key="idx1">
                  <nav-item :menu="item" />
                  <p v-if="idx1 == items.length-1 && idx!=groupMenus.length-1"
                     class="border-b border-gray-500 dark:border-gray-800"></p>
                </template>
              </template>
            </el-scrollbar>
          </div>
          <!-- 底部固定导航: group = 999 -->
          <div class="flex-initial shrink-0">
            <nav-item v-for="(menu,idx) in bottomMenus" :menu="menu" :key="idx" />
          </div>
          <div class="flex-initial shrink-0 flex justify-between gap-2 items-center h-[2.14285rem]">
            <span class="w-6 h-6 ml-[0.285714rem] cursor-pointer"
                  :class="{'icon-[mdi--chevron-double-left]':expand,'icon-[mdi--chevron-double-right]':!expand}"
                  @click="toggleExpand"></span>
            <span class="expand text-base cursor-pointer grow"
                  @click="toggleExpand">{{ ts('layout.collapse', 'Collapse Sidebar') }}</span>
            <!-- 语言切换 -->
            <el-dropdown class="expand" placement="bottom-end" @command="languageChanged">
              <span class="icon-[mdi--translate-variant] w-5 h-5 text-white"></span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="(item,idx) in languages" :key="idx" :command="idx">{{ item.name }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <!-- 暗黑模式切换 -->
            <span class="expand cursor-pointer w-5 h-5"
                  :class="{'icon-[ep--moon]':dark,'text-orange-400 icon-[ep--sunny]':!dark}"
                  @click="dark=!dark" />
          </div>
        </div>
      </el-aside>
      <!-- 主工作区 -->
      <slot>
        <el-container>
          <!-- 头部 -->
          <el-header v-if="cPage.meta?.header!==false" class="shadow-md shadow-gray-200 dark:shadow-gray-950"
                     style="--el-header-padding:0 10px">
            <!-- 自定义头部 -->
            <router-view v-if="cPage.components?.header" name="header" />
            <!-- 默认头部:二级导致 -->
            <div v-else
                 class="h-full flex justify-start items-center gap-1 text-gray-700 dark:text-white">
              <span v-if="cIcon" class="shrink-0 w-[1.57142rem] h-[1.57142rem]" :class="cIcon" />
              <div v-if="cName" class="shrink-0 font-semibold text-lg mr-2" :class="{'':cNode?.children}">
                {{ cName }}
              </div>
              <div v-if="cNode?.children"
                   class="shrink-0 border-r-2 border-gray-200 dark:border-gray-800 h-2/5 mr-1"></div>
              <el-scrollbar v-if="cNode?.children" class="grow">
                <div class="h-[--el-header-height] text-base flex justify-start items-center gap-0.5">
                  <sub-nav-item v-for="(sub,idx) in cNode.children" :menu="sub" :key="idx" />
                </div>
              </el-scrollbar>
              <!-- 右部菜单 -->
              <router-view name="right"></router-view>
              <!-- 帮助按钮 -->
              <div v-if="cPage.components?.help" class="shrink-0 ml-1 flex flex-col h-full justify-center">
                <span class="icon-[mdi--help-circle-outline] w-5 h-5 cursor-help" @click="drawer=true"></span>
              </div>
            </div>
          </el-header>
          <!-- 工作区 -->
          <el-main style="--el-main-padding: 0; overflow:hidden">
            <router-view />
          </el-main>
        </el-container>
      </slot>
    </el-container>
    <!-- 开始菜单 -->
    <search-dlg
      v-model="showSearchDlg"
      :title="ts('search','Search')"
      width="50%"
      align-center />
    <!-- 帮助 -->
    <el-drawer v-model="drawer" direction="rtl" :title="ts('help','Help')" size="45%">
      <router-view name="help" />
    </el-drawer>
  </div>
</template>
<script lang="ts" setup>
import { computed, onBeforeMount, provide, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { hasPermission, hasRole, user } from '@/stores/user'

import { gotoLoginPage, routerMgr, sortRoute as sortMenuItem } from '@/router'
import { CURRENT_MENU_NODE, type Route } from '@/@types'
import { ts, tsc } from '@/utils/i18n'
import { useAppStore } from '@/stores/app'
import { assets, toArray } from '@/utils'
import { language as locale } from '@/utils/lang'
import settings from '@/config/settings'
import NavItem from '@/components/layout/widgets/NavItem.vue'
import SubNavItem from '@/components/layout/widgets/SubNavItem.vue'
import SearchDlg from '@/components/layout/widgets/SearchDlg.vue'
// hooks
const $route = useRoute()
// constants
const groups = new Set<number>()
const nodes = routerMgr.nodes.sort(sortMenuItem)
// data bindings
const drawer = ref(false)
const showSearchDlg = ref(false)
const menus = ref<Route[]>([])
const topMenus = ref<Route[]>([])
const bottomMenus = ref<Route[]>([])
const groupMenus = ref<Route[][]>([])
const cNode = ref<Route | null>(null)
const { isDark, toggleDark, appCfg } = useAppStore()
const expand = ref<boolean>(appCfg.asideExpand)
const dark = ref<boolean>(isDark)
const languages = ref<{
  [lang: string]: {
    name: string
    flag?: string
  }
}>(settings.languages)
watch(dark, toggleDark)
provide(CURRENT_MENU_NODE, cNode)
provide('asideExpand', expand)
// === methods ===
// 切换语言
const languageChanged = (lang: string) => {
  locale.value = lang
  window.location.reload()
}
// 展开/折叠侧边栏
const toggleExpand = () => {
  expand.value = !expand.value
  appCfg.asideExpand = expand.value
}
// 过滤菜单
const filterMenuItem = (menu: Route) => {
  if (menu.menu === true
    || menu.sort != undefined
    || menu.group != undefined
    || menu.icon != undefined
    || menu.cls != undefined
    || menu.color != undefined
    || menu.authorities
    || menu.roles
  ) {
    let hasA = true
    let hasR = true
    if (menu.authorities) {
      toArray(menu.authorities).forEach(perm => {
        hasA = hasA && hasPermission(perm)
      })
    }
    if (menu.roles) {
      hasR = hasRole(menu.roles, { or: true })
    }
    return hasA && hasR
  }
  return false
}
// 创建子菜单
const createMenuItem = (menu: Route, parent: Route): Route => {
  // const m = deepClone(menu)
  const m = menu
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
  if (m.group == undefined) {
    m.group = 1
  }
  return m
}
const detectiveActivateItem = () => {
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
  } else if (menus.value.length > 0) {
    cNode.value = menus.value.find(item => item.path == '') || menus.value[0]
  }
}
const initMenu = (): Route[] => {
  const items: Route[] = []

  if (nodes.length > 0) {
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].children?.filter(filterMenuItem).sort(sortMenuItem).forEach(item => {
        items.push(createMenuItem(item, nodes[i]))
        if (item.group != 0 && item.group != 999) {
          groups.add(item.group == undefined ? 1 : item.group)
        }
      })
    }

    if (items) {
      menus.value = items.sort(sortMenuItem)
      detectiveActivateItem()
      // group
      menus.value.filter(item => item.group === 0).forEach(item => {
        topMenus.value.push(item)
      })
      menus.value.filter(item => item.group === 999).forEach(item => {
        bottomMenus.value.push(item)
      })
      // 分组一级导航
      Array.from(groups).sort().forEach(group => {
        const ms: Route[] = []
        menus.value.filter(item => item.group == group).forEach(item => {
          ms.push(item)
        })
        groupMenus.value.push(ms)
      })
    } else {
      menus.value = []
    }
  }
  // console.log('menus: ', menus.value)
  return items
}
// === computed ===
const cIcon = computed(() => {
  if (cNode.value?.icon) {
    return cNode.value.icon
  }
  return null
})
const cName = computed(() => {
  if (cNode.value?.meta?.name) {
    return tsc(cNode.value.meta.name, cNode.value)
  }
  return null
})
const cPage = computed(() => {
  return $route.matched[$route.matched.length - 1]
})
// === lifecycles ===
onBeforeMount(() => {
  if (!user.value.login) {
    gotoLoginPage($route.path)
  } else {
    initMenu()
    watch(() => $route.path, detectiveActivateItem)
  }
})
</script>

<style lang="scss">
.common-layout {
  height: 100vh;
}

.aside-expand {
  --el-aside-width: 18.5rem;
}

.aside-collapse {
  --el-aside-width: 4.5rem;

  .expand {
    display: none;
  }
}
</style>