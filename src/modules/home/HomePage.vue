<template>
  <div class="h-full flex flex-col justify-stretch">
    <div class="flex-1 mt-1">
      <az-table
        ref="azTable"
        tid="home-t-1"
        row-key="name"
        :border="false"
        :data="data"
        :columns="columns"
        :actions="actions"
      >
        <template #expand="{$index,row}">
          展开行: {{ $index }}: {{ row.name }}
        </template>
        <template #action>
          <el-button link type="primary" size="small">
            Detail
          </el-button>
          <el-button link type="primary" size="small">Edit</el-button>
        </template>
        <template #act1>
          a1
        </template>
      </az-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { markRaw, onMounted, ref, useTemplateRef } from 'vue'
import { Operation } from '@element-plus/icons-vue'
import AzTable from '@/components/AzTable.vue'
import type { TableAction, TableColumn } from '@/components/components.ts'

// refs
const azTableRef = useTemplateRef<typeof AzTable>('azTable')
// actions
const actions: TableAction[] = [{
  label: 'A1',
  slot: 'act1'
}, {
  label: 'A2',
  type: 'primary',
  plain: true,
  icon: markRaw(Operation),
  onClick() {
    console.log('你点A2了')
  }
}, {
  label: 'A3',
  icon: markRaw(Operation),
  more: true
}, {
  label: 'Op4',
  icon: markRaw(Operation),
  more: true,
  divided: true
}
]
// binds
const columns: TableColumn[] = [
  {
    label: '#',
    type: 'selection',
    reserveSelection: true
  },
  {
    label: '',
    type: 'expand'
  }, {
    label: 'Name',
    prop: 'name'
  }, {
    label: '姓名',
    prop: 'name'
  }, {
    label: '年龄',
    prop: 'age',
    order: 503
  }, {
    label: '{Phone}',
    prop: 'date',
    showOverflowTooltip: true,
    sortable: true,
    filters: [{ text: '1', value: 1 }, { text: '2', value: '2' }],
    hidden: true
  }, {
    label: '',
    type: 'action',
    width: '200px',
    fixed: 'right'
  }
]
const data = ref([{ name: 'aaa', date: '8', age: 18 }, {
  name: 'bbb',
  date: '9asdfa asdfa asdfasdfa asdfasdfasdfasdf asdfasdfaf ',
  age: 28
}])
for (let i = 0; i < 100; i++) {
  data.value.push({
    name: `后加的 - ${i}`,
    date: '2019-02-10',
    age: 18
  })
}
onMounted(() => {
  //azTableRef.value?.reload()
})
</script>