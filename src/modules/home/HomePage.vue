<template>
  <div>
    Home
  </div>
</template>
<script lang="ts" setup>
import { inject, watchEffect } from 'vue'
import { CURRENT_MENU_NODE } from '@/@types'
import { tsc } from '@/utils/i18n'

const cNode = inject(CURRENT_MENU_NODE, null)

watchEffect(() => {
  if (cNode?.value != null) {
    console.log('菜单名称: ', tsc(cNode.value.meta?.name, cNode.value))
  }
})
</script>
