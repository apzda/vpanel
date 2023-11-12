export type MenuArg = {
  data: any
  t: (str: string) => string
}

export interface MenuItem {
  [index: string]: any
  id: string
  name: string | ((ctx: MenuArg) => string)
  path: string
  title?: string | ((ctx: MenuArg) => string)
  icon?: any
  bage?: number | (() => number)
  color?: any
  authority?: string[] | string
  children?: MenuItem[]
}
