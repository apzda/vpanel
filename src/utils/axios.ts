import axios, { AxiosError } from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { v4 as uuid_v4 } from 'uuid'

import type { RequestOptions, RequestConfig } from '@/@types'
import settings from '@/config/settings'
import { language } from '@/utils/lang'
import { user, logout } from '@/stores/user'
import { gotoLoginPage } from '@/router'
import { notify, toast, alertx } from '@/utils/msgbox'

// 这里修改错误通知
const notifyErr = (message: string, title?: string) => {
  notify({
    duration: 0,
    title: title,
    message: message,
    type: 'error',
    position: 'top-right'
  })
}
const notifyMsg = (message: string, title?: string) => {
  notify({
    duration: 2000,
    title: title,
    message: message,
    type: 'success',
    position: 'top-right'
  })
}
// 这里修改错误提示
const alertErr = (message: string) => {
  alertx({
    message: message,
    // @ts-ignore
    title: window.i18n.t('alert.error'),
    type: 'error'
  })
}

const alertMsg = (message: string) => {
  alertx({
    message: message,
    // @ts-ignore
    title: window.i18n.t('alert.success'),
    type: 'success'
  })
}
// 这里修改错误toast
const toastErr = (message: string) => {
  toast({
    duration: 0,
    showClose: true,
    message: message,
    type: 'error'
  })
}

const toastMsg = (message: string) => {
  toast({
    duration: 2000,
    showClose: true,
    message: message,
    type: 'success'
  })
}

// ======================================================
// 以下代码请谨慎修改
// ======================================================
const setting = settings
const bearer = setting.tokenBearer ? setting.tokenBearer + ' ' : ''

const msgBox: {
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
// 请求预处理
const requestFn = (config: InternalAxiosRequestConfig & RequestOptions) => {
  console.debug('开始请求:', config.url)

  if (settings.tokenHeaderName && user.value.token && config.login !== false) {
    // console.debug('Bearer: ', bearer)
    config.headers[settings.tokenHeaderName] = bearer + user.value.token
  }

  config.headers['Accept-Language'] = language.value

  if (!user.value.uuid) {
    user.value.uuid = uuid_v4()
  }

  config.headers['uuid'] = user.value.uuid

  if (config.method == 'get') {
    config.params = {
      _t: new Date().getTime(),
      ...config.params
    }
  }

  return config
}
// 发起请求错误处理，例如没网啦
const requestErr = (err: AxiosError) => {
  //@ts-ignore
  const t: (str: string) => string = window.i18n.t

  notifyErr(t('network.error'))
  console.debug('发起请求时出错啦: ', err)
  // 在这里进行网络错误处理
  return Promise.reject(err)
}
// 响应回调处理
const responseFn = (response: AxiosResponse) => {
  console.debug('收到响应', response.config.url, response)
  // 在这里进行能用的应用错误处理
  if (response.data) {
    const data = response.data
    const isObj = typeof data == 'object' && !Array.isArray(data)
    if (isObj) {
      const msgType = ((data.type || 'toast') as string).toLowerCase()

      if (typeof data.errCode != 'undefined' && msgType !== 'none') {
        let msg = ((data.errMsg || data.message || '') as string).trim()
        if (msg) {
          if (data.errCode === 0) {
            typeof msgBox[0][msgType] === 'function' && msgBox[0][msgType](msg)
          } else {
            typeof msgBox[1][msgType] === 'function' && msgBox[1][msgType](msg)
          }
        }
      }
    }
  }
  return response
}
// 响应错误处理
const responseErr = async (err: AxiosError) => {
  //@ts-ignore
  const t: (str: string, args?: any) => string = window.i18n.t
  if (err.response) {
    console.debug('响应出错[1]: ', err.config?.url, err)
    // 处理非401错误，因为401错误是由AccessToken防抖处理器处理
    if (err.response.status != 401) {
      // 在这里进行网络错误处理（不包括401)
      const status = err.response.status
      switch (status) {
        case 400:
        case 403:
        case 404:
        case 405:
        case 406:
        case 429:
        case 500:
        case 501:
        case 502:
        case 503:
        case 504:
          notifyErr(t('network.' + status), t('network.title'))
          break
        default:
          notifyErr(t('network.error', [status, err.message]), t('network.title'))
      }
    }
  } else {
    // 没有收到服务器的响应时
    console.debug('请求出错[1]: ', err.config?.url, err)
    notifyErr(t('network.error', [0, err.message]), t('network.title'))
  }

  return Promise.reject(err)
}

axios.interceptors.request.use(requestFn, requestErr)
axios.interceptors.response.use(responseFn, responseErr)

const instances: {
  [ins: string]: AxiosInstance
} = {}

if (Object.keys(instances).length == 0) {
  const gateways = settings.gtw
  for (const gtw in gateways) {
    const cfg = gateways[gtw]
    console.debug('Gateway:', gtw, cfg)
    if (typeof cfg === 'string') {
      instances[gtw] = axios.create({
        baseURL: cfg
      })
    } else {
      instances[gtw] = axios.create(cfg)
    }

    let interceptors = instances[gtw].interceptors
    interceptors.request.use(requestFn, requestErr)
    interceptors.response.use(responseFn, responseErr)
  }
}

let refreshing: boolean = false
// 刷新accessToken出错处理函数
const refreshTokenError = (err: AxiosError, reject: (err: any) => void) => {
  // 刷新token失败
  logout()
  refreshing = false
  if (setting.loginUrl) {
    console.debug('刷新accessToken失败, 转到登录页: ', err.config?.url, setting.loginUrl)
    gotoLoginPage()
  } else {
    //todo
    console.error(err)
    reject(err)
  }
}

// 刷新accessToken
const refreshToken = (
  axios: AxiosProxy,
  err: AxiosError,
  config: RequestConfig,
  resolve: (data: any) => any,
  reject: (reason?: any) => void
) => {
  console.debug('refreshToken[1]: ', config.url, err)
  if (err.response && err.response.status === 401) {
    if (setting.refreshTokenApi && setting.refreshTokenApi != config.url && user.value.refreshToken) {
      console.log('refreshing: ', config.url)
      if (!refreshing) {
        // 刷新accessToken
        refreshing = true
        console.debug('刷新accessToken: ', config.url, setting.refreshTokenApi)
        useAxios()
          .post(setting.refreshTokenApi, {
            accessToken: user.value.token,
            refreshToken: user.value.refreshToken
          })
          .then((resp) => {
            console.debug('刷新AccessToken请求完成: ', config.url, resp.data)
            if (resp.data && resp.data.errCode === 0) {
              // accessToken刷新完成, 重放请求
              user.value.refreshToken = resp.data.data.refreshToken
              user.value.token = resp.data.data.accessToken
              refreshing = false
              console.debug('重放请求[1]: ', config.url, config)
              axios.request(config).then(resolve).catch(reject)
            } else {
              //未知响应格式
              console.warn('刷新accessToken失败[响应]: ', config.url, resp.data)
              refreshTokenError(err, reject)
            }
          })
          .catch((ex) => {
            console.warn('刷新accessToken失败[网络]: ', config.url, ex)
            refreshTokenError(err, reject)
          })
      } else {
        // 防抖处理（每隔250ms重试）
        console.debug('等待accessToken刷新[1]: ', config.url)
        const timer = setInterval(() => {
          if (user.value.refreshToken) {
            if (!refreshing) {
              // accessToken刷新完成, 重放请求
              console.debug('重放请求[2]: ', config.url, config)
              axios.request(config).then(resolve).catch(reject)
              clearInterval(timer)
            } else {
              // 此时刷新还没有完成，需要等待
              console.debug('等待accessToken刷新[2]: ', config.url)
            }
          } else {
            clearInterval(timer)
            // 刷新accessToken失败了, 此时应该已经跳转到登录页了
            console.warn('等待刷新accessToken失败, 停止等待: ', config.url)
            refreshTokenError(err, reject)
          }
        }, 200)
      }
    } else {
      // 未配置刷新功能或登录地址
      console.debug('不满足刷新条件', config.url)
      refreshTokenError(err, reject)
    }
  } else {
    // 响应码不是401
    console.debug('响应码不是401: ', config.url)
    // todo
    console.error(err)
    logout()
    reject(err)
  }
}
// 代理类
class AxiosProxy {
  private axios: AxiosInstance
  private debounces: Set<string>

  constructor(axios: AxiosInstance) {
    this.axios = axios
    this.debounces = new Set<string>()
    //this.debounces.add('/data')
  }
  get<T = any, D = any>(url: string, config?: RequestConfig): Promise<AxiosResponse<T, D>> {
    config = config || {}
    config.url = url
    config.method = 'get'
    return this.request(config)
  }
  post<T = any, D = any>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponse<T, D>> {
    config = config || {}
    config.url = url
    config.data = data
    config.method = 'post'
    return this.request(config)
  }
  put<T = any, D = any>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponse<T, D>> {
    config = config || {}
    config.url = url
    config.data = data
    config.method = 'put'
    return this.request(config)
  }
  patch<T = any, D = any>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponse<T, D>> {
    config = config || {}
    config.url = url
    config.data = data
    config.method = 'patch'
    return this.request(config)
  }
  delete<T = any, D = any>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponse<T, D>> {
    config = config || {}
    config.url = url
    config.data = data
    config.method = 'delete'
    return this.request(config)
  }
  request<T = any, D = any>(config: RequestConfig): Promise<AxiosResponse<T, D>> {
    const url = config.url || ''
    if (setting.debounce !== false) {
      if (this.debounces.has(url)) {
        return new Promise<AxiosResponse<T, D>>((resolve, reject) => {
          const err = new AxiosError('Too Fast Requests', 'TOO_FAST')
          // todo
          console.error(err)
          reject(err)
        })
      }
      this.debounces.add(url)
    }
    // 刷新
    return new Promise<AxiosResponse<T, D>>((resolve, reject) => {
      this.axios
        .request(config)
        .then(resolve)
        .catch((err) => {
          if (config.autoRefresh !== false) {
            refreshToken(this, err, config, resolve, reject)
          } else {
            // todo
            console.error(err)
            reject(err)
          }
        })
        .finally(() => {
          this.debounces.delete(url)
          console.debug('Complete ' + url)
        })
    })
  }
}

export default function useAxios(gtw?: string): AxiosProxy {
  return new AxiosProxy(instances[gtw || 'default'])
}

export type CommonResponse = {
  errCode: number
  errMsg?: string
  message?: string
  type?: 'TOAST' | 'NOTIFY' | 'ALERT' | 'NONE' | string
}

export type Response<T, D = any> = Promise<AxiosResponse<CommonResponse & { data?: T }, D>>

export type FlatResponse<T extends CommonResponse, D = any> = Promise<AxiosResponse<T, D>>