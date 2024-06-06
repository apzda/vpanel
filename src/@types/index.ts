import type { InjectionKey, Ref } from 'vue'
import type { RouteRecordRaw, NavigationGuardNext } from 'vue-router'
import type { AxiosRequestConfig } from 'axios'
import { AxiosError } from 'axios'

// 网关选项
export interface GtwOptions {
  baseURL?: string
  timeout?: number
  withCredentials?: boolean
  responseType?: 'arraybuffer' | 'document' | 'json' | 'text' | 'stream'
  headers?: {
    [h: string]: string
  }
  responseEncoding?: string
  xsrfCookieName?: string
  xsrfHeaderName?: string
  transformResponse?: ((response: any) => any) | ((response: any) => any)[]
}

// 配置选项
export interface Settings {
  [index: string]: any

  loginUrl?: string // 登录地址
  activeUrl?: string // 激活地址
  resetPwdUrl?: string // 重置密码地址
  mfaSetupUrl?: string // 设置多因素认证地址
  mfaVerifyUrl?: string // 多因素认证地址
  registerUrl?: string // 注册地址
  logoutApi?: string // 退出接口
  refreshTokenApi?: string // 刷新TOKEN接口
  switchToApi?: string // 切换到用户
  switchBackApi?: string // 切回原用户
  fromArg?: string // 来源URL
  rolePrefix?: string
  simulator?: string
  transformResponse?: ((response: any) => any) | ((response: any) => any)[]
  tokenHeaderName?: string
  tokenBearer?: string
  whiteList: string[]
  gtw: {
    [gtw: string]: string | GtwOptions
    default: string | GtwOptions
  }
  debounce?: boolean
  language?: string
  logo?: string
  languages: {
    [lang: string]: {
      name: string
      flag?: string
    }
  }
}

// 菜单参数
export interface MenuOption {
  data: any
  t: (str: string) => string
}

// 菜单选项
export interface MenuItem {
  id?: string
  name?: string | ((ctx: MenuOption) => string)
  path?: string
  title?: string | ((ctx: MenuOption) => string)
  icon?: any
  badge?: number | ((ctx: MenuOption) => number)
  color?: any
  sort?: number | ((ctx: MenuOption) => number)
  hidden?: boolean | ((ctx: MenuOption) => number)
  level?: number
  login?: false
  authorities?: string[] | string
  roles?: string[] | string
}

// 网络请求错误事件
export interface ErrorEvent {
  url?: string
  next?: NavigationGuardNext
  data?: CommonResponse
  error?: AxiosError
  suppress?: boolean
}

// 网络请求错误处理器
export interface Handlers {
  [event: string]: (event: ErrorEvent) => boolean | void

  onLogin: (event: ErrorEvent) => void
  onResetPassword: (event: ErrorEvent) => void
  onRequestTooFast: (event: ErrorEvent) => void
}

// 扩展选项
export type RequestOptions = { login?: false; autoRefresh?: false; showErrMsg?: false, converter: (data: any) => any }
export type RequestConfig = AxiosRequestConfig & RequestOptions
// 路由规则
export type Route = MenuItem &
  RouteRecordRaw & {
  children?: Route[]
}

// 排序
export interface Order {
  /**
   * 排序方向
   */
  direction?: 'ASC' | 'DESC';
  /**
   * 排序字段
   */
  field: string;
  /**
   * 忽略大小写
   */
  ignoreCase?: boolean;
}

/**
 * Sorter
 */
export interface Sorter {
  order: Order[]
}

/**
 * Pager
 */
export interface Pager {
  offset?: number;
  pageNumber?: number;
  pageSize?: number;
  sort?: Sorter;
}

/**
 * PaginationQuery
 */
export interface PaginationQuery {
  [q: string]: any;

  pager: Pager;
}

// 普通响应
export interface CommonResponse {
  errCode: number
  errMsg?: string
  message?: string
  type?: 'TOAST' | 'NOTIFY' | 'ALERT' | 'NONE' | string
}

export type Response<T> = CommonResponse & { data?: T }

export const LANGUAGE_LOAD_KEY = Symbol() as InjectionKey<Ref<boolean>>
