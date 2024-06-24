import { defineRouter } from '@/@types'

export default defineRouter([
  {
    path: '/login',
    component: () => import('~/layout/AuthLayout.vue'),
    children: [{
      path: '',
      component: () => import('~/auth/Login.vue')
    }]
  },
  {
    path: '/auth',
    component: () => import('~/layout/AuthLayout.vue'),
    children: [
      {
        path: 'reset-password',
        component: () => import('~/auth/ResetPassword.vue')
      },
      {
        path: 'mfa-setup',
        component: () => import('~/auth/MfaSetup.vue')
      },
      {
        path: 'mfa-verify',
        component: () => import('~/auth/MfaVerify.vue')
      }
    ]
  }
])