<template>
  <div class="flex flex-row gap-3">
    <!-- left -->
    <left-aside class="hidden md:w-2/5 md:block" />
    <!-- right -->
    <right-aside class="w-full md:w-3/5">
      <!-- verify form -->
      <div class="rounded shadow shadow-gray-300 dark:shadow-gray-600 p-4 md:p-10">
        <h1 class="mb-2 font-bold text-2xl">{{ ts('auth.login') }}</h1>
        <p class="mb-5 text-base text-gray-400">{{ ts('auth.tip', 'Welcome back to your account.') }}</p>
        <el-form
          ref="verifyMfaForm"
          :model="formModel"
          :rules="verifyMfaFormRules"
          size="large"
          label-position="top"
          require-asterisk-position="right"
        >
          <el-form-item
            :label="ts('auth.security')"
            prop="code"
            :error="verifyMfaErr"
            :validate-status="codeStatus">
            <template #label="{label}">
              <span class="font-bold text-base flex-grow">{{ label }}</span>
            </template>
            <el-input
              v-model="formModel.code"
              :placeholder="ts('auth.securityHolder')"
              clearable>
              <template #prefix>
                <el-icon>
                  <Lock />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 0">
            <el-button :loading="isVerifying"
                       class="w-full"
                       :dark="true"
                       type="primary"
                       @click="verifyMfa">
              {{ ts('auth.login') }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </right-aside>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref } from 'vue'
import LeftAside from '~/auth/components/LeftAside.vue'
import RightAside from '~/auth/components/RightAside.vue'
import settings from '@/config/settings'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { user } from '@/stores/user'
import { verifyMfa as verifyMfaCode } from './api'
import { Lock } from '@element-plus/icons-vue'
import { ts } from '@/utils/i18n'
import type { validateStatus } from '@/@types'

const fromArg: string = settings.fromArg || ''
const $router = useRouter()
const $route = useRoute()
const isVerifying = ref(false)
const verifyMfaErr = ref('')
const codeStatus = ref<validateStatus>('')
const verifyMfaForm = ref<FormInstance>()
const formModel = reactive({
  code: '',
  type: 'totp'
})

const verifyMfaFormRules = reactive<FormRules<typeof formModel>>({
  code: [
    { required: true, message: () => ts('auth.rule.security', 'Security Code is required!'), trigger: 'blur' },
    {
      pattern: /^[0-9]{6}$/,
      message: () => ts('auth.rule.security1', 'Security Code is at least 6 digits', [6]),
      trigger: 'blur'
    }
  ]
})

const verifyMfa = () => {
  verifyMfaForm.value?.validate((valid) => {
    if (valid) {
      isVerifying.value = true
      verifyMfaCode(formModel).then(() => {
        verifyMfaErr.value = ''
        codeStatus.value = 'success'
        user.value.mfa = 'VERIFIED'
        setTimeout(() => {
          $router.push(($route.query[fromArg] || settings.landing || '/') as string)
        }, 100)
      }).catch((err: any) => {
        verifyMfaErr.value = err.errMsg || err.message
        codeStatus.value = 'error'
      }).finally(() => {
        isVerifying.value = false
      })
    }
  })
}
</script>