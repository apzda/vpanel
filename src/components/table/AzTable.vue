<template>
  <div class="h-full flex flex-col justify-stretch">
    <div class="flex-initial w-full">
      <!-- 顶部工具栏 -->
      <slot name="toolbar">
        <div class="toolbar h-full flex items-center justify-between">
          <div>a</div>
          <div>b</div>
        </div>
      </slot>
    </div>
    <div
      class="az-table flex flex-col justify-between"
      :class="{ 'no-pager': pagerSize == null, 'big-pager': pagerSize == 'large', 'small-pager': pagerSize == 'small' }"
    >
      <div class="az-table__wrapper">
        <div class="absolute top-0 left-0 right-0 bottom-0 overflow-hidden">
          <!-- 表格 -->
          <el-table ref="azTableIns" v-bind="props" :data="dataSource" height="100%" v-on="eventHandlers">
            <template v-for="(col, idx) in columns" :key="idx">
              <el-table-column v-bind="col" :label="tsLabel(col.label)">
                <template v-if="col.headerSlot" #header="{ column, $index }">
                  <slot :name="col.headerSlot" v-bind="{ column, $index }" />
                </template>
                <template v-if="col.filterSlot" #filter-icon="{ filterOpened }">
                  <slot :name="col.filterSlot" v-bind="{ filterOpened }" />
                </template>
                <template
                  v-if="col.slot || col.type == 'expand' || col.type == 'action'"
                  #default="{ row, column, $index }"
                >
                  <slot :name="col.slot || col.type" v-bind="{ row, column, $index }" />
                </template>
              </el-table-column>
            </template>
          </el-table>
          <!-- 配置按钮 -->
          <span
            v-if="tid"
            class="absolute top-3 right-2 z-10 cursor-pointer text-[var(--el-text-color-secondary)] hover:text-sky-500"
            @click="showColumnConfigDialog"
          >
            <el-icon size="1.3rem"><Operation /></el-icon>
          </span>
        </div>
      </div>
      <!-- 底部工具条 -->
      <div v-if="pagerSize != null" class="flex-initial pager flex items-center justify-between">
        <!-- 动作条 -->
        <div class="overflow-hidden flex items-center justify-start gap-2">
          <slot name="actionBar">
            <template v-for="(action, idx) in tableActions[1]" :key="idx">
              <template v-if="action.slot">
                <slot :name="action.slot"></slot>
              </template>
              <el-button
                v-else
                v-bind="action"
                :size="buttonSize"
                :disabled="checkDisabled(action)"
                @click="onActionClick(action)"
              >
                {{ tsc(action.label || '') }}
              </el-button>
            </template>
            <el-dropdown v-if="tableActions[0].length > 0" trigger="click" :size="buttonSize">
              <el-button type="primary" :size="buttonSize">
                {{ ts(['more', '...']) }}
                <el-icon class="el-icon--right">
                  <arrow-down />
                </el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="(action, idx) in tableActions[0]"
                    v-bind="action"
                    :key="idx"
                    :disabled="checkDisabled(action)"
                    @click="onActionClick(action)"
                  >
                    <template v-if="action.slot">
                      <slot :name="action.slot"></slot>
                    </template>
                    <template v-else>
                      {{ ts(action.label || '') }}
                    </template>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </slot>
        </div>
        <!-- 分页器 -->
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          class="flex-initial"
          :layout="pagerLayout"
          :size="pagerSize"
          :page-sizes="pageSizes"
          :disabled="false"
          :background="pagerBackground"
          :default-current-page="defaultCurrentPage"
          :default-page-size="defaultPageSize"
          :total="total"
          :pager-count="pagerCount"
          @size-change="load"
          @current-change="load"
        />
      </div>
    </div>
  </div>
  <az-table-column-cfg-dlg ref="azTableColumnCfgDlg" :tid="tid" @ok="doLayout" />
</template>
<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, useTemplateRef } from 'vue'
import { ElTable } from 'element-plus'
import { ArrowDown, Operation } from '@element-plus/icons-vue'
import { isArray, isFunction } from 'lodash-es'
import { ts, tsc } from '@/utils/i18n.ts'
import { AzTableHelper, type AzTableProps, type OrderStr, type TableAction, type TableColumn } from '.'
import AzTableColumnCfgDlg from './widgets/AzTableColumnCfgDlg.vue'

defineOptions({
  inheritAttrs: false
})

const props = withDefaults(defineProps<AzTableProps>(), {
  auto: true,
  pagerSize: 'default',
  pagerBackground: false,
  pagerLayout: 'total, sizes, prev, pager, next',
  pagerCount: 5,
  pageSizes: () => [10, 15, 20, 30, 40, 50, 100, 500],
  defaultPageSize: 30,
  defaultCurrentPage: 1,
  fit: true,
  showHeader: true,
  tooltipEffect: 'dark',
  tooltipOptions: () => {
    return {
      enterable: true,
      placement: 'top',
      showArrow: true,
      hideAfter: 200,
      popperOptions: { strategy: 'fixed' }
    }
  },
  sumText: 'Summary',
  selectOnIndeterminate: true,
  indent: 16,
  treeProps: () => {
    return { hasChildren: 'hasChildren', children: 'children', checkStrictly: false }
  },
  tableLayout: 'fixed',
  allowDragLastColumn: true,
  actions: () => {
    return []
  }
})

const $emits = defineEmits<{
  (e: 'select', selection: any[], row: any): void
  (e: 'selectAll', selection: any[]): void
  (e: 'selectionChange', newSelection: any[]): void
  (e: 'cellMouseEnter', row: any, column: any, cell: HTMLTableCellElement, event: Event): void
  (e: 'cellMouseLeave', row: any, column: any, cell: HTMLTableCellElement, event: Event): void
  (e: 'cellClick', row: any, column: any, cell: HTMLTableCellElement, event: Event): void
  (e: 'cellDblclick', row: any, column: any, cell: HTMLTableCellElement, event: Event): void
  (e: 'cellContextmenu', row: any, column: any, cell: HTMLTableCellElement, event: Event): void
  (e: 'rowClick', row: any, column: any, event: Event): void
  (e: 'rowContextmenu', row: any, column: any, event: Event): void
  (e: 'rowDblclick', row: any, column: any, event: Event): void
  (e: 'headerClick', column: any, event: Event): void
  (e: 'headerContextmenu', column: any, event: Event): void
  (e: 'sortChange', data: { column: any; prop: string; order: OrderStr }): void
  (e: 'filterChange', newFilters: any): void
  (e: 'currentChange', currentRow: any, oldCurrentRow: any): void
  (e: 'headerDragend', newWidth: number, oldWidth: number, column: any, event: MouseEvent): void
  (e: 'expandChange', row: any, expandedRows: any[] | boolean): void
  (e: 'scroll', scroll: { scrollLeft: number; scrollTop: number }): void
}>()
// consts
const helper = new AzTableHelper()
const tableActions: [TableAction[], TableAction[]] = [[], []]
// refs
const azTableIns = useTemplateRef<typeof ElTable>('azTableIns')
const azTableColumnCfgDlg = useTemplateRef<typeof AzTableColumnCfgDlg>('azTableColumnCfgDlg')
// bind
const columns = ref<TableColumn[]>([])
const dataSource = ref<unknown[]>([])
const pageSize = ref(props.defaultPageSize)
const currentPage = ref(props.defaultCurrentPage)
const total = ref(0)
const selectedRows = ref<any[]>([])
// computed
const selectedSize = computed<number>(() => selectedRows.value.length)
const buttonSize = computed(() => {
  if (!props.pagerSize || props.pagerSize == 'default' || props.pagerSize == 'small') {
    return 'small'
  }
  return 'default'
})
// methods
const tsLabel = (label?: string | string[]) => {
  return typeof label == 'string' ? tsc(label) : ts(label || '')
}
const checkDisabled = (action: TableAction) => {
  return action.disabled || (!action.multi && selectedRows.value.length > 1) || selectedRows.value.length == 0
}
const getUrl = (): string => {
  if (isFunction(props.url)) {
    return props.url()
  } else if (props.url) {
    return props.url
  }
  throw new Error('url should be defined')
}
const getData = (data: any[]): any[] => {
  const offset = (currentPage.value - 1) * pageSize.value
  if (offset >= 0 && offset < data.length) {
    return data.slice(offset, offset + pageSize.value)
  }
  return []
}

// event-handlers
const eventHandlers = {
  select(selection: any[], row: any) {
    $emits('select', selection, row)
  },
  selectAll(selection: any[]) {
    $emits('selectAll', selection)
  },
  selectionChange(newSelection: any[]) {
    selectedRows.value = newSelection
    $emits('selectionChange', newSelection)
  },
  cellMouseEnter(row: any, column: any, cell: HTMLTableCellElement, event: Event) {
    $emits('cellMouseEnter', row, column, cell, event)
  },
  cellMouseLeave(row: any, column: any, cell: HTMLTableCellElement, event: Event) {
    $emits('cellMouseLeave', row, column, cell, event)
  },
  cellClick(row: any, column: any, cell: HTMLTableCellElement, event: Event) {
    $emits('cellClick', row, column, cell, event)
  },
  cellDblclick(row: any, column: any, cell: HTMLTableCellElement, event: Event) {
    $emits('cellDblclick', row, column, cell, event)
  },
  cellContextmenu(row: any, column: any, cell: HTMLTableCellElement, event: Event) {
    $emits('cellContextmenu', row, column, cell, event)
  },
  rowClick(row: any, column: any, event: Event) {
    $emits('rowClick', row, column, event)
  },
  rowContextmenu(row: any, column: any, event: Event) {
    $emits('rowContextmenu', row, column, event)
  },
  rowDblclick(row: any, column: any, event: Event) {
    $emits('rowDblclick', row, column, event)
  },
  headerClick(column: any, event: Event) {
    $emits('headerClick', column, event)
  },
  headerContextmenu(column: any, event: Event) {
    $emits('headerContextmenu', column, event)
  },
  sortChange(data: { column: any; prop: string; order: OrderStr }) {
    $emits('sortChange', data)
  },
  filterChange(newFilters: any) {
    $emits('filterChange', newFilters)
  },
  currentChange(currentRow: any, oldCurrentRow: any) {
    $emits('currentChange', currentRow, oldCurrentRow)
  },
  headerDragend(newWidth: number, oldWidth: number, column: any, event: MouseEvent) {
    $emits('headerDragend', newWidth, oldWidth, column, event)
  },
  expandChange(row: any, expandedRows: any[] | boolean) {
    $emits('expandChange', row, expandedRows)
  },
  scroll(scroll: { scrollLeft: number; scrollTop: number }) {
    $emits('scroll', scroll)
  }
}

const onActionClick = (action: TableAction) => {
  if (action.click) {
    action.click(selectedRows.value)
  }
}
// 显示表头显示属性配置窗
const showColumnConfigDialog = () => {
  azTableColumnCfgDlg.value?.config(helper)
}
// 表头发生变化时重新布局
const doLayout = () => {
  nextTick(() => {
    azTableIns.value?.doLayout()
  })
}

// exposes
const load = async () => {
  if (isArray(props.data)) {
    dataSource.value = getData(props.data)
    return
  } else if (isFunction(props.data)) {
    const data = props.data()
    if (isArray(data)) {
      total.value = data.length
      dataSource.value = getData(data)
    } else {
      console.warn('data is not an array: ', data)
    }
    return
  }

  const url = getUrl()
  console.log('reload', url)
}

const reload = async () => {
  currentPage.value = 1
  await load()
}

onMounted(() => {
  helper.init(props, columns, tableActions)
  if (isArray(props.data)) {
    total.value = props.data.length
    reload()
  } else if (isFunction(props.data)) {
    reload()
  } else if (props.url) {
    if (props.auto) {
      reload()
    } else {
      console.warn('load data manually')
    }
  } else {
    throw new Error('At least one of data or url must be defined.')
  }
})

defineExpose({
  table(cb: (table: typeof ElTable) => unknown) {
    if (azTableIns.value) {
      cb(azTableIns.value)
    } else {
      console.warn('azTableIns not found!')
    }
  },
  reload,
  selectedSize,
  selectedRows
})
</script>

<style lang="scss" scoped>
.toolbar {
  height: 48px;
  padding: 0 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.az-table {
  flex: 1;
  overflow: hidden;

  &.no-pager {
    --az-pager-height: 1px;
  }

  &.small-pager {
    --az-pager-height: 40px;
  }

  &.big-pager {
    --az-pager-height: 60px;
  }

  .az-table__wrapper {
    flex: 0;
    flex-basis: calc(100% - var(--az-pager-height));
    overflow: hidden;
    position: relative;
  }

  .pager {
    height: var(--az-pager-height);
    padding: 5px;
  }
}

:deep(.az-table) {
  .el-pagination .el-select {
    width: 90px;
  }

  .el-select__wrapper {
    padding-left: 5px;
    padding-right: 5px;
  }
}

.az-table-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}
</style>
