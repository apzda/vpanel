<template>
  <div ref="navItem" class="flex justify-start items-center gap-2 h-[2.25rem] hover:bg-sky-800 menu"
       :class="itemCls"
       :style="itemStyle"
       @click="onItemClick">
    <el-tooltip placement="right" :content="itemText" effect="light" :disabled="expand">
      <span v-if="!avatar" class="menu-item" :class="icon" />
      <el-avatar v-else-if="avatar.startsWith('http')" :src="avatar" class="menu-item avatar" />
      <el-avatar v-else size="small" class="menu-item avatar">{{ avatar }}</el-avatar>
    </el-tooltip>

    <el-badge v-if="badge>0" class="expand grow" :value="badge" :offset="[-30, 12]">
      <a class="text-base cursor-default">{{ itemText }}</a>
    </el-badge>
    <a v-else class="expand grow text-base cursor-default">{{ itemText }}</a>

    <span v-if="itemTip" class="expand text-base text-gray-300 pr-1">{{ itemTip }}</span>
  </div>
  <component :is="vNode" />
</template>

<script lang="ts" setup>
import { CURRENT_MENU_NODE, type MenuItemElement, type Route } from '@/@types'
import { computed, inject, useTemplateRef } from 'vue'
import { ts, tsc } from '@/utils/i18n'
import { useRouter } from 'vue-router'

// hooks
const router = useRouter()
// properties
const navItem = useTemplateRef<HTMLDivElement>('navItem')
const props = withDefaults(defineProps<{
  menu?: Route
  avatar?: string
  text?: string
  cls?: string
  color?: string
  tip?: string
}>(), {})
const vNode = typeof props.menu?.meta?.vNode == 'function' ? props.menu.meta.vNode(navItem) : props.menu?.meta?.vNode
// events
const emits = defineEmits<{
  (event: 'click', value: { context: Route, menu: MenuItemElement }): void
}>()
// data bindings
const cNode = inject(CURRENT_MENU_NODE, null)
const expand = inject('asideExpand', true)
// computed
const icon = computed(() => {
  if (props.menu?.icon) {
    return props.menu.icon
  }
  return 'icon-[ep--link]'
})
const avatar = computed(() => {
  if (props.avatar) {
    return props.avatar
  } else if (props.menu?.meta?.avatar) {
    if (typeof props.menu.meta.avatar === 'function') {
      return props.menu.meta.avatar()
    }
    return props.menu.meta.avatar
  }
  return null
})
const itemText = computed(() => {
  if (props.menu && props.menu.meta?.name) {
    return tsc(props.menu.meta.name, props.menu)
  }
  return props.text || ''
})
const itemStyle = computed(() => {
  if (props.menu && props.menu.color) {
    return { color: props.menu.color }
  } else if (props.color) {
    return { color: props.color }
  }
  return {}
})
const itemCls = computed(() => {
  let cls = expand ? '' : 'rounded-3xl '
  if (cNode?.value != null && props.menu && cNode.value.path == props.menu.path) {
    cls += 'bg-sky-800 '
  }

  if (props.menu && props.menu.cls) {
    return cls + props.menu.cls
  } else if (props.cls) {
    return cls + props.cls
  }

  return cls
})
const badge = computed(() => {
  if (props.menu?.badge) {
    if (typeof props.menu.badge == 'function') {
      return props.menu.badge({ data: props.menu, t: ts })
    }
    return props.menu.badge
  }
  return 0
})
const itemTip = computed(() => {
  if (props.tip) {
    return props.tip
  } else if (props.menu?.meta?.tip) {
    return props.menu.meta.tip
  }
  return null
})
// methods
const onItemClick = () => {
  if (typeof props.menu?.meta?.click == 'function') {
    props.menu.meta.click({ context: props.menu, menu: navItem })
  } else if (props.menu?.path) {
    router.push(props.menu.path)
  } else if (props.menu) {
    // never goes here
    emits('click', { context: props.menu, menu: navItem })
  }
}
</script>

<style scoped>
.menu {
  margin-block: calc(var(--spacing, 0.25rem) * 1);
  border-radius: var(--radius-sm, 0.25rem);
  padding-block: calc(var(--spacing, 0.25rem) * 3.5);
  padding-left: 0.21428rem;
}

.menu-item {
  width: 1.57142rem;
  height: 1.57142rem;
  cursor: default;

  &.avatar {
    --el-avatar-bg-color: var(--color-cyan-600, oklch(0.609 0.126 221.723));
    font-size: 1.25rem;
  }
}

</style>
