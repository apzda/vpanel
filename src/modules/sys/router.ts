import { defineRouter } from '@/@types'

export default defineRouter([{
  path: '/sys',
  component: () => import('@/components/layout/MainLayout.vue'),
  name: 'system',
  redirect: '/sys/security/user-list',
  meta: {
    title: '系统管理'
  },
  children: [{
    path: 'u/profile',
    components: {
      default: () => import('~/sys/user/Profile.vue'),
      header: () => import('~/sys/user/ProfileHeader.vue')
    },
    meta: {
      title: '个人资料'
    }
  }]
}])