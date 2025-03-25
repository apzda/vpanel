<template>
  <div v-for="col in model" :key="col.cid" class="p-1 m-2">
    <div class="flex justify-start items-center gap-2">
      <div class="flex-initial handle">
        <el-icon>
          <Sort />
        </el-icon>
      </div>
      <div class="grow">
        {{ tsLabel(col.label) }}
      </div>
      <div v-if="!fixed" class="flex-initial" @click="changeVisible(col)">
        <el-icon v-if="col.hidden === true">
          <Hide />
        </el-icon>
        <el-icon v-else>
          <View />
        </el-icon>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Hide, Sort, View } from '@element-plus/icons-vue'
import { ts, tsc } from '@/utils/i18n.ts'
import type { TableColumn } from '@/components/table'
import { onMounted } from 'vue'

const model = defineModel<TableColumn[]>({ required: true })

const props = defineProps<{
  fixed?: boolean | 'left' | 'right'
}>()

const tsLabel = (label?: string | string[]) => {
  return typeof label == 'string' ? tsc(label) : ts(label || '')
}

const changeVisible = (col: TableColumn) => {
  col.hidden = !col.hidden
}
onMounted(() => {
  if (props.fixed) {
    model.value.forEach((col) => {
      col.hidden = false
    })
  }
})
</script>
