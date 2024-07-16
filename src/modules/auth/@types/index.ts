// 登录表单
export interface LoginForm extends Record<string, string> {
  username: string
  password: string
  code: string
}