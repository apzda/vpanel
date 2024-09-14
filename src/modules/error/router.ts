import { defineRouter } from '@/@types'


export default defineRouter([
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('~/error/NotFound.vue'),
    meta: {
      title({ ts }) {
        return ts('page.NotFound', 'Not Found')
      }
    }
  }
])