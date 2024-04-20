import { defineRouter } from '@/config'

export default defineRouter([
  {
    path: '/login',
    name: 'login',
    meta: {
      title() {
        return 'Login'
      }
    },
    props: true,
    component: () => import('~/login/views/Login.vue')
  },
  {
    path: '/reset',
    component: () => import('~/login/views/ResetPwd.vue'),
    children: [],
    level: 0
  }
])
