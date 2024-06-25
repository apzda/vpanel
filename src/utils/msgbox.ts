import { type Component, type VNode } from 'vue'
import 'element-plus/es/components/message/style/css'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { t } from '@/utils/i18n'

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

export function alert(options: MsgCfg) {
  ElMessageBox(options).then(() => {

  })
}

const notifyErr = (message: string, title?: string) => {
  notify({
    duration: 10000,
    title: title || t('alert.error'),
    message: message,
    type: 'error',
    position: 'top-right'
  })
}
const notifyMsg = (message: string, title?: string) => {
  notify({
    duration: 3000,
    title: title || t('alert.success'),
    message: message,
    type: 'success',
    position: 'top-right'
  })
}
const alertErr = (message: string) => {
  alert({
    message: message,
    // @ts-ignore
    title: window.i18n.t('alert.error'),
    type: 'error'
  })
}
const alertMsg = (message: string) => {
  alert({
    message: message,
    // @ts-ignore
    title: window.i18n.t('alert.success'),
    type: 'success'
  })
}
const toastErr = (message: string) => {
  toast({
    duration: 10000,
    showClose: true,
    message: message,
    type: 'error'
  })
}
const toastMsg = (message: string) => {
  toast({
    duration: 3000,
    showClose: true,
    message: message,
    type: 'success'
  })
}

export const msgBox: {
  [func: string]: (msg: string, title?: string) => void
}[] = [
  {
    notify: notifyMsg,
    alert: alertMsg,
    toast: toastMsg
  },
  {
    notify: notifyErr,
    alert: alertErr,
    toast: toastErr
  }
]