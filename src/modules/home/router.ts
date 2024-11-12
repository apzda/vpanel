import { defineRouter } from '@/@types'

export default defineRouter([
  {
    path: '/',
    component: () => import('@/components/layout/MainLayout.vue'),
    children: [
      {
        path: '',
        group: 0,
        icon: 'icon-[ep--home-filled]',
        sort: 1,
        children: [
          {
            path: '',
            menu: true,
            components: {
              help: () => import('~/home/widgets/DashboardHelp.vue'),
              default: () => import('~/home/HomePage.vue')
            },
            meta: {
              title: '{home.dashboard}',
              name: '概述'
            }
          },
          {
            path: 'd',
            menu: true,
            badge: 1,
            component: () => import('~/home/HomePage.vue'),
            meta: {
              title: '{home.dashboard}',
              name: '概述d'
            }
          }
        ],
        meta: {
          name: '{home.dashboard}',
          tip: 'Ctr+J'
        }
      },
      {
        path: 'notification',
        group: 0,
        sort: 2,
        icon: 'icon-[mdi--bell]',
        badge() {
          return 10
        },
        component: () => import('~/home/HomePage.vue'),
        meta: {
          title() {
            return '通知(10)'
          },
          name: '通知'
        }
      }
    ]
  }
])