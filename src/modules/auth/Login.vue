<template>
  <div class="flex flex-row gap-3 h-[100vh]">
    <!-- left -->
    <div class="hidden md:w-2/5 md:block">
      <div class="flex flex-col justify-center h-full">
        <div class="flex flex-row justify-end">
          <!-- login tip -->
          <img :src="assets('img/user-left.png')" style="width: 70%" alt="">
        </div>
      </div>
    </div>
    <!-- right -->
    <div class="w-full md:w-3/5">
      <div class="flex flex-col justify-center h-full">
        <div class="flex flex-row  justify-center">
          <div class="w-4/5 max-w-[500px] md:w-3/5 md:min-w-[400px] xl:ml-[-100px] 2xl:ml-[-400px]">
            <!-- login form -->
            <div class="rounded shadow shadow-gray-300 p-10">
              <h1 class="mb-5 font-bold text-2xl" v-t="'auth.login'"></h1>
              <el-form
                ref="formRef"
                size="large"
                label-position="top"
                require-asterisk-position="right"
                :model="formModel"
                :rules="LoginFormRules"
              >
                <el-form-item
                  prop="username"
                  :label="formOpts.username.label"
                  :error="formOpts.username.message"
                  :validate-status="formOpts.username.status"
                >
                  <template #label="{label}">
                    <span class="font-bold text-sm">{{ label }}</span>
                  </template>
                  <el-input
                    v-model="formModel.username"
                    :placeholder="formOpts.username.placeholder"
                    :prefix-icon="User"
                    clearable />
                </el-form-item>
                <el-form-item
                  :label="formOpts.password.label"
                  :error="formOpts.password.message"
                  :validate-status="formOpts.password.status"
                  prop="password"
                >
                  <template #label="{label}">
                    <span class="font-bold text-sm">{{ label }}</span>
                  </template>
                  <el-input
                    type="password"
                    v-model="formModel.password"
                    :placeholder="formOpts.password.placeholder"
                    :prefix-icon="Lock"
                    clearable
                    show-password />
                </el-form-item>
                <el-form-item>
                  <drag-verifier
                    ref="dragVerifier"
                    :multiple="multiline"
                    @status-change="captchaVerified"
                    prompt="向右拖动滑块进行登录"
                    :success-text="successText"
                  />
                </el-form-item>
              </el-form>
            </div>
            <!-- extra actions -->
            <div class="mt-2 text-center text-gray-400 text-sm align-middle">
              <el-text size="small" type="info">
                <span class="el-icon icon-[ep--help-filled]"></span>
                POWERED BY <a target="_blank" href="https://www.github.com/apzda/vpanel">APZDA</a>
              </el-text>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import type { FormInstance } from 'element-plus'
import { ts } from '@/utils/i18n'
import { assets, encodeBase64Str } from '@/utils'

import { createCaptcha, login, validateCaptcha } from './api'
import type { LoginForm } from './@types'
import { LoginFormRules } from './rules'
import { Lock, User } from '@element-plus/icons-vue'
import DragVerifier from '@/components/captcha/DragVerifier.vue'
import type { FormItemOpts } from '@/@types'

// 状态管理
// 组件属性
// 组件事件
// 组件接口
// 组件引用
const formRef = ref<FormInstance>()
const dragVerifier = ref<InstanceType<typeof DragVerifier>>()
// 数据绑定
const multiline = ref(0)
const captchaId = ref('')
const successText = ref('正在验证...')
const formModel = reactive<LoginForm>({
  username: '',
  password: '',
  code: ''
})
const formOpts = reactive<FormItemOpts<LoginForm>>({
  username: {
    message: '',
    status: '',
    label: ts('auth.username', 'Username'),
    placeholder: ts('auth.usernameHolder', 'Enter your username.')
  },
  password: {
    message: '',
    status: '',
    label: ts('auth.password', 'Password'),
    placeholder: ts('auth.passwordHolder', 'Enter your password.')
  },
  code: {
    message: '',
    status: '',
    label: ts('auth.code', 'Captcha'),
    placeholder: ts('auth.codeHolder', 'Enter the captcha code.')
  }
})
// 私有函数
// - 登录
const doLogin = () => {
  login({
    username: formModel.username,
    password: formModel.password,
    captchaId: captchaId.value
  }).then(({ data }) => {
    console.log('登录成功:', data)
  }).catch(err => {
    console.error('登录失败', err)
    reloadCaptcha(() => {
      dragVerifier.value?.reset()
    })
  })
}
// - 加载验证码
const reloadCaptcha = (callback?: (() => void)) => {
  createCaptcha().then(({ data }) => {
    captchaId.value = data?.id || ''
    multiline.value = Number(data?.captcha || 0)
    if (callback) {
      callback()
    }
  })
}
// 事件处理器
const captchaVerified = async (verified: boolean, results: any) => {
  if (verified) {
    successText.value = '正在验证...'
    try {
      const valid = await formRef.value?.validate()
      if (!valid) {
        dragVerifier.value?.reset()
        return
      }
    } catch (err) {
      dragVerifier.value?.reset()
      return
    }

    validateCaptcha({
      id: captchaId.value,
      code: encodeBase64Str(JSON.stringify(results))
    }).then(() => {
      successText.value = '正在登录...'
      doLogin()
    }).catch(err => {
      console.error(err)
      if (err.data?.reload === true) {
        reloadCaptcha()
      }
      dragVerifier.value?.reset()
    })
  }
}
// 生命周期
onMounted(() => {
  reloadCaptcha()
})
</script>