import type { RouteRecordRaw } from 'vue-router'
import type { AxiosResponse, AxiosRequestConfig } from 'axios'
// 响应模板
export type ApiResponse<T, D> = {
  errCode: number
  errMsg?: string
} & AxiosResponse<T, D>
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
}
// 配置选项
export interface Settings {
  [index: string]: any
  loginUrl: string
  refreshTokenApi?: string
  fromArg?: string
  transformResponse?: (response: any) => any
  tokenHeaderName?: string
  tokenBearer?: string
  whiteList: string[]
  gtw: {
    [gtw: string]: string | GtwOptions
    default: string | GtwOptions
  }
  debounce?: boolean
  language?: string
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
  authorities?: string[] | string
  roles?: string[] | string
  children?: MenuItem[]
}
// 扩展选项
export type RequestOptions = { login?: boolean; autoRefresh?: boolean }
export type RequestConfig = AxiosRequestConfig & RequestOptions
// 路由规则
export type Route = MenuItem &
  RouteRecordRaw & {
    children?: Route[]
  }
