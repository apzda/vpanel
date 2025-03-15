import { defineRouter } from '@/@types'
import router from '@/router'

const onKeyup = async (event: any) => {
  if (event.ctrlKey && (event.key === 'd' || event.key === 'D')) {
    event.preventDefault()
    await router.push('/')
  }
}

export default defineRouter([
  {
    path: '/',
    component: () => import('@/components/layout/MainLayout.vue'),
    children: [
      {
        path: '',
        group: 0,
        icon: 'icon-[ep--home-filled]',
        sort: 0,
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
          tip: 'Ctr+d',
          install() {
            window.addEventListener('keydown', onKeyup)
          },
          uninstall() {
            window.removeEventListener('keydown', onKeyup)
          }
        }
      }
    ]
  }
])