import { reactive, type Reactive } from 'vue'
import type { FormRules } from 'element-plus'

import { ts } from '@/utils/i18n'
import type { LoginForm } from '../@types'


export const LoginFormRules: Reactive<FormRules<LoginForm>> = reactive<FormRules<LoginForm>>({
  username: [
    {
      required: true,
      message() {
        return ts('auth.rule.username', 'Username is required!')
      },
      trigger: 'blur'
    }
  ],
  password: [
    {
      required: true,
      message() {
        return ts('auth.rule.password', 'Password is required!')
      },
      trigger: 'blur'
    }
  ],
  code: [
    {
      required: true,
      message() {
        return ts('auth.rule.code', 'Code is required!')
      },
      trigger: 'blur'
    }
  ]
})
