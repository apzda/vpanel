<template>
  <div class="flex justify-start items-center gap-2 h-[24px] hover:bg-sky-800 my-1 py-3.5"
       :class="itemCls"
       :style="itemStyle"
       @click="onItemClick">
    <span v-if="!props.avatar" class="menu-item" :class="icon"></span>
    <el-avatar v-else-if="props.avatar.startsWith('http')" :src="props.avatar" class="menu-item" />
    <el-avatar v-else size="small" class="menu-item">{{ props.avatar }}</el-avatar>
    <el-badge class="expand" v-if="badge>0" :value="badge" :offset="[10, 5]">
      <a class="expand text-md">{{ itemText }}</a>
    </el-badge>
    <a v-else class="expand text-md cursor-default">{{ itemText }}</a>
  </div>
</template>

<script lang="ts" setup>
import { CURRENT_MENU_NODE, type Route } from '@/@types'
import { computed, inject } from 'vue'
import { ts, tsc } from '@/utils/i18n'
import { useRouter } from 'vue-router'

// hooks
const router = useRouter()
// properties
const props = withDefaults(defineProps<{
  menu?: Route
  avatar?: string
  text?: string
  cls?: string
  color?: string
}>(), {})
// events
const emits = defineEmits<{
  (event: 'click', value: any): void
}>()
// data bindings
const cNode = inject(CURRENT_MENU_NODE, null)
// computed
const icon = computed(() => {
  if (props.menu && props.menu.icon) {
    return `icon-[${props.menu.icon}]`
  }
  return 'icon-[ep--link]'
})
const itemText = computed(() => {
  if (props.menu && props.menu.meta?.name) {
    return tsc(props.menu.meta?.name, props.menu)
  }
  return props.text || 'My Dashboard'
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
  if (cNode?.value != null && props.menu && cNode.value.path == props.menu.path) {
    cls = 'bg-sky-600 dark:bg-sky-800'
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
    props.menu.meta.click({ context: props.menu })
  } else if (props.menu?.path) {
    router.push(props.menu.path)
  } else {
    emits('click', props.menu)
  }
}
</script>

<style scoped>
.menu-item {
  width: 22px;
  height: 22px;
}
</style>
