import { defineRouter } from '@/config'


export default defineRouter([
  {
    path: '/',
    component: () => import('~/layout/MainLayout.vue'),
    redirect: '/login',
    hidden: false,
    children: [
      {
        path: 'vpanel',
        name: '概览',
        hidden: false,
        component: () => import('~/home/HomePage.vue'),
        meta: {
          title: '概览'
        }
      }
    ]
  }
])