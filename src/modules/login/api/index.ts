import useAxios from '@/config/axios'
import type { AxiosResponse } from 'axios'

const axios = useAxios('demo')

export function login(data: {
  username: string
  password: string
  captcha?: string
}): Promise<AxiosResponse<any, any>> {
  // 这里执行登录操作
  return axios.post('/login.json', data, {
    login: false
  })
}
