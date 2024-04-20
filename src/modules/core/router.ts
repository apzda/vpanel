import { defineRouter } from '@/config'

export default defineRouter([
  {
    path: '/',
    name: 'index',
    component: () => import('~/core/views/Index.vue'),
    children: [],
    level: 1,
    meta: {},
    authorities: [],
    roles: [],
    title: ({ t }): string => {
      return 'Home' + t('aaa')
    }
  }
])
