import { defineRouter } from '@/config'

export default defineRouter([
  {
    path: '/login',
    component: () => import('~/layout/AuthLayout.vue'),
    children: [{
      path: '',
      component: () => import('~/auth/LoginPage.vue')
    }]
  },
  {
    path: '/reset-password',
    component: () => import('~/layout/AuthLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('~/auth/ResetPasswordPage.vue')
      }
    ]
  }
])