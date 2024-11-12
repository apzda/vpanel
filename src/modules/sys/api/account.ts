import useAxios from '@/utils/axios'

const axios = useAxios()

// 修改用户信息
export interface UpdateMyAccountRequest {
  /**
   * 昵称
   */
  displayName?: string;
  /**
   * 邮箱
   */
  email?: string;
  /**
   * 名
   */
  firstName?: string;
  /**
   * 姓
   */
  lastName?: string;
  /**
   * 手机号
   */
  phone?: string;
}

export function updateAccountInfo(data: UpdateMyAccountRequest) {
  return axios.post('/account/updateMyAccount', { data })
}

// 修改用户密码
export interface UpdatePasswordRequest {
  /**
   * 确认密码
   */
  confirmPassword: string;
  /**
   * 新密码
   */
  newPassword: string;
  /**
   * 原密码
   */
  oldPassword: string;
}

export function updatePassword(data: UpdatePasswordRequest) {
  return axios.post('/account/updatePassword', { data })
}

// 账户
export interface Account {
  id?: string;
  username: string;
  displayName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  resetPassword?: boolean;
  status: string;
  roles?: string[]
}

// 新增账户
export function createAccount(data: Account) {
  return axios.post('/account/createAccount', { data })
}

// 修改账户
export function updateAccount(data: Account) {
  return axios.post('/account/updateAccount', { data })
}

// 删除用户
export function deleteAccount(data: Account) {
  return axios.post('/account/deleteAccount', { data: { id: data.id } })
}

// 踢下线
export function kickOff(data: Account) {
  return axios.post('/account/kickoff', { data: { username: data.username } })
}

// 获取账户当前的授权码
export function getSwitchCode() {
  return axios.post<{ code: string }>('/account/switchCode')
}

export interface MfaConfig {
  type: string,
  config: string,
  secretKey: string,
  initialized?: boolean
}

// 获取多重认证配置
export const getMfaConfig = () => {
  return axios.post<MfaConfig>('/account/mfaConfig')
}

export const setupMfa = (data: { code: string, password: string }) => {
  return axios.post('/account/setupMfa', { data, showErrMsg: false })
}

export const resetMfa = () => {
  return axios.post<MfaConfig>('/account/resetMfa')
}

export const verifyMfa = (data: { code: string, type: string }) => {
  return axios.post('/account/verifyMfa', { data })
}