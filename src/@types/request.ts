import type { NavigationGuardNext } from 'vue-router'
import type { RequestConfig } from '@/@types/index'

export interface Response {
  data: any;
  statusCode: number;
  header: { [key: string]: string };
  cookies?: string[]
}

export interface CommonResponse<T = any> {
  errCode: number | string
  errMsg?: string
  message?: string
  type?: 'TOAST' | 'NOTIFY' | 'ALERT' | 'NONE' | string
  data?: T
}

// 网络请求错误事件
export interface ErrorEvent extends CommonResponse {
  url?: string
  next?: NavigationGuardNext
  suppress?: boolean
  options: RequestConfig
  axios: IAxios
  resolve: ((data: CommonResponse) => any)
  reject: ((err: ErrorEvent) => any)
}

export type SuccessHandler<T> = (data: (T | PromiseLike<T>)) => void

export type RejectHandler = (error: CommonResponse) => void

export interface IAxios {
  post: <T = any>(api: string, options?: RequestConfig) => Promise<CommonResponse<T>>
  get: <T = any>(api: string, options?: RequestConfig) => Promise<CommonResponse<T>>
  delete: <T = any>(api: string, options?: RequestConfig) => Promise<CommonResponse<T>>
  put: <T = any>(api: string, options?: RequestConfig) => Promise<CommonResponse<T>>
  patch: <T = any>(api: string, options?: RequestConfig) => Promise<CommonResponse<T>>
  encrypted: <T = any>(api: string, options?: RequestConfig) => Promise<CommonResponse<T>>

  request<T = any>(api: string, method: string, options?: RequestConfig): Promise<CommonResponse<T>>
}