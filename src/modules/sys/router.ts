import { defineRouter } from '@/@types'
import { user } from '@/stores/user'

export default defineRouter([{
  path: '/sys',
  component: () => import('@/components/layout/MainLayout.vue'),
  children: [{
    path: 'user/profile',
    group: 999,
    sort: Infinity,
    components: {
      default: () => import('~/sys/user/Profile.vue'),
      header: () => import('~/sys/user/ProfileHeader.vue')
    },
    meta: {
      title: ({ ts }) => {
        return ts('sys.u.profile', 'Profile', [user.value.displayName || ''])
      },
      avatar: () => {
        if (user.value.avatar) {
          return user.value.avatar
        } else if (user.value.displayName) {
          return user.value.displayName.substring(0, 1).toUpperCase()
        }
        return 'U'
      },
      name: () => {
        return user.value.displayName || ''
      }
    }
  }, {
    path: 'audit',
    group: 990,
    sort: 990,
    icon: 'icon-[ep--memo]',
    redirect: '/sys/audit/my-activities',
    children: [
      {
        path: 'my-activities',
        sort: 0,
        component: () => import('~/sys/audit/MyActivities.vue'),
        meta: {
          name: ({ ts }) => ts('sys.activities', 'Activities')
        }
      },
      {
        path: 'logs',
        component: () => import('~/sys/audit/MyActivities.vue'),
        authorities: 'r:auditlog',
        meta: {
          name: ({ ts }) => ts('sys.audit', 'Audit Log')
        }
      }
    ],
    meta: {
      name: ({ ts }) => ts('sys.audit', 'Audit Log')
    }
  }, {
    path: 'setting',
    group: 999,
    sort: 10,
    icon: 'icon-[ep--setting]',
    redirect: '/sys/setting/base',
    children: [
      {
        path: 'base',
        sort: 0,
        component: () => import('~/sys/settings/BaseSetting.vue'),
        meta: {
          name: '基础设置'
        }
      },
      {
        path: 'ucenter',
        sort: 1,
        component: () => import('~/sys/settings/BaseSetting.vue'),
        meta: {
          name: '用户中心'
        }
      }
    ],
    meta: {
      name: ({ ts }) => {
        return ts('sys.settings', 'Settings')
      }
    }
  }]
}])