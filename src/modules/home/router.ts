import { defineRouter } from '@/@types'
import { useRoute } from 'vue-router'

export default defineRouter([
  {
    path: '/',
    component: () => import('@/components/layout/MainLayout.vue'),
    children: [
      {
        path: '',
        menu: true,
        group: 'top',
        icon: 'ep--home-filled',
        component: () => import('~/home/HomePage.vue'),
        meta: {
          title: '{home.dashboard}',
          name: '{home.dashboard}'
        }
      }
    ]
  },
  {
    path: '/abc',
    component: () => import('@/components/layout/BlankLayout.vue'),
    children: [
      {
        path: '',
        menu: true,
        sort: 1,
        component: () => import('~/home/HomePage.vue'),
        meta: {
          title: '概览',
          name({ ts }) {
            const route = useRoute()
            return ts('home.dashboard') + ' - ' + route.fullPath
          }
        }
      }
    ]
  }
])