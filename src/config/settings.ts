import { defineSetting } from '.'

export default defineSetting({
  languages: {
    'zh-CN': { name: '中文' },
    en: { name: 'English' }
  }, // 支持的语言
  whiteList: [], // 无需登录检测的页面
  loginUrl: '/login', // 登录页地址
  refreshTokenApi: '/refresh.json', // 刷新AccessToken api
  fromArg: 'from',
  gtw: {
    default: {
      timeout: 10000,
      baseURL: import.meta.env.VITE_GTW_DEFAULT_URL
    },
    demo: {
      timeout: 10000,
      baseURL: import.meta.env.VITE_GTW_DEMO_URL
    }
  },
  debounce: true,
  tokenHeaderName: 'Authorization', // accessToken字段
  tokenBearer: 'Bearer'
})
