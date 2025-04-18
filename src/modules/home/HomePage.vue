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
        :tools="tools"
        :qs="qs"
        :actions="actions"
        @selection-change="onSelectionChanged"
      >
        <template #expand="{ $index, row }"> 展开行: {{ $index }}: {{ row.name }}</template>
        <template #action>
          <el-button link type="primary" size="small"> Detail</el-button>
          <el-button link type="primary" size="small">Edit</el-button>
          <el-button link type="warning" size="small">Del</el-button>
        </template>
        <template #act1>a1</template>
      </az-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { markRaw, onMounted, ref, useTemplateRef } from 'vue'
import { Operation } from '@element-plus/icons-vue'
import AzTable from '@/components/table/AzTable.vue'
import type { QuickSearch, TableActions, TableColumn, ToolItems } from '@/components/table'

// refs
const azTableRef = useTemplateRef<typeof AzTable>('azTable')
// actions
const actions: TableActions = [
  [
    {
      label: 'G1'
    },
    {
      label: 'G2'
    }
  ],
  {
    label: 'A1',
    slot: 'act1'
  },
  {
    label: 'A3',
    type: 'primary',
    plain: true,
    icon: markRaw(Operation),
    click(selection: any[]) {
      console.log('你点A2了', selection)
    }
  },
  {
    label: '下拉',
    items: [
      {
        label: 'D1'
      },
      {
        label: 'D2',
        divided: true
      }
    ]
  },
  {
    label: 'A3',
    icon: markRaw(Operation),
    more: true
  },
  {
    label: 'Op4',
    icon: markRaw(Operation),
    more: true,
    divided: true,
    multi: true
  }
]
// quick search
const qs: QuickSearch[] = [
  {
    field: 'name',
    name: '姓名',
    enabled: true
  },
  {
    field: 'age',
    name: '年龄',
    enabled: true
  }
]
// tools
const tools: ToolItems = [
  {
    label: 'B1',
    size: 'small',
    click() {
      console.log('Toolbar B1 clicked')
    }
  },
  [
    {
      size: 'small',
      type: 'primary',
      label: 'T1',
      icon: markRaw(Operation)
    },
    {
      label: 'T2',
      type: 'danger',
      click() {
        console.log('你点了T2')
      }
    }
  ],
  {
    label: '下拉',
    size: 'small',
    type: 'primary',
    click() {
      console.log('点下拉哟')
    },
    items: [
      {
        label: 'D1'
      },
      {
        label: 'D2',
        divided: true
      }
    ]
  }
]
// binds
const columns: TableColumn[] = [
  {
    cid: 's',
    label: '#',
    type: 'selection',
    reserveSelection: true
  },
  {
    cid: 'e',
    label: '',
    type: 'expand'
  },
  {
    cid: 'n1',
    label: 'Name',
    prop: 'name'
  },
  {
    cid: 'n2',
    label: '姓名',
    prop: 'name'
  },
  {
    cid: 'age',
    label: '年龄',
    prop: 'age',
    sortable: true,
    order: 503
  },
  {
    cid: 'date',
    label: '{Phone}',
    prop: 'date',
    showOverflowTooltip: true,
    sortable: true,
    filters: [
      { text: '1', value: 1 },
      { text: '2', value: '2' }
    ]
  },
  {
    cid: 'act',
    label: '',
    type: 'action',
    width: '200px',
    fixed: 'right'
  }
]
const data = ref([
  { name: 'aaa', date: '8', age: 18 },
  {
    name: 'bbb',
    date: '9asdfa asdfa asdfasdfa asdfasdfasdfasdf asdfasdfaf ',
    age: 28
  }
])
for (let i = 0; i < 100; i++) {
  data.value.push({
    name: `后加的 - ${i}`,
    date: '2019-02-10',
    age: 18 + i
  })
}
const onSelectionChanged = () => {
  console.log('onSelectionChanged xxx')
}
onMounted(() => {
  azTableRef.value?.reload()
})
</script>
