<template>
  <div class="h-full flex flex-col justify-stretch">
    <!-- 顶部 -->
    <div v-if="qs && qs.length > 0 && tableTools.length > 0" class="flex-initial w-full">
      <slot name="toolbar">
        <div class="toolbar h-full flex items-center justify-between">
          <!-- 快速搜索 -->
          <div>
            <el-input
              v-if="qs && qs.length > 0"
              ref="searchRef"
              v-model="q"
              clearable
              :placeholder="ts('search') + ' (Ctrl+G)'"
              @change="qChange"
            >
              <template #prefix>
                <el-icon class="el-input__icon">
                  <Search />
                </el-icon>
              </template>
              <template v-if="qs && qs.length > 1" #suffix>
                <el-popover
                  placement="bottom-end"
                  :width="256"
                  :show-arrow="false"
                  :hide-after="50"
                  popper-class="search-popper"
                  trigger="click"
                  @hide="onSearchPopoverHide"
                >
                  <template #reference>
                    <el-icon class="el-input__icon cursor-pointer">
                      <arrow-down />
                    </el-icon>
                  </template>
                  <div class="flex flex-col gap-1">
                    <div class="text-md text-gray-400">{{ ts(['search', '-', 'fields']) }}</div>
                    <div v-for="qf in qs" :key="qf.field" class="flex items-center justify-between">
                      <div>{{ tsc(qf.name) }}</div>
                      <div>
                        <el-switch v-model="qfs[qf.field]" />
                      </div>
                    </div>
                  </div>
                </el-popover>
              </template>
            </el-input>
          </div>
          <!-- 工具栏 -->
          <div class="overflow-hidden flex items-center justify-start gap-2">
            <template v-for="(action, idx) in tableTools" :key="idx">
              <template v-if="isArray(action)">
                <el-button-group :size="action[0].size" :type="action[0].type">
                  <el-button
                    v-for="(act, idx1) in action"
                    v-bind="act"
                    :key="idx1"
                    :disabled="checkToolDisabled(act)"
                    @click="onToolbarClick(act)"
                    >{{ tsc(act.label || '') }}
                  </el-button>
                </el-button-group>
              </template>
              <template v-else-if="action.items && action.items.length > 0">
                <el-dropdown
                  split-button
                  trigger="click"
                  :button-props="action"
                  :type="action.type"
                  :disabled="checkToolDisabled(action)"
                  :size="action.size"
                  @click="onToolbarClick(action)"
                >
                  {{ tsc(action.label || '') }}
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-for="(act, idx2) in action.items"
                        v-bind="act"
                        :key="idx2"
                        :disabled="checkToolDisabled(act)"
                        @click="onToolbarClick(act)"
                        >{{ ts(act.label || '') }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
              <template v-else-if="action.slot">
                <slot :name="action.slot"></slot>
              </template>
              <el-button v-else v-bind="action" :disabled="checkToolDisabled(action)" @click="onToolbarClick(action)">
                {{ tsc(action.label || '') }}
              </el-button>
            </template>
          </div>
        </div>
      </slot>
    </div>
    <!-- 表格区 -->
    <div
      class="az-table flex flex-col justify-between"
      :class="{ 'no-pager': pagerSize == null, 'big-pager': pagerSize == 'large', 'small-pager': pagerSize == 'small' }"
    >
      <div class="az-table__wrapper">
        <div class="absolute top-0 left-0 right-0 bottom-0 overflow-hidden">
          <!-- 表格 -->
          <el-table
            ref="azTableIns"
            v-loading="loading"
            v-bind="props"
            :data="dataSource"
            :empty-text="emptyText"
            height="100%"
            v-on="eventHandlers"
          >
            <template v-if="inited" #empty>
              <slot name="empty" />
            </template>
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
              <!-- 指定了slot的action -->
              <template v-if="isArray(action)">
                <el-button-group :type="action[0].type">
                  <el-button
                    v-for="(act, idx1) in action"
                    v-bind="act"
                    :key="idx1"
                    :size="buttonSize"
                    :disabled="checkDisabled(act)"
                    @click="onActionClick(act)"
                  >
                    {{ tsc(act.label || '') }}
                  </el-button>
                </el-button-group>
              </template>
              <template v-else-if="action.items && action.items.length > 0">
                <el-dropdown
                  split-button
                  trigger="click"
                  :button-props="action"
                  :type="action.type"
                  :disabled="checkDisabled(action)"
                  :size="buttonSize"
                  @click="onActionClick(action)"
                >
                  {{ tsc(action.label || '') }}
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-for="(act, idx2) in action.items"
                        v-bind="act"
                        :key="idx2"
                        :disabled="checkDisabled(act)"
                        @click="onActionClick(act)"
                        >{{ ts(act.label || '') }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
              <template v-else-if="action.slot">
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
            <!-- 更多 -->
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
                    >{{ ts(action.label || '') }}
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
import { computed, nextTick, onBeforeUnmount, onBeforeMount, ref, reactive, useTemplateRef } from 'vue'
import { ElTable, ElInput } from 'element-plus'
import { ArrowDown, Operation, Search } from '@element-plus/icons-vue'
import { isArray, isFunction } from 'lodash-es'
import { anyTrue, keys, DEFAULT_PAGE_SIZE } from '@/utils'
import { ts, tsc } from '@/utils/i18n.ts'
import { permit } from '@/stores/user.ts'
import {
  AzTableHelper,
  type AzTableProps,
  type OrderStr,
  type TableAction,
  type TableActions,
  type TableColumn,
  type ToolItem,
  type ToolItems
} from '.'
import AzTableColumnCfgDlg from './widgets/AzTableColumnCfgDlg.vue'
import type { PaginationQuery, Sorter } from '@/@types'

defineOptions({
  inheritAttrs: false
})

const props = withDefaults(defineProps<AzTableProps>(), {
  auto: true,
  gateway: 'default',
  queries: () => {
    return {}
  },
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
  },
  tools: () => {
    return []
  },
  qs: () => {
    return []
  },
  qsFilter: (data: any, field: string, value: string): boolean => {
    return data && data[field] == value
  }
})
// 表格事件，同https://element-plus.org/zh-CN/component/table.html#table-%E4%BA%8B%E4%BB%B6
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
const defaultEmptyText = props.emptyText
const helper = new AzTableHelper<any>()
const tableActions: [TableAction[], TableActions] = [[], []]
const tableTools: ToolItems = []
// refs
const azTableIns = useTemplateRef<typeof ElTable>('azTableIns')
const azTableColumnCfgDlg = useTemplateRef<typeof AzTableColumnCfgDlg>('azTableColumnCfgDlg')
const searchRef = useTemplateRef<typeof ElInput>('searchRef')
// bind
const inited = ref<boolean>(false)
const loading = ref(false)
const emptyText = ref<string | undefined>('')
const columns = ref<TableColumn[]>([])
const dataSource = ref<unknown[]>([])
const q = ref<string>('')
const qfs = reactive<Record<string, boolean>>({})
const pageSize = ref(props.defaultPageSize)
const currentPage = ref(props.defaultCurrentPage)
const total = ref(0)
const sorter = ref<Sorter>({ order: [] })
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
// 动作按钮禁用检测
const checkDisabled = (action: TableAction) => {
  return (
    action.disabled ||
    !permit(action.roles, action.authorities) ||
    (!action.multi && selectedRows.value.length > 1) ||
    selectedRows.value.length == 0
  )
}
// 工具栏按钮禁用检测
const checkToolDisabled = (tool: ToolItem) => {
  return tool.disabled || !permit(tool.roles, tool.authorities)
}

// 获取本地数据
const getData = (data: any[]): any[] => {
  const offset = (currentPage.value - 1) * pageSize.value
  if (offset >= 0 && offset < data.length) {
    if (q.value != '' && anyTrue(qfs)) {
      return data
        .filter((d) => {
          for (const f in qfs) {
            if (qfs[f] && props.qsFilter(d, f, q.value)) {
              return true
            }
          }
          return false
        })
        .slice(offset, offset + pageSize.value)
    } else {
      return data.slice(offset, offset + pageSize.value)
    }
  }
  return []
}
// 快速搜索框聚集
const focusSearch = (event: any) => {
  if (event.ctrlKey) {
    if (event.key === 'g' || event.key === 'G') {
      event.preventDefault()
      searchRef.value?.focus()
    }
  }
}

// event-handlers of el-table
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
    const sort = { ...data }
    $emits('sortChange', sort)
    if (sort.order) {
      sorter.value.order = [
        {
          field: sort.prop,
          direction: sort.order == 'ascending' ? 'ASC' : 'DESC'
        }
      ]
    } else {
      sorter.value.order = []
    }
    reload()
  },
  filterChange(newFilters: any, a: any) {
    console.log(newFilters, a)
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
// 动作栏事件
const onActionClick = (action: TableAction) => {
  if (action.click) {
    action.click(selectedRows.value)
  }
}
// 工具栏事件
const onToolbarClick = (action: ToolItem) => {
  if (action.click) {
    action.click(selectedRows.value)
  }
}
// 快速搜索字段（范围）变化
const onSearchPopoverHide = () => {
  reload()
}
// 快速搜索值变化
const qChange = (value: string | number) => {
  console.debug('qs value:', value)
  reload()
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
    total.value = dataSource.value.length
    return
  } else if (isFunction(props.data)) {
    const data = props.data()
    if (isArray(data)) {
      dataSource.value = getData(data)
      total.value = dataSource.value.length
    } else {
      console.warn('data is not an array: ', data)
      dataSource.value = []
      total.value = 0
    }

    return
  }

  loading.value = true
  const query: PaginationQuery = { ...props.queries }
  if (props.qs) {
    query._qv = q.value
    query._qf = keys(qfs).join(',')
  }

  if (props.pagerSize != null) {
    query.pager = {
      pageSize: pageSize.value || DEFAULT_PAGE_SIZE,
      pageNumber: currentPage.value || 1
    }
    if (sorter.value.order.length > 0) {
      query.pager.sort = sorter.value
    }
  }

  helper
    .loadRemoteData(query, {})
    .then((data) => {
      dataSource.value = data.results || []
      if (data.total && data.total >= 0) {
        total.value = data.total
      }
    })
    .finally(() => {
      if (!inited.value) {
        emptyText.value = defaultEmptyText
        inited.value = true
      }

      loading.value = false
    })
}

const reload = async () => {
  currentPage.value = 1
  await load()
}

onBeforeMount(() => {
  for (const f of props.qs) {
    qfs[f.field] = f.enabled ? f.enabled : false
  }
  helper.init(props, columns, tableActions, tableTools)
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
  window.addEventListener('keydown', focusSearch)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', focusSearch)
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
    --az-pager-height: 35px;
  }

  &.big-pager {
    --az-pager-height: 50px;
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
