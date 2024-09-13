import { defineRouter } from '@/@types'


export default defineRouter([
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('~/error/NotFound.vue'),
    meta: {
      title({ t }) {
        return t('page.NotFound', 'Not Found')
      }
    }
  }
])