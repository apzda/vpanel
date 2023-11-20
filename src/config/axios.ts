import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'

// @ts-ignore
import { v4 as uuidv4 } from 'uuid'

import settings from './settings'
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
const setting = settings as Settings
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

const requestFn = (config: InternalAxiosRequestConfig & { login?: false }) => {
  console.debug('开始请求:', config.url)

  if (user.value.token && config.login !== false) {
    // console.debug('Bearer: ', bearer)
    config.headers[settings.tokenHeaderName] = bearer + user.value.token
  }

  config.headers['Accept-Language'] = language.value

  if (config.method == 'get') {
    config.params = {
      _t: new Date().getTime(),
      ...config.params
    }
  }

  if (!user.value.uuid) {
    user.value.uuid = uuidv4()
  }

  config.headers['uuid'] = user.value.uuid

  return config
}

const requestErr = (err: AxiosError) => {
  //@ts-ignore
  const t: (str: string) => string = window.i18n.t

  notifyErr(t('network.error'))
  console.debug('发起请求时出错啦: ', err)
  // 在这里进行网络错误处理
  return Promise.reject(err)
}

const responseFn = (response: AxiosResponse) => {
  console.debug('响应', response.config.url, response)
  // 在这里进行能用的应用错误处理
  if (response.data) {
    const data = response.data
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
  return response
}

const responseErr = async (err: AxiosError) => {
  //@ts-ignore
  const t: (str: string, args?: any) => string = window.i18n.t
  if (err.response) {
    console.debug('响应出错[1]: ', err.config?.url, err)
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
  const gtws = settings.gtw
  for (const gtw in gtws) {
    // @ts-ignore
    const cfg = gtws[gtw]
    console.debug('Gateway:', gtw, cfg)
    if (typeof cfg === 'string') {
      instances[gtw] = axios.create({
        baseURL: cfg
      })
    } else {
      instances[gtw] = axios.create(cfg)
    }

    instances[gtw].interceptors.request.use(requestFn, requestErr)
    instances[gtw].interceptors.response.use(responseFn, responseErr)
  }
}

let debouncing: boolean = false

// 防抖错误处理函数
const debounceErrorFn = (err: AxiosError, reject: (err: any) => void) => {
  // 刷新token失败
  logout()
  debouncing = false
  if (setting.loginUrl) {
    console.debug('刷新accessToken失败, 转到登录页: ', err.config?.url, setting.loginUrl)
    gotoLoginPage()
  } else {
    reject(err)
  }
}

type NoLogin = { login?: false }

// 防抖 - 刷新accessToken
const debounce = (
  axios: AxiosProxy,
  err: AxiosError,
  config: AxiosRequestConfig & NoLogin,
  resolve: (data: any) => any,
  reject: (reason?: any) => void
) => {
  console.debug('响应出错[2]: ', config.url, err)
  if (err.response && err.response.status === 401) {
    if (setting.refreshTokenApi && user.value.refreshToken) {
      console.log('Debouncing: ', config.url)
      if (!debouncing) {
        // 刷新accessToken
        debouncing = true
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
              debouncing = false
              console.debug('重放请求[1]: ', config.url, config)
              axios.request(config).then(resolve).catch(reject)
            } else {
              //未知响应格式
              console.warn('刷新accessToken失败[响应]: ', config.url, resp.data)
              debounceErrorFn(err, reject)
            }
          })
          .catch((errx) => {
            console.warn('刷新accessToken失败[网络]: ', config.url, errx)
            debounceErrorFn(err, reject)
          })
      } else {
        // 防抖处理（每隔250ms重试）
        console.debug('等待accessToken刷新[1]: ', config.url)
        const timer = setInterval(() => {
          if (user.value.refreshToken) {
            if (!debouncing) {
              // accessToken刷新完成, 重放请求
              console.debug('重放请求[2]: ', config.url, config)
              axios.request(config).then(resolve).catch(reject)
              clearInterval(timer)
            } else {
              // 此时刷新还没有完成，需要等待
              console.debug('等待accessToken刷新[2]: ', config.url)
            }
          } else {
            console.warn('等待刷新accessToken失败, 停止等待: ', config.url)
            // 刷新accessToken失败了, 此时应该已经跳转到登录页了
            clearInterval(timer)
            if (!setting.loginUrl) {
              console.debug('未配置登录地址, 抛出错误: ', config.url)
              reject(err)
            }
          }
        }, 250)
      }
    } else if (setting.loginUrl) {
      console.debug('刷新功能不可用，直接跳转到登录页:', config.url)
      logout()
      gotoLoginPage()
    } else {
      // 未配置刷新功能或登录地址
      console.debug('未配置登录地址:', config.url)
      reject(err)
    }
  } else {
    // 响应码不是401
    console.debug('响应码不是401: ', config.url)
    reject(err)
  }
}

class AxiosProxy {
  private axios: AxiosInstance
  constructor(axios: AxiosInstance) {
    this.axios = axios
  }
  get(url: string, config?: AxiosRequestConfig & NoLogin): Promise<AxiosResponse<any, any>> {
    config = config || {}
    config.url = url
    config.method = 'get'
    return this.request(config)
  }
  post(url: string, data?: any, config?: AxiosRequestConfig & NoLogin): Promise<AxiosResponse<any, any>> {
    config = config || {}
    config.url = url
    config.data = data
    config.method = 'post'
    return this.request(config)
  }
  put(url: string, data?: any, config?: AxiosRequestConfig & NoLogin): Promise<AxiosResponse<any, any>> {
    config = config || {}
    config.url = url
    config.data = data
    config.method = 'put'
    return this.request(config)
  }
  patch(url: string, data?: any, config?: AxiosRequestConfig & NoLogin): Promise<AxiosResponse<any, any>> {
    config = config || {}
    config.url = url
    config.data = data
    config.method = 'patch'
    return this.request(config)
  }
  delete(url: string, data?: any, config?: AxiosRequestConfig & NoLogin): Promise<AxiosResponse<any, any>> {
    config = config || {}
    config.url = url
    config.data = data
    config.method = 'delete'
    return this.request(config)
  }
  request(config: AxiosRequestConfig & NoLogin): Promise<AxiosResponse<any, any>> {
    return new Promise<AxiosResponse<any, any>>((resolve, reject) => {
      this.axios
        .request(config)
        .then(resolve)
        .catch((err) => {
          debounce(this, err, config, resolve, reject)
        })
    })
  }
}

export default function useAxios(gtw?: string): AxiosProxy {
  return new AxiosProxy(instances[gtw || 'default'])
}

export type Response<T> = {
  errCode: number
  errMsg?: string
  message?: string
  type?: 'TOAST' | 'NOTIFY' | 'ALERT' | 'NONE' | string
  data?: T
}
