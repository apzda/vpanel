import type { AxiosResponse } from 'axios'
import useAxios, { type Response } from '@/utils/axios'

const axios = useAxios('demo')

export type LoginResp = {
  uid: string | number
  username: string
  avatar: string
  phone: string
  email: string
  accessToken: string
  refreshToken: string
  roles: string[]
  authorities: string[]
}

export function login(data: { username: string; password: string; captcha?: string }): Response<LoginResp> {
  // 这里执行登录操作
  return axios.post('/login.json', data, {
    login: false
  })
}
