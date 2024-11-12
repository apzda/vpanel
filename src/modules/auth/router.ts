import { defineRouter } from '@/@types'

export default defineRouter([
  {
    path: '/login',
    component: () => import('@/components/layout/AuthLayout.vue'),
    children: [{
      path: '',
      meta: {
        title: '{page.Login}'
      },
      component: () => import('~/auth/Login.vue')
    }]
  },
  {
    path: '/auth',
    component: () => import('@/components/layout/AuthLayout.vue'),
    children: [
      {
        path: 'reset/password',
        component: () => import('~/auth/ResetPassword.vue')
      },
      {
        path: 'mfa/setup',
        component: () => import('~/auth/MfaSetup.vue')
      },
      {
        path: 'mfa/verify',
        component: () => import('~/auth/MfaVerify.vue')
      }
    ]
  }
])