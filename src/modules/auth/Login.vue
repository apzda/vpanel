<template>
  <div class="flex flex-row gap-3">
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
            <div class="rounded shadow shadow-gray-300 dark:shadow-gray-600 p-4 md:p-10">
              <h1 class="mb-2 font-bold text-2xl" v-t="'auth.login'"></h1>
              <p class="mb-5 text-sm text-gray-400">{{ ts('auth.tip', 'Welcome back to your account.') }}</p>
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
                  :label="ts('auth.username', 'Username')"
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
                    <span class="font-bold text-sm flex-grow">{{ label }}</span>
                  </template>
                  <el-input
                    type="password"
                    v-model="formModel.password"
                    :placeholder="formOpts.password.placeholder"
                    :prefix-icon="Lock"
                    clearable
                    show-password />
                </el-form-item>
                <el-form-item v-if="captchaType == 'drag'" style="margin-bottom: 0">
                  <drag-verifier
                    ref="dragVerifier"
                    :multiple="multiline"
                    @status-change="captchaVerified"
                    :prompt="ts('auth.drag.prompt','Sliding to the right to log in.')"
                    :success-text="successText"
                  />
                </el-form-item>
                <template v-else-if="captchaType == 'slider'">
                  <el-form-item style="margin-bottom: 0">
                    <el-popover placement="top" :width="330" :visible="visible" :show-arrow="false" :offset="-40">
                      <template #reference>
                        <el-button :loading="loading" class="w-full" type="primary" @click="showSliderCaptcha">
                          {{ ts('auth.login') }}
                        </el-button>
                      </template>
                      <slider-verifier
                        v-if="captchaType=='slider'"
                        ref="sliderVerifier"
                        :captcha="captchaCode"
                        :loading="loading"
                        :prompt="ts('auth.slider.prompt')"
                        @reload="reloadCaptcha"
                        @dropped="sliderVerified" />
                    </el-popover>
                  </el-form-item>
                </template>
                <template v-else>
                  <el-form-item
                    :label="formOpts.code.label"
                    :error="formOpts.code.message"
                    :validate-status="formOpts.code.status"
                    prop="code">
                    <template #label="{label}">
                      <span class="font-bold text-sm flex-grow">{{ label }}</span>
                    </template>
                    <el-input
                      v-model="formModel.code"
                      :placeholder="formOpts.code.placeholder"
                      :prefix-icon="CircleCheck"
                      @blur="verifyImageCaptcha"
                      @change="captchaValid=false"
                      maxlength="4"
                    >
                      <template #append>
                        <div class="w-[110px] mx-[-18px] bg-white" @click="reloadCaptcha">
                          <img v-if="captchaCode" :src="captchaCode" alt="" />
                        </div>
                      </template>
                    </el-input>
                  </el-form-item>
                  <el-form-item style="margin-bottom: 0">
                    <el-button :loading="loading"
                               class="w-full"
                               :dark="true"
                               type="primary"
                               :disabled="!captchaValid"
                               @click="doLogin">
                      {{ ts('auth.login') }}
                    </el-button>
                  </el-form-item>
                </template>
              </el-form>
            </div>
            <!-- extra actions -->
            <div class="mt-2 text-center text-gray-400 text-sm align-middle">
              <el-text size="small" type="info">
                <span class="el-icon icon-[ep--help-filled]"></span>
                POWERED BY <a target="_blank" href="https://github.com/orgs/apzda/repositories">APZDA</a>
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
import { user } from '@/stores/user'
import { createCaptcha, login, validateCaptcha } from './api'
import type { LoginForm } from './@types'
import { LoginFormRules } from './rules'
import { CircleCheck, Lock, User } from '@element-plus/icons-vue'
import DragVerifier from '@/components/captcha/DragVerifier.vue'
import SliderVerifier from '@/components/captcha/SliderVerifier.vue'
import type { FormItemOpts } from '@/@types'
import { gotoPage } from '@/router'
import { useRoute, useRouter } from 'vue-router'
import settings from '@/config/settings'

// constants
const fromArg: string = settings.fromArg || ''
const landingUrl: string = settings.landingUrl || '/'
const captchaType: 'image' | 'drag' | 'slider' = settings.captcha || 'slider'
// hooks
const $router = useRouter()
const $route = useRoute()
// 组件接口
// === 件引用 ===
const formRef = ref<FormInstance>()
const dragVerifier = ref<InstanceType<typeof DragVerifier> | null>(null)
const sliderVerifier = ref<InstanceType<typeof SliderVerifier> | null>(null)
// === 数据绑定 ===
const loading = ref(false)
const visible = ref(false)
const multiline = ref(0)
const captchaId = ref('')
const captchaCode = ref('')
const captchaValid = ref(false)
const successText = ref(ts('auth.drag.success', '...'))
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
// === 私有函数 ===
const validateForm = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (!valid) {
      throw new Error('form is invalid')
    }
  } catch (err) {
    dragVerifier.value?.reset()
    throw err
  }

}
/**
 * 登录
 */
const doLogin = async () => {
  await validateForm()

  loading.value = true

  login({
    username: formModel.username,
    password: formModel.password,
    captchaId: captchaId.value
  }).then(({ data }) => {
    data.login = true
    user.value = data
    const landing = data.landingUrl || landingUrl
    setTimeout(() => {
      if (user.value.credentialsExpired) {
        gotoPage('resetPwdUrl', $route.query[fromArg] || landing)
      } else if (user.value.mfa == 'PENDING') {
        gotoPage('mfaVerifyUrl', $route.query[fromArg] || landing)
      } else if (user.value.mfa == 'UNSET') {
        gotoPage('mfaSetupUrl', $route.query[fromArg] || landing)
      } else {
        $router.push(($route.query[fromArg] || landing) as string)
      }
    }, 100)
  }).catch(() => {
    reloadCaptcha(() => {
      visible.value = false
      dragVerifier.value?.reset()
      sliderVerifier.value?.reset()
    })
  }).finally(() => loading.value = false)
}
// - 加载验证码
const reloadCaptcha = (callback?: (() => void)) => {
  captchaValid.value = false
  loading.value = true
  createCaptcha().then(({ data }) => {
    captchaId.value = data?.id || ''
    const type = data?.type || 'image'
    if (type == 'drag') {
      multiline.value = Number(data?.captcha || 0)
    } else if (type == 'image') {
      captchaCode.value = data?.captcha || ''
    } else if (type == 'slider') {
      captchaCode.value = data?.captcha || ''
    } else {
      throw new Error('Unknown captcha type: ' + type)
    }

    if (typeof callback == 'function') {
      callback()
    }
  }).finally(() => loading.value = false)
}
// === 事件处理器 ===
/**
 * 显示滑动验证码
 */
const showSliderCaptcha = async () => {
  await validateForm()
  visible.value = true
}
/**
 * 校验图形验证码
 */
const verifyImageCaptcha = () => {
  if (captchaValid.value || !formModel.code) {
    return
  }

  formOpts.code.status = 'validating'
  formOpts.code.message = ''

  validateCaptcha({
    id: captchaId.value,
    code: formModel.code
  }, false).then(() => {
    captchaValid.value = true
  }).catch(err => {
    captchaValid.value = false
    formOpts.code.status = 'error'
    formOpts.code.message = err.errMsg || err.message || ts('auth.captchaInvalid')
    if (err.data?.reload === true) {
      reloadCaptcha()
    }
  })
}
/**
 * 校验拖动验证码
 * @param verified
 * @param results
 */
const captchaVerified = async (verified: boolean, results: any) => {
  if (verified) {
    successText.value = ts('auth.drag.success', '...')
    await validateForm()
    loading.value = true
    validateCaptcha({
      id: captchaId.value,
      code: encodeBase64Str(JSON.stringify(results))
    }).then(() => {
      successText.value = ts('auth.drag.login', '...')
      doLogin()
    }).catch(err => {
      dragVerifier.value?.reset()
      if (err.data?.reload === true) {
        reloadCaptcha()
      }
    }).finally(() => loading.value = false)
  }
}
/**
 * 滑动验证码
 */
const sliderVerified = async (offset: number) => {
  const chunks = captchaCode.value?.split('&&')
  if (chunks.length != 3) {
    return
  }
  loading.value = true
  validateCaptcha({
    id: captchaId.value,
    code: `${offset},${chunks[2]}`
  }).then(() => {
    doLogin()
  }).catch(err => {
    if (err.data?.reload === true) {
      reloadCaptcha()
    }
  }).finally(() => loading.value = false)
}
// === 生命周期 ===
onMounted(() => {
  if (user.value.login === true) {
    const landing = user.value.landingUrl || landingUrl
    $router.push(($route.query[fromArg] || landing) as string)
  } else {
    reloadCaptcha()
  }
})
</script>