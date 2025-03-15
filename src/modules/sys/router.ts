import { defineRouter } from '@/@types'
import { avatar, user } from '@/stores/user'
import Profile from '~/sys/components/Profile.vue'
import { h, markRaw } from 'vue'
import router from '@/router'

const onKeyup = async (event: any) => {
  if (event.ctrlKey) {
    if ((event.key === 's' || event.key === 'S')) {
      event.preventDefault()
      await router.push('/sys/setting/base')
    } else if ((event.key === '.')) {
      event.preventDefault()
      await router.push('/sys/user/profile')
    }
  }
}
export default defineRouter([{
  path: '/sys',
  component: () => import('@/components/layout/MainLayout.vue'),
  children: [{
    path: 'user/profile',
    group: 999,
    sort: Infinity,
    name: 'MyProfile',
    components: {
      default: () => import('~/sys/user/Profile.vue'),
      header: () => import('~/sys/user/ProfileHeader.vue')
    },
    meta: {
      tip: 'Ctr+.',
      title: ({ ts }) => {
        return ts('sys.u.profile', 'Profile', [user.value.displayName || ''])
      },
      vNode: (navItem) => h(markRaw(Profile), {
        navItem
      }),
      click() {
      },
      avatar: () => avatar(),
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
        name: 'my-activities',
        component: () => import('~/sys/audit/MyActivities.vue'),
        meta: {
          name: ({ ts }) => ts('sys.activities', 'Activities')
        }
      },
      {
        path: 'logs',
        component: () => import('~/sys/audit/AuditLog.vue'),
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
      },
      tip: 'Ctr+S',
      install() {
        window.addEventListener('keydown', onKeyup)
      },
      uninstall() {
        window.removeEventListener('keydown', onKeyup)
      }
    }
  }]
}])