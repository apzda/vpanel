export default {
  languages: {
    'zh-CN': { name: '中文' },
    en: { name: 'English' }
  }, // 支持的语言
  whiteList: ['/login'], // 无需登录检测的页面
  gtw: {
    default: {
      timeout: 10000,
      baseURL: import.meta.env.VITE_GTW_DEFULT_URL
    },
    demo: {
      timeout: 10000,
      baseURL: import.meta.env.VITE_GTW_DEMO_URL
    }
  },
  loginUrl: '/login', // 登录页地址
  refreshTokenApi: '/refresh.json', // 刷新AccessToken api
  fromArg: 'from',
  tokenHeaderName: 'Authorization', // accessToken字段
  tokenBearer: 'Bearer'
} satisfies Settings
