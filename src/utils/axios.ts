import type { NavigationGuardNext } from 'vue-router'
import axios, { AxiosError } from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { v4 as uuid_v4 } from 'uuid'

import type { RequestOptions, RequestConfig, CommonResponse, GtwOptions, ErrorEvent } from '@/@types'
import settings from '@/config/settings'
import { language } from '@/utils/lang'
import { isObject } from '@/utils'
import { user, logout } from '@/stores/user'
import handlers from '@/config/handler'
import { notify, toast, alert } from '@/utils/msgbox'

// ======================================================
// 以下代码可以修改错误提示
// ======================================================
const notifyErr = (message: string, title?: string) => {
  notify({
    duration: 10000,
    title: title || window.i18n.t('alert.error'),
    message: message,
    type: 'error',
    position: 'top-right'
  })
}
const notifyMsg = (message: string, title?: string) => {
  notify({
    duration: 3000,
    title: title || window.i18n.t('alert.success'),
    message: message,
    type: 'success',
    position: 'top-right'
  })
}
// 这里修改错误提示
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
// 这里修改错误toast
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

// ======================================================
// 以下代码请谨慎修改
// ======================================================
const setting = settings
const bearer = setting.tokenBearer ? setting.tokenBearer + ' ' : ''
const gotoLoginPage = (url?: string, next?: NavigationGuardNext) => {
  handlers.onLogin({
    url: url,
    next: next
  })
}
const gotoResetPasswordPage = (url?: string, next?: NavigationGuardNext) => {
  handlers.onResetPassword({
    url: url,
    next: next
  })
}
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
// 合并axios配置
const mergeCfg = (cfg: string | GtwOptions, transformResponse?: ((data: any) => any) | ((data: any) => any)[]) => {
  if (typeof cfg === 'string') {
    cfg = { baseURL: cfg }
  }
  if (cfg.transformResponse) {
    if (!Array.isArray(cfg.transformResponse)) {
      cfg.transformResponse = [cfg.transformResponse]
    }
  } else {
    cfg.transformResponse = []
  }
  if (transformResponse) {
    if (Array.isArray(transformResponse)) {
      for (let i = 0; i < transformResponse.length; i++) {
        cfg.transformResponse.push(transformResponse[i])
      }
    } else {
      cfg.transformResponse.push(transformResponse)
    }
  }
  if (cfg.transformResponse.length == 0) {
    delete cfg.transformResponse
  }
  return cfg
}
// 请求预处理
const requestFn = (config: InternalAxiosRequestConfig & RequestOptions) => {
  if (settings.tokenHeaderName && user.value.accessToken && config.login !== false) {
    config.headers[settings.tokenHeaderName] = bearer + user.value.accessToken
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
  const data = response.data
  if (response.config.showErrMsg !== false && isObject(data)) {
    const msgType = ((data.type || 'toast') as string).toLowerCase()

    if (typeof data.errCode != 'undefined' && msgType !== 'none') {
      const msg = ((data.errMsg || data.message || '') as string).trim()
      if (msg) {
        if (data.errCode === 0 || data.errCode === '0') {
          typeof msgBox[0][msgType] === 'function' && msgBox[0][msgType](msg)
        } else {
          typeof msgBox[1][msgType] === 'function' && msgBox[1][msgType](msg)
        }
      }
    }
  }

  if (typeof response.config.converter == 'function') {
    response.result = response.config.converter(data)
  } else {
    response.result = data
  }

  return response
}
// 响应错误处理
const responseErr = async (err: AxiosError) => {
  //@ts-ignore
  const t: (str: string, args?: any) => string = window.i18n.t
  if (err.response) {
    console.debug('响应出错[1]: ', err.config?.url, err)
    const status = err.response.status
    const data = (err.response.data || { errCode: 500 }) as CommonResponse
    if (status != 401) {
      if (typeof data == 'object' && !Array.isArray(data)) {
        const errCode = Math.abs(data.errCode || 500)
        const handlerName = 'onErr' + errCode
        const handler =
          handlers[handlerName] ||
          ((event?: any): boolean | void => {
            console.debug(handlerName, ' : ', event)
          })
        const event: ErrorEvent = {
          error: err,
          url: err.config?.url,
          data: data
        }
        err.handled = handler(event)
        if (err.config?.showErrMsg !== false && event.suppress !== true) {
          notifyErr(data.errMsg || t('network.' + status), t('alert.error'))
        }
      } else {
        if (err.config?.showErrMsg !== false) {
          notifyErr(t('network.error', [status, err.message]), t('alert.error'))
        }
      }
    } else {
      console.debug(err.config?.url, t('network.401'))
    }
  } else {
    // 没有收到服务器的响应时
    console.debug('请求出错[1]: ', err.config?.url, err)
    if (err.config?.showErrMsg !== false) {
      notifyErr(t('network.error', [0, err.message]), t('network.title'))
    }
  }
  // 1. 透传给应用，使应用可以catch到该错误
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
    const cfg = mergeCfg(gateways[gtw], settings.transformResponse)
    console.debug('Gateway:', gtw, cfg)
    instances[gtw] = axios.create(cfg)
    const interceptors = instances[gtw].interceptors
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
    notifyErr(t('network.401'), t('alert.error'))
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
  if (setting.refreshTokenApi && setting.refreshTokenApi != config.url && user.value.refreshToken) {
    console.debug('refreshing: ', config.url)
    if (!refreshing) {
      // 刷新accessToken
      refreshing = true
      console.debug('刷新accessToken: ', config.url, setting.refreshTokenApi)
      useAxios()
        .post(setting.refreshTokenApi, {
          name: user.value.name,
          accessToken: user.value.accessToken,
          refreshToken: user.value.refreshToken
        })
        .then((resp) => {
          console.debug('刷新AccessToken请求完成: ', config.url, resp.data)
          if (resp.data && resp.data.errCode === 0) {
            for (const f in resp.data.data) {
              user.value[f] = resp.data.data[f]
            }
            refreshing = false
            if (user.value.credentialsExpired) {
              return gotoResetPasswordPage()
            }
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
      // 防抖处理（每隔100ms重试）
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
      }, 100)
    }
  } else {
    // 未配置刷新功能或登录地址
    console.debug('不满足刷新条件', config.url)
    refreshTokenError(err, reject)
  }
}
// 请求过快
const onRequestTooFast = handlers.onRequestTooFast

export type AxiosResponseWithResult<T, D> = AxiosResponse<T, D> & { result: T }

// 代理类
class AxiosProxy {
  private axios: AxiosInstance
  private debounceMap: Set<string>

  constructor(axios: AxiosInstance) {
    this.axios = axios
    this.debounceMap = new Set<string>()
  }

  get<T = any, D = any>(url: string, config?: RequestConfig): Promise<AxiosResponseWithResult<T, D>> {
    config = config || {}
    config.url = url
    config.method = 'get'
    return this.request(config)
  }

  post<T = any, D = any>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponseWithResult<T, D>> {
    config = config || {}
    config.url = url
    config.data = data
    config.method = 'post'
    return this.request(config)
  }

  put<T = any, D = any>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponseWithResult<T, D>> {
    config = config || {}
    config.url = url
    config.data = data
    config.method = 'put'
    return this.request(config)
  }

  patch<T = any, D = any>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponseWithResult<T, D>> {
    config = config || {}
    config.url = url
    config.data = data
    config.method = 'patch'
    return this.request(config)
  }

  delete<T = any, D = any>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponseWithResult<T, D>> {
    config = config || {}
    config.url = url
    config.data = data
    config.method = 'delete'
    return this.request(config)
  }

  request<T = any, D = any>(config: RequestConfig): Promise<AxiosResponseWithResult<T, D>> {
    const url = config.url || ''
    if (setting.debounce !== false) {
      if (this.debounceMap.has(url)) {
        return new Promise<AxiosResponse<T, D>>((resolve, reject) => {
          const err = new AxiosError('Too Fast Requests', 'TOO_FAST')
          onRequestTooFast({ error: err, url: url })
          reject(err)
        })
      }
      this.debounceMap.add(url)
    }

    if (!config.headers) {
      config.headers = { 'Accept': 'application/json' }
    } else if (!config.headers['Accept']) {
      config.headers['Accept'] = 'application/json'
    }

    return new Promise<AxiosResponse<T, D>>((resolve, reject) => {
      this.axios
        .request(config)
        .then(resolve)
        .catch((err) => {
          if (err.response) {
            const cfg = err.config || config
            if (err.response.status == 401 && cfg.autoRefresh !== false) {
              return refreshToken(this, err, config, resolve, reject)
            }
          }
          // 2. 透传给应用，让应用可以catch该错误.
          if (err.handled !== true) {
            reject(err)
          }
        })
        .finally(() => {
          this.debounceMap.delete(url)
          console.debug('Complete ' + url)
        })
    })
  }
}

export default function useAxios(gtw?: string): AxiosProxy {
  return new AxiosProxy(instances[gtw || 'default'])
}
