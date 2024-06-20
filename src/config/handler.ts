import { gotoLoginPage, gotoPage } from '@/router'
import { defineHandler, type RequestConfig } from '@/@types'
import type { CommonResponse } from '@/@types/request'
import { msgBox } from '@/utils/msgbox'

export default defineHandler({
  onErr401({ url, next }) {
    gotoLoginPage(url, next)
  },
  onErr429({ url }) {
    console.warn('request "' + url + '" is too fast')
  },
  onErr801(event) {
    event.suppress = true
    gotoPage('mfaSetupUrl')
    return true
  },
  onErr802(event) {
    event.suppress = true
    gotoPage('mfaVerifyUrl')
    return true
  },
  onErr810(event) {
    event.suppress = true
    console.error('AccessToken 过期啦')
    return true
  },
  onErr813(event) {
    event.suppress = true
    gotoPage('resetPwdUrl', event.url, event.next)
    return true
  },
  beforeRequest(options: RequestConfig): RequestConfig {
    return options
  },
  showTipMessage(success: boolean, type, message: string) {
    if (type == 'none') return
    if (success) {
      typeof msgBox[0][type] === 'function' && msgBox[0][type](message)
    } else {
      typeof msgBox[1][type] === 'function' && msgBox[1][type](message)
    }
  },
  encrypt(data: any): string {
    throw new Error('encrypt not implemented')
  },
  decrypt(data: string): CommonResponse {
    throw new Error('decrypt not implemented')
  }
})
