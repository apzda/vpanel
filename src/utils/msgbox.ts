import { type VNode, type Component } from 'vue'
import { ElNotification, ElMessage, ElMessageBox } from 'element-plus'

type NotifyType = 'success' | 'warning' | 'info' | 'error'

type NotifyCfg = {
  title?: string
  duration?: number
  type: NotifyType
  message: string | VNode
  icon?: string | Component
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  showClose?: boolean
}
type MsgCfg = NotifyCfg & {
  draggable?: boolean
  center?: boolean
}
export function notify(options: string | NotifyCfg) {
  ElNotification(options)
}

export function toast(options: string | NotifyCfg) {
  ElMessage(options)
}

export function alertx(options: MsgCfg) {
  ElMessageBox(options)
}
