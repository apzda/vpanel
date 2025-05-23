import { defineSetting } from '@/@types'

export default defineSetting({
  appName: 'vpanel',
  languages: {
    'zh-CN': { name: '中文' },
    en: { name: 'English' }
  }, // 支持的语言
  whiteList: [], // 无需登录检测的页面
  loginUrl: '/login', // 登录页地址
  landing: '/',
  logoutApi: '/logout',
  mfaVerifyUrl: '/auth/mfa/verify',
  mfaSetupUrl: '/auth/mfa/setup',
  refreshTokenApi: '/ucenter/refresh-token', // 刷新AccessToken api
  fromArg: 'from',
  captcha: 'slider',
  gtw: {
    default: {
      timeout: 30000,
      baseURL: import.meta.env.VITE_GTW_DEFAULT_URL
    },
    demo: {
      timeout: 30000,
      baseURL: import.meta.env.VITE_GTW_DEMO_URL
    }
  },
  debounce: true,
  tokenHeaderName: 'Authorization', // accessToken字段
  tokenBearer: 'Bearer'
})
