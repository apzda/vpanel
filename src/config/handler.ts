import { v4 as uuid_v4 } from 'uuid'
import { currentPage, gotoLoginPage, gotoPage } from '@/router'
import { defineHandler, type RequestConfig } from '@/@types'
import type { CommonResponse, ErrorEvent } from '@/@types/request'
import { language } from '@/utils/lang'
import { msgBox } from '@/utils/msgbox'
import settings from '@/config/settings'
import { logout, refresh, user, type UserInfo } from '@/stores/user'

import useAxios from '@/utils/axios'

// 持票人
const bearer = settings.tokenBearer ? settings.tokenBearer + ' ' : ''

let refreshing = false
let timer: any = 0

const defaultReject = () => {
}

const defaultResolve = () => {
}

const refreshFailed = (event: ErrorEvent) => {
  logout()
  if (settings.loginUrl) {
    if (!currentPage.value.startsWith(settings.loginUrl) && !timer) {
      // 去登录页
      timer = setTimeout(() => {
        timer = 0
        gotoLoginPage(currentPage.value, event.next)
      }, 50)
    } else {
      console.warn('skip going to login page:', event.url)
    }
  } else if (event.reject) {
    // 直接拒绝
    event.reject(event)
  }
}

// 刷新AccessToken
const refreshAccessToken = (event: ErrorEvent) => {
  if (!event.url) return

  const axios = useAxios()
  const options = event.options
  const rejectFunc = event.reject || defaultReject
  const resolveFunc = event.resolve || defaultResolve
  event.reject = rejectFunc

  if (!settings.refreshTokenApi || !user.value.accessToken || !user.value.refreshToken) {
    refreshFailed(event)
    return
  }

  if (refreshing) {
    // 防抖处理（每隔100ms重试）
    console.debug('等待新的Token: ', event.url)
    const timer = setInterval(() => {
      if (user.value.refreshToken) {
        if (!refreshing) {
          clearInterval(timer)
          if (event.url) {
            // accessToken刷新完成, 重放请求
            const realAxios = event.axios || axios
            console.debug('重放请求[1]: ', event.url)
            realAxios.request(event.url, options?.method || 'POST', options).then(resolveFunc).catch(rejectFunc)
          }
        } else {
          // 此时刷新还没有完成，需要等待
          console.debug('accessToken刷新未完成，等待...', event.url)
        }
      } else {
        clearInterval(timer)
        // 刷新accessToken失败了, 此时应该已经跳转到登录页了
        console.warn('等待accessToken刷新失败, 停止等待: ', event.url)
        refreshFailed(event)
      }
    }, 100)
  } else {
    refreshing = true
    console.debug('开始刷新Token: ', event.url)
    axios.doRequest<UserInfo>(settings.refreshTokenApi, 'POST', {
      data: {
        name: user.value.name,
        accessToken: user.value.accessToken,
        refreshToken: user.value.refreshToken
      },
      login: false
    }).then(({ data }) => {
      console.debug('Token刷新成功:', event.url)
      if (refresh(data, event) && event.url) {
        console.debug('重放请求[0]:', event.url)
        const realAxios = event.axios || axios
        realAxios.request(event.url, options?.method || 'POST', options).then(resolveFunc).catch(rejectFunc)
      }
    }).catch(err => {
      refreshFailed(err)
    }).finally(() => {
      refreshing = false
    })
  }
}

export default defineHandler({
  onErr401(event) {
    event.suppress = true
    refreshFailed(event)
    return true
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

    if (options.login !== false && settings.tokenHeaderName && user.value.accessToken) {
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
    console.warn('plain data: ', data)
    throw new Error('encrypt not implemented')
  },
  decrypt(data: string): CommonResponse {
    console.error('encrypted data:', data)
    throw new Error('decrypt not implemented')
  }
})
