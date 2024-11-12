<template>
  <div>
    Home
  </div>
</template>
<script lang="ts" setup>
import { inject, onMounted, watchEffect } from 'vue'
import { CURRENT_MENU_NODE } from '@/@types'
import { tsc } from '@/utils/i18n'
import useAxios from '@/utils/axios'
import { notify } from '@/utils/msgbox'

const cNode = inject(CURRENT_MENU_NODE, null)

watchEffect(() => {
  if (cNode?.value != null) {
    console.log('菜单名称: ', tsc(cNode.value.meta?.name, cNode.value))
    notify({
      title: 'a',
      message: '变啦',
      duration: 10000,
      type: 'warning'
    })
  }
})
onMounted(() => {
  useAxios().post('audit-log/logs', { data: {} }).then(({ data }) => {
    console.log(data)
  })
})
</script>
