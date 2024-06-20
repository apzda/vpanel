import { v4 as uuid_v4 } from 'uuid'

import { gotoLoginPage, gotoPage } from '@/router'
import { defineHandler, type RequestConfig } from '@/@types'
import type { CommonResponse, ErrorEvent } from '@/@types/request'
import { language } from '@/utils/lang'
import { msgBox } from '@/utils/msgbox'

import settings from '@/config/settings'
import { user } from '@/stores/user'

// 持票人
const bearer = settings.tokenBearer ? settings.tokenBearer + ' ' : ''

// 刷新AccessToken
const refreshAccessToken = (event: ErrorEvent) => {
  // todo 刷新AccessToken吧
}

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
    refreshAccessToken(event)
    return true
  },
  onErr813(event) {
    event.suppress = true
    gotoPage('resetPwdUrl', event.url, event.next)
    return true
  },
  beforeRequest(options: RequestConfig): RequestConfig {
    options.headers = options.headers || {}

    if (!user.value.uuid) {
      user.value.uuid = uuid_v4()
    }
    options.headers['uuid'] = user.value.uuid

    if (settings.tokenHeaderName && user.value.accessToken && options.login !== false) {
      options.headers[settings.tokenHeaderName] = bearer + user.value.accessToken
    }

    options.headers['Accept-Language'] = language.value

    if (options.method?.toLowerCase() == 'get') {
      options.params = {
        _t: new Date().getTime(),
        ...options.params
      }
    }

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
