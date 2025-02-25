<template>
  <div
    class="shrink-0 h-full px-3 flex flex-col justify-center hover:bg-gray-300 hover:dark:bg-gray-800"
    :class="itemCls"
    :style="itemStyle"
    ref="navItem"
    @click="onItemClick">
    <el-badge v-if="badge>0" :value="badge" :offset="[5, -5]" class="cursor-default">
      <a class="text-base">{{ itemText }}</a>
    </el-badge>
    <a v-else class="text-base cursor-default">{{ itemText }}</a>
  </div>
  <component :is="vNode" />
</template>

<script lang="ts" setup>
import { type MenuItemElement, type Route } from '@/@types'
import { computed, useTemplateRef } from 'vue'
import { ts, tsc } from '@/utils/i18n'
import { useRoute, useRouter } from 'vue-router'

// hooks
const router = useRouter()
const route = useRoute()
// refs
const subNavItem = useTemplateRef('navItem')
// properties
const props = withDefaults(defineProps<{
  menu?: Route
  text?: string
  cls?: string
  color?: string
  tip?: string
}>(), {})
const vNode = typeof props.menu?.meta?.vNode == 'function' ? props.menu.meta.vNode(subNavItem) : props.menu?.meta?.vNode
// events
const emits = defineEmits<{
  (event: 'click', value: { context: Route, menu: MenuItemElement }): void
}>()
// computed
const itemText = computed(() => {
  if (props.menu && props.menu.meta?.name) {
    return tsc(props.menu.meta?.name, props.menu)
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
  let cls = ''
  if (props.menu && props.menu.path == route.path) {
    cls = 'bg-gray-200 text-sky-500 dark:bg-gray-800'
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
// methods
const onItemClick = () => {
  if (typeof props.menu?.meta?.click == 'function') {
    props.menu.meta.click({ context: props.menu, menu: subNavItem })
  } else if (props.menu?.path) {
    router.push(props.menu.path)
  } else if (props.menu) {
    emits('click', { context: props.menu, menu: subNavItem })
  }
}
</script>
