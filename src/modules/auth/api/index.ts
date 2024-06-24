import useAxios from '@/utils/axios'

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
  return axios.get<Captcha>('captcha/create', { showErrMsg: false })
}
// 验证
export const validateCaptcha = (data: CaptchaCode) => {
  return axios.post('captcha/validate', { data })
}
