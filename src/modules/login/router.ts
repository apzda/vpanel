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
    component: () => import('~/login/views/Login.vue'),
    roles: 'user'
  },
  {
    path: '/reset',
    name: 'Rest Password',
    component: () => import('~/login/views/ResetPwd.vue'),
    children: [],
    roles: ['ddd', 'bbb']
  }
])
