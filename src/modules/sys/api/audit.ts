import useAxios from '@/utils/axios'
import type { PaginationQuery } from '@/@types'
import { t } from '@/utils/i18n'

const axios = useAxios()

export interface AuditLog {
  activity: string
  arg: {
    index: number
    value: string
  }[];
  id: string
  ip: string
  level: string
  message: string
  newJsonValue?: string
  oldJsonValue?: string
  template: boolean
  tenantId: string
  timestamp: string
  userid: string
  runas: boolean
}

export function convertLocaleLog(logs: AuditLog[]) {
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i]
    const activity = log.activity
    const key = 'activity.' + activity
    const text = t(key)
    log.activity = text == key ? activity : text
    if (log.template) {
      const message = log.message
      const mKey = 'activity.@.' + message.toLowerCase().replaceAll('{}', '0').replace(/\W+/g, '_')
      const args = log.arg.map(arg => arg.value)
      const mText = t(mKey, args)
      if (mKey == mText) {
        let idx = 0
        log.message = message.replace(/\{}/g, () => {
          return args[idx++] || 'null'
        })
      } else {
        log.message = mText
      }
    }
  }
  return logs
}

export function getAuditLogs(query: PaginationQuery) {
  return axios.post<{ log: AuditLog[] }>('/audit-log/logs', {
    data: query,
    converter: (res) => {
      if (res.data.log && res.data.log.length > 0) {
        convertLocaleLog(res.data.log)
      }
      return res
    }
  })
}

export function getMyActivities(query: PaginationQuery) {
  return axios.post<{ log: AuditLog[] }>('/audit-log/my-activities', {
    data: query,
    showErrMsg: false,
    converter: (res) => {
      if (res.data.log && res.data.log.length > 0) {
        convertLocaleLog(res.data.log)
      }
      return res
    }
  })
}