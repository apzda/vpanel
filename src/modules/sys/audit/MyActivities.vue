<template>
  <div class="h-full flex flex-col justify-stretch">
    <div class="flex-1 mt-1">
      <az-table
        ref="azTable"
        tid="my-activities-table"
        row-key="name"
        url="post:/audit-log/logs"
        :border="false"
        :columns="columns"
        :qs="qs"
        :queries="queries"
        :config="config"
        :transformer="transformer"
        @sort-change="sortChange"
      >
      </az-table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AzTable from '@/components/table/AzTable.vue'
import type { TableColumn, QuickSearch, TableData } from '@/components/table'
import type { PaginationQuery, RequestConfig } from '@/@types'

// binds
const columns: TableColumn[] = [
  {
    cid: 's',
    label: '#',
    type: 'selection',
    reserveSelection: true
  },
  {
    label: '时间',
    prop: 'timestamp',
    sortable: true
  },
  {
    label: '用户',
    prop: 'userid'
  },
  {
    label: '级别',
    prop: 'level',
    sortable: true
  },
  {
    label: '日志',
    prop: 'message',
    showOverflowTooltip: true
  },
  {
    label: 'IP',
    prop: 'ip',
    width: '200px'
  }
]
// quick search
const qs: QuickSearch[] = [
  {
    field: 'id',
    name: 'Q1',
    enabled: true
  },
  {
    field: 'id2',
    name: 'Q2',
    enabled: true
  }
]
const queries = ref<Record<string, any>>({})
// transformer
const transformer = (data: any): TableData => {
  return <TableData>{
    total: parseInt(data.pager?.totalElements || 0, 10),
    results: data.log
  }
}

const config = (query: PaginationQuery, options: RequestConfig): RequestConfig => {
  if (query.pager) {
    query.pager.pageNumber = query.pager.pageNumber - 1
  }
  options.data = query
  return options
}

// events
const sortChange = (data: any) => {
  if (data.prop === 'timestamp') {
    data.prop = 'createdAt'
  }
}
onMounted(() => {
  setInterval(() => {
    queries.value.timestamp = Date.now()
  }, 5000)
})
</script>
