import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/',
    name: 'index',
    component: () => import('~/core/views/Index.vue')
  }
] satisfies RouteRecordRaw[]
