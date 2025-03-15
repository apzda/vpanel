import type { Component, Ref, VNode } from 'vue'
import type { TableProps } from 'element-plus'
import type { TVS } from '@/@types'
import useAppStore from '@/stores/app.ts'
import { permit } from '@/stores/user'

export interface TableColumn {
  cid?: string,
  order?: number,
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
  sortMethod?: (<T = any>(a: T, b: T) => number)
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
  filterPlacement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end'
  filterClassName?: string
  filterMultiple?: boolean
  filterMethod?: (value: any, row: any, column: any) => void
  filteredValue?: string[]
  tooltipFormatter?: (data: { row: any, column: any, cellValue: any }) => VNode | string
  hidden?: boolean
  slot?: string
  headerSlot?: string
  filterSlot?: string
  children?: TableColumn[]
}

export interface TableAction {
  label?: string
  slot?: string
  multi?: boolean // 可以操作多条记录
  onClick?: (row: any[]) => void,
  more?: boolean,
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info',
  plain?: boolean,
  text?: boolean,
  bg?: boolean,
  link?: boolean,
  round?: boolean,
  circle?: boolean,
  loading?: boolean,
  disabled?: boolean,
  icon?: string | Component
  color?: string,
  divided?: boolean
  authorities?: string[] | string
  roles?: string[] | string
}

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
  pageSizes?: number[],
  columns: TableColumn[],
  actions?: TableAction[]
}

export type AzTableProps<T = unknown> = _AzTableProps<T>

export class AzTableHelper {
  private id?: string
  private columnsRef?: Ref<TableColumn[]>
  private columns: TableColumn[] = []
  private defaultColumns: Record<string, { hidden: boolean, order: number }> = {}

  public init(props: AzTableProps, columnsRef: Ref<TableColumn[]>, actions: [TableAction[], TableAction[]]) {
    this.id = props.tid || ''
    let order = 500
    this.columns = props.columns.map(col => {
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
        col.order = order++
      } else {
        order = col.order
      }
      if (!col.cid) {
        col.cid = (col.prop || '@') + '-' + String(col.order)
      }
      this.defaultColumns[col.cid] = {
        hidden: col.hidden || false,
        order: col.order
      }
      return col
    })
    this.columnsRef = columnsRef
    this.columnsRef.value = this.getColumns()

    if (props.actions) {
      props.actions.forEach((action) => {
        if (permit(action.roles, action.authorities)) {
          if (action.more) {
            actions[0].push(action)
          } else {
            actions[1].push(action)
          }
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
        console.log(col, cfg)
        for (const c in this.columns) {
          if (this.columns[c].cid == col) {
            this.columns[c].hidden = cfg.hidden
            this.columns[c].order = cfg.order
            break
          }
        }
      }
      this.columnsRef.value = this.getColumns()
    }
  }

  private getColumns(): TableColumn[] {
    if (this.id) {
      const { appCfg } = useAppStore()
      const cols = appCfg.tableColumns[this.id] || {}
      for (const col in cols) {
        const cfg = cols[col]
        for (const c in this.columns) {
          if (this.columns[c].cid == col) {
            this.columns[c].hidden = cfg.hidden
            this.columns[c].order = cfg.order
            break
          }
        }
      }
    }

    return this.columns
      .filter(col => col.hidden !== true)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  }
}