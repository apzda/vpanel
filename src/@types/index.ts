import type { InjectionKey, Ref, ShallowRef } from 'vue'
import type { RouteMeta, RouteRecordRaw } from 'vue-router'
import type { AxiosRequestConfig } from 'axios'
import type { CommonResponse, ErrorEvent } from '@/@types/request'

// 网关选项
export interface GtwOptions {
  baseURL: string
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
  landing?: string// 登录成功后的落地页地址
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
  rolePrefix?: string // 角色前缀
  simulator?: string // 模拟器
  captcha?: 'image' | 'drag' | 'slider' // 验证码类型
  transformResponse?: ((response: any) => any) | ((response: any) => any)[] // 响应转换器
  tokenHeaderName?: string // 请求头中令牌名称
  tokenBearer?: string // 令牌投递员名称
  whiteList: string[] // 无需要身份认证页面白名单
  gtw: {
    [gtw: string]: string | GtwOptions
    default: string | GtwOptions // 默认网关配置
  } // 网关配置
  debounce?: boolean // 网络请求防抖开关
  language?: string // 默认语言
  logo?: string // 应用LOGO
  appName?: string // 应用名称
  languages: {
    [lang: string]: {
      name: string
      flag?: string
    }
  } // 支持的语言列表
}

export type tsFunc = (text: string, defaultString?: string, args?: any) => string

// 菜单参数
export interface MenuOption {
  data: any
  t: (str: string, defaultString?: string, args?: any) => string
}

// 菜单选项
export interface MenuItem {
  id?: string
  path?: string
  icon?: any
  badge?: number | ((content: MenuOption) => number)
  color?: any
  cls?: string
  sort?: number | ((content: MenuOption) => number)
  level?: number
  menu?: true
  group?: number
  authorities?: string[] | string
  roles?: string[] | string
  meta?: RouteMeta & {
    login?: false
  }
}

// 错误处理器名称
export type ErrHandlerName = `on${string}`

// 网络请求错误处理器
export interface Handlers {
  [event: ErrHandlerName]: (event: ErrorEvent) => boolean | void

  transformResponse?: ((data: any) => CommonResponse)

  encrypt(data: any): string

  decrypt(data: string): CommonResponse

  showTipMessage(success: boolean, type: string, message: string): void

  beforeRequest(options: RequestConfig): RequestConfig
}

// 扩展选项
export type RequestOptions = { login?: false; autoRefresh?: false; showErrMsg?: false, converter?: (data: any) => any }
export type RequestConfig = AxiosRequestConfig & RequestOptions
// 路由规则
export type Route = MenuItem &
  RouteRecordRaw & {
  children?: Route[]
}
export type MenuItemElement = Readonly<ShallowRef<HTMLDivElement | null>>

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

export const LANGUAGE_LOAD_KEY = Symbol() as InjectionKey<Ref<boolean>>
export const CURRENT_MENU_NODE = Symbol() as InjectionKey<Ref<Route | null>>

export const defineRouter = (routes: Route[]): Route[] => routes

export const defineSetting = (settings: Settings): Settings => {
  settings.whiteList = settings.whiteList || []

  for (const key in settings) {
    if (key.endsWith('Url')) {
      settings.whiteList.push(settings[key])
    }
  }

  return settings
}

export const defineHandler = (handlers: Handlers): Handlers => handlers

export type validateStatus = '' | 'error' | 'validating' | 'success'

// 表单选项
export interface FormItemOpt {
  message?: string
  status?: '' | 'error' | 'validating' | 'success',
  placeholder?: string,
  label?: string
}

// 表单配置
export type FormItemOpts<T extends Record<string, any>> = {
  [key in keyof T]: FormItemOpt
}