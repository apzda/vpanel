import type { Component, Ref, VNode } from 'vue'
import type { TableProps } from 'element-plus'
import type { TVS } from '@/@types'
import useAppStore from '@/stores/app.ts'
import { permit } from '@/stores/user'
import { isArray } from 'lodash-es'

// 排序定义
export type OrderStr = 'ascending' | 'descending' | null

// 表格列定义，参考element-plus table column属性: https://element-plus.org/zh-CN/component/table.html#table-column-%E5%B1%9E%E6%80%A7
export interface TableColumn {
  cid?: string
  order?: number
  type?: 'default' | 'selection' | 'index' | 'expand' | 'action'
  index?: number | ((index: number) => number)
  label?: string
  columnKey?: string
  prop?: string
  property?: string
  width?: string | number
  minWidth?: string | number
  fixed?: boolean | 'left' | 'right'
  sortable?: boolean | 'custom'
  sortMethod?: <T = any>(a: T, b: T) => number
  sortBy?: ((row: any, index: number) => string) | string | string[]
  sortOrders?: ('ascending' | 'descending' | null)[]
  resizable?: boolean
  formatter?: (row: any, column: any, cellValue: any, index: number) => VNode | string
  showOverflowTooltip?: boolean
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
  className?: string
  labelClassName?: string
  selectable?: (row: any, index: number) => boolean
  reserveSelection?: boolean
  filters?: TVS
  filterPlacement?:
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'left-start'
    | 'left-end'
    | 'right'
    | 'right-start'
    | 'right-end'
  filterClassName?: string
  filterMultiple?: boolean
  filterMethod?: (value: any, row: any, column: any) => void
  filteredValue?: string[]
  tooltipFormatter?: (data: { row: any; column: any; cellValue: any }) => VNode | string
  hidden?: boolean
  slot?: string
  h?: VNode
  headerSlot?: string
  filterSlot?: string
  children?: TableColumn[]
}

// 表格数据操作定义，参考element-plus button属性: https://element-plus.org/zh-CN/component/button.html#button-attributes
export interface TableAction {
  label?: string
  slot?: string
  multi?: boolean // 可以操作多条记录
  click?: (row: any[]) => void
  more?: boolean // 放在更多里
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  plain?: boolean
  text?: boolean
  bg?: boolean
  link?: boolean
  round?: boolean
  circle?: boolean
  loading?: boolean
  disabled?: boolean
  icon?: string | Component
  color?: string
  divided?: boolean
  authorities?: string[] | string
  roles?: string[] | string
  items?: Omit<TableAction, 'items' | 'slot' | 'more'>[]
}

export type TableActions = (TableAction | Omit<TableAction, 'items' | 'slot' | 'more'>[])[]

// 表格工具栏定义，参考element-plus button属性: https://element-plus.org/zh-CN/component/button.html#button-attributes
export interface ToolItem {
  label?: string
  slot?: string
  click?: (row: any[]) => void
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  plain?: boolean
  text?: boolean
  bg?: boolean
  link?: boolean
  round?: boolean
  circle?: boolean
  loading?: boolean
  disabled?: boolean
  size?: 'large' | 'default' | 'small'
  icon?: string | Component
  color?: string
  divided?: boolean
  authorities?: string[] | string
  roles?: string[] | string
  items?: Omit<ToolItem, 'items' | 'slot'>[]
}

export type ToolItems = (ToolItem | Omit<ToolItem, 'items' | 'slot'>[])[]

// 快速搜索
export interface QuickSearch {
  field: string
  name: string
  enabled: boolean
}

// 表格属性定义，参考element-plus table属性: https://element-plus.org/zh-CN/component/table.html#table-%E5%B1%9E%E6%80%A7
interface _AzTableProps<T> extends Omit<TableProps<T>, 'height' | 'data'> {
  tid?: string
  auto?: boolean
  data?: T[] | (() => T[])
  url?: string | (() => string)
  pagerSize?: 'small' | 'default' | 'large' | null
  pagerBackground?: boolean
  pagerCount?: number
  pagerLayout?: string
  defaultPageSize?: number
  defaultCurrentPage?: number
  pageSizes?: number[]
  columns: TableColumn[]
  actions?: TableActions
  tools?: ToolItems
  qs?: QuickSearch[]
}

export type AzTableProps<T = unknown> = _AzTableProps<T>

// 表格配置
export type ColumnCfg = { hidden: boolean; order: number; fixed?: boolean | 'left' | 'right' }

export class AzTableHelper {
  private id?: string
  private columnsRef?: Ref<TableColumn[]>
  private columns: TableColumn[] = []
  private defaultColumns: Record<string, ColumnCfg> = {}

  public init(
    props: AzTableProps,
    columnsRef: Ref<TableColumn[]>,
    actions: [TableAction[], TableActions],
    tools: ToolItems
  ) {
    this.id = props.tid || ''
    let order = 500
    let index = 0
    this.columns = props.columns.map((col) => {
      index++
      if (col.type == 'expand') {
        col.order = -10010
        col.hidden = false
      } else if (col.type == 'selection') {
        col.order = -10020
        col.hidden = false
      } else if (col.type == 'index') {
        col.order = -10008
      } else if (col.type == 'action') {
        col.order = 10010
        col.hidden = false
      } else if (col.order == undefined) {
        col.order = ++order
      } else {
        order = col.order
      }
      if (!col.cid) {
        col.cid = (col.prop || col.property || '@') + '-' + String(index)
      }
      this.defaultColumns[col.cid] = {
        hidden: col.hidden || false,
        order: col.order,
        fixed: col.fixed ? col.fixed : false
      }
      return col
    })
    this.columnsRef = columnsRef
    this.columnsRef.value = this.getColumns()

    if (props.actions && props.actions.length > 0) {
      props.actions.forEach((action) => {
        if (isArray(action)) {
          const gs = action.slice().filter((act) => permit(act.roles, act.authorities))
          if (gs.length > 0) {
            actions[1].push(gs)
          }
        } else {
          if (permit(action.roles, action.authorities)) {
            if (action.more) {
              actions[0].push(action)
            } else {
              if (action.items && action.items.length > 0) {
                action.items = action.items.filter((act) => permit(act.roles, act.authorities))
              }
              actions[1].push(action)
            }
          }
        }
      })
    }

    if (props.tools && props.tools.length > 0) {
      props.tools.forEach((tool) => {
        if (isArray(tool)) {
          const ts = tool.slice().filter((act) => permit(act.roles, act.authorities))
          if (ts.length > 0) {
            tools.push(ts)
          }
        } else if (permit(tool.roles, tool.authorities)) {
          if (tool.items && tool.items.length > 0) {
            tool.items = tool.items.filter((act) => permit(act.roles, act.authorities))
          }
          tools.push(tool)
        }
      })
    }
  }

  public reset(): void {
    if (this.id) {
      const { appCfg } = useAppStore()
      appCfg.tableColumns[this.id] = {}
    }
    if (this.columnsRef) {
      for (const col in this.defaultColumns) {
        const cfg = this.defaultColumns[col]
        this.fillColumn(col, cfg)
      }
      this.columnsRef.value = this.getColumns()
    }
  }

  public reloadColumns(): void {
    if (this.columnsRef) {
      this.columnsRef.value = this.getColumns()
    }
  }

  public getAllColumns(): TableColumn[] {
    return this.columns.sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  public getColumns(): TableColumn[] {
    if (this.id) {
      const { appCfg } = useAppStore()
      const cols = appCfg.tableColumns[this.id] || {}
      for (const col in cols) {
        const cfg = cols[col]
        this.fillColumn(col, cfg)
      }
    }

    return this.columns.filter((col) => col.hidden !== true).sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  private fillColumn(cid: string, cfg: ColumnCfg) {
    for (const c in this.columns) {
      if (this.columns[c].cid == cid) {
        this.columns[c].hidden = cfg.hidden
        this.columns[c].order = cfg.order
        this.columns[c].fixed = cfg.fixed
        break
      }
    }
  }
}
