import type { CommonResponse, ErrorEvent, IAxios, RejectHandler, SuccessHandler } from '@/@types/request'
import { ERR_CODES } from '@/@types/request'

import type { ErrHandlerName, GtwOptions, RequestConfig } from '@/@types'
import setting from '@/config/settings'
import settings from '@/config/settings'
import handler from '@/config/handler'
import { deepClone, isObject } from '@/utils'
import { t, ts } from './i18n'
import axios, { AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { trimEnd, trimStart } from 'lodash-es'

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
const requestFn = (config: InternalAxiosRequestConfig & RequestConfig) => {
  return handler.beforeRequest(config)
}
// 网关配置列表
const gateways = (setting.gtw || {}) as { [k: string]: GtwOptions }
// Axios实例
const instances: {
  [ins: string]: AxiosInstance
} = {}

if (Object.keys(instances).length == 0) {
  const gateways = settings.gtw
  for (const gtw in gateways) {
    const cfg = mergeCfg(gateways[gtw], settings.transformResponse)
    // console.debug('Gateway:', gtw, cfg)
    instances[gtw] = axios.create(cfg)
    const interceptors = instances[gtw].interceptors
    //@ts-ignore
    interceptors.request.use(requestFn)
  }
}
// 默认错误处理器
const emptyHandler = (event: ErrorEvent) => {
  event.suppress = true
  showMessage(event, event.options, false)
}

// 请求代理类
export class RequestProxy implements IAxios {
  private readonly gtw: string
  private readonly options: RequestConfig
  private readonly debounceMap: Set<string>
  private readonly apiBase: string
  private readonly axios: AxiosInstance

  constructor(gtw: string, options: GtwOptions) {
    this.gtw = gtw
    this.options = options
    this.debounceMap = new Set<string>()
    this.apiBase = trimEnd(options.baseURL, '/') + '/'
    this.axios = instances[gtw]
  }

  // POST 请求
  post<T = any>(api: string, options?: RequestConfig): Promise<CommonResponse<T>> {
    return this.request<T>(api, 'POST', options)
  }

  // GET 请求
  get<T = any>(api: string, options?: RequestConfig): Promise<CommonResponse<T>> {
    return this.request<T>(api, 'GET', options)
  }

  // DELETE 请求
  delete<T = any>(api: string, options?: RequestConfig): Promise<CommonResponse<T>> {
    return this.request<T>(api, 'DELETE', options)
  }

  // PUT 请求
  put<T = any>(api: string, options?: RequestConfig): Promise<CommonResponse<T>> {
    return this.request<T>(api, 'PUT', options)
  }

  // PATCH 请求
  patch<T = any>(api: string, options?: RequestConfig): Promise<CommonResponse<T>> {
    return this.request<T>(api, 'PATCH', options)
  }

  // 加密请求
  encrypted<T = any>(api: string, options?: RequestConfig): Promise<CommonResponse<T>> {
    options = options || {}
    options.headers = options.headers || {}

    delete options.headers['Content-Type']
    delete options.headers['Accept']

    options.headers['content-type'] = 'application/encrypted+json'
    options.headers['accept'] = 'application/encrypted+json'

    if (typeof options.data != 'undefined') {
      options.data = handler.encrypt(options.data)
    } else {
      options.data = handler.encrypt({})
    }

    return this.request<T>(api, 'POST', options)
  }

  // 发起查询
  request<T = any>(api: string, method: string, options?: RequestConfig): Promise<CommonResponse<T>> {
    const that = this
    options = options || ({} as RequestConfig)
    options.headers = options.headers || {}

    if (!options.headers['Content-Type'] || !options.headers['content-type']) {
      if (options.data) {
        options.headers['Content-Type'] = 'application/json'
      }
    }
    if (!options.headers['accept'] || !options.headers['Accept']) {
      options.headers['Accept'] = 'application/json'
    }

    return new Promise<CommonResponse<T>>((resolve, reject) => {
      this.doRequest<CommonResponse<T>>(api, method, options)
        .then((response) => {
          showMessage(response, options, true)
          if (options.converter) {
            resolve(options.converter(response))
          } else {
            resolve(response)
          }
        })
        .catch((err) => {
          // console.debug('request.failure: ', err)
          {
            // redo config ==>
            err.url = api
            err.axios = that
            err.options = options
            err.resolve = resolve
            err.reject = reject
          }
          const errCode = ('onErr' + Math.abs(err.errCode)) as ErrHandlerName
          const errHandler = handler[errCode] || emptyHandler
          const handled = errHandler(err)
          if (err.suppress !== true) {
            showMessage(err, options, false)
          }
          if (handled !== true) {
            reject(err)
          }
        })
    })
  }

  doRequest<T>(api: string, method: string, options?: RequestConfig): Promise<T> {
    api = trimStart(api, '/')
    return new Promise<T>((resolve, reject) => {
      if (!api || !api.trim()) {
        reject({
          errCode: 400,
          errMsg: 'Missing required parameter "api"'
        })
      }

      options = options || {}
      const gtwCfg = this.options
      for (const cfg in gtwCfg) {
        //@ts-ignore
        if (typeof options[cfg] == 'undefined') {
          //@ts-ignore
          options[cfg] = gtwCfg[cfg]
        }
      }
      const url = this.apiBase + api
      options.url = url
      options.method = method
      if (setting.debounce !== false) {
        if (this.debounceMap.has(url)) {
          const err = {
            errCode: 429,
            errMsg: 'Too many requests'
          }
          reject(err)
          return
        }

        this.debounceMap.add(url)
      }

      options = handler.beforeRequest(options)
      //@ts-ignore
      const config = getDefaultOptions(resolve, reject, options)
      this.axios
        .request(config)
        .then((response) => {
          if (response.status == 200) {
            responseHandler(response, resolve, reject)
          } else {
            const err = new AxiosError(
              'response status is not 200',
              AxiosError.ERR_BAD_RESPONSE,
              config,
              response.request,
              response
            )
            responseErrorHandler(extractResponseData(err), reject)
          }
        })
        .catch((err) => {
          const data = extractResponseData(err)
          responseErrorHandler(data, reject)
        })
        .finally(() => {
          this.debounceMap.delete(url)
        })
    })
  }
}

// 获取默认配置
function getDefaultOptions<T>(
  resolve: SuccessHandler<T>,
  reject: RejectHandler,
  options?: InternalAxiosRequestConfig
): InternalAxiosRequestConfig {
  return (options || {}) as InternalAxiosRequestConfig
}

// 正常响应处理器
function responseHandler<T>(res: AxiosResponse, resolve: SuccessHandler<T>, reject: RejectHandler) {
  const contentType = res.headers['Content-Type'] || res.headers['content-type'] || ''

  if (contentType.startsWith('application/encrypted+json')) {
    try {
      // 解密
      res.data = handler.decrypt(res.data)
    } catch (e) {
      reject({ errCode: 1000, errMsg: 'Cannot decrypt data:' + e, data: null })
      return
    }
  }

  if (res.status == 200) {
    if (handler.transformResponse) {
      res.data = handler.transformResponse(res.data)
    }
    if (!isObject(res.data)) {
      // 响应格式错误
      reject({
        errCode: -999,
        errMsg: 'Invalid JSON data',
        data: res.data
      })
    } else if (res.data.errCode == 0) {
      // 正常响应
      resolve(res.data)
    } else {
      // 其它错误响应
      res.data.errCode = res.data.errCode || 500
      reject(res.data)
    }
  } else {
    // 其它类型错误
    if (handler.transformResponse) {
      res.data = handler.transformResponse(res.data)
    }
    if (isObject(res.data) && res.data.errCode != undefined) {
      // 其它错误响应
      reject(res.data)
    } else {
      // 网络错误
      reject({
        errCode: res.status,
        errMsg: ts('network.' + res.status, t('network.error')),
        data: res.data
      })
    }
  }
}

// 错误响应处理器
function responseErrorHandler(err: CommonResponse, reject: RejectHandler) {
  if (err.errMsg?.endsWith('timeout')) {
    err.errCode = 504
    if (!err.errMsg) {
      err.errMsg = ts('network.504', t('network.error'))
    }
  }
  reject(err)
}

// 提示
function showMessage(response: any, options: RequestConfig, success: boolean) {
  if (options.showErrMsg !== false && (response.errMsg || response.message)) {
    const errMsg = response.errMsg || response.message || ''
    const msgType = ((response.type || 'toast') as string).toLowerCase()
    if (msgType != 'none' && errMsg) {
      handler.showTipMessage(success, msgType, errMsg)
    }
  }
}

function extractResponseData(err: AxiosError): CommonResponse {
  if (err.response != undefined) {
    if (err.response.data && isObject(err.response.data)) {
      return err.response.data as CommonResponse
    } else {
      return {
        errCode: err.response.status,
        errMsg: ts('network.' + err.response.status, err.message),
        data: null
      }
    }
  }

  const code = ERR_CODES[err.code || 'error']
  return {
    errCode: code,
    errMsg: ts('network.' + code, t('network.error')),
    data: null
  }
}

// 入口
export default function useAxios(gtw: string = 'default'): RequestProxy {
  const gtwCfg = (gateways[gtw || 'default'] || { baseURL: '/' }) as GtwOptions
  return new RequestProxy(gtw || 'default', deepClone(gtwCfg))
}
