<template>
  <div class="flex justify-start items-center gap-2 h-[24px] hover:bg-sky-800 my-1 py-3.5 pl-[0.1rem] rounded"
       :class="itemCls"
       :style="itemStyle"
       @click="onItemClick">

    <el-tooltip placement="right" :content="itemText" effect="light" :disabled="expand">
      <span v-if="!props.avatar" class="menu-item" :class="icon" />
      <el-avatar v-else-if="props.avatar.startsWith('http')" :src="props.avatar" class="menu-item" />
      <el-avatar v-else size="small" class="menu-item">{{ props.avatar }}</el-avatar>
    </el-tooltip>

    <el-badge class="expand flex-grow" v-if="badge>0" :value="badge" :offset="[-30, 12]">
      <a class="text-sm cursor-default">{{ itemText }}</a>
    </el-badge>
    <a v-else class="expand flex-grow text-sm cursor-default">{{ itemText }}</a>

    <span v-if="itemTip" class="expand text-sm text-gray-300 pr-1">{{ itemTip }}</span>
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
  tip?: string
}>(), {})
// events
const emits = defineEmits<{
  (event: 'click', value: any): void
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
  if (cNode != null && props.menu != null) {
    cNode.value = props.menu
  }
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
  cursor: default;
}
</style>
