import type { RouteRecordRaw } from 'vue-router'

export default [
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
    children: []
  }
] satisfies RouteRecordRaw[]
