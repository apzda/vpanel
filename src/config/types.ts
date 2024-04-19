export type MenuArg = {
  data: any
  t: (str: string) => string
}

export interface MenuItem {
  id: string
  name?: string | ((ctx: MenuArg) => string)
  path?: string
  title?: string | ((ctx: MenuArg) => string)
  icon?: any
  badge?: number | (() => number)
  color?: any
  sort?: number | ((ctx: MenuArg) => number)
  hidden?: boolean | ((ctx: MenuArg) => number)
  level?: number
  authorities?: string[] | string
  children?: MenuItem[]
  meta?: {
    [index: string]: any
  }
}
