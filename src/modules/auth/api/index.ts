import useAxios from '@/utils/axios'
import type { UserInfo } from '@/stores/user'
import type { RequestConfig } from '@/@types'

const axios = useAxios()

export interface Captcha {
  captcha: string;
  expireTime: string;
  id: string;
  type: string;
}

export interface CaptchaCode {
  id: string;
  code: string;
}

// 创建验证码
export const createCaptcha = () => {
  return axios.get<Captcha>('captcha/create', { showErrMsg: false, login: false })
}
// 验证
export const validateCaptcha = (data: CaptchaCode, showErrMsg: boolean = true) => {
  const options: RequestConfig = { data: data, login: false }
  if (!showErrMsg) {
    options.showErrMsg = false
  }
  return axios.post('captcha/validate', options)
}

// 登录
export const login = (data: {
  username: string;
  password: string;
  captchaId?: string;
}) => {
  const cid = data.captchaId
  delete data.captchaId

  return axios.post<UserInfo>('ucenter/login', { data, login: false, headers: { 'X-CAPTCHA-ID': cid } })
}

export const verifyMfa = (data: { code: string, type: string }) => {
  return axios.post('account/verifyMfa', { data, showErrMsg: false })
}