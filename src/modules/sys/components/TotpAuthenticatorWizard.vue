<template>
  <el-form
    v-loading.fullscreen.lock="loading"
    ref="formRef"
    style="max-width: 600px"
    :model="formModel"
    :rules="formRules"
    label-width="auto"
    label-position="right"
    require-asterisk-position="right"
  >
    <template v-if="!initialized">
      <el-form-item>
        <div class="w-full text-center">
          <p class="text-gray-400">请使用Google Authenticator App扫描二维码或使用密钥进行配置。</p>
          <div class="flex items-center justify-center mt-0.5">
            <div :style="{'min-width':width+'px','min-height':height+'px'}">
              <component :is="qrCode" />
            </div>
          </div>
          <p class="mt-1 font-bold">密钥: {{ secretKey }}</p>
        </div>
      </el-form-item>
      <el-form-item label="安全码" prop="code">
        <el-input v-model="formModel.code" clearable />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="formModel.password" type="password" clearable show-password />
      </el-form-item>
    </template>
    <template v-else>
      <el-alert type="warning" show-icon class="text-lg" :closable="false">
        您的多重认证已配置！如果有需要，请点击下方的"重置多重验证"重新进行配置。
      </el-alert>
    </template>
    <el-form-item>
      <div class="w-full text-center mt-2 mb-[-20px]">
        <el-alert v-if="verifyMfaErr" :title="verifyMfaErr" type="error" style="margin-bottom: 10px" />
        <el-button v-if="!initialized" type="primary" round class="button-bg" @click="submitForm">
          {{ props.okBtnText }}
        </el-button>
        <el-button v-else type="warning" round @click="getNewMfaConfig">重置多重验证</el-button>
      </div>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { h, markRaw, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import QRCodeVue3 from 'qrcode-vue3'
import { getMfaConfig, resetMfa, setupMfa } from '../api/account'

const qrOptions = { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'Q' }
const imageOptions = { hideBackgroundDots: true, imageSize: 0.4, margin: 0 }
const dotsOptions = {
  type: 'rounded',
  color: '#000000'
}
const cornersSquareOptions = { type: 'square', color: '#000000' }
const cornersDotOptions = { type: undefined, color: '#000000' }

const props = withDefaults(defineProps<{
  okBtnText?: string
  width?: number
  height?: number
}>(), {
  okBtnText: '验证并启用多重验证',
  width: 300,
  height: 300
})

const emits = defineEmits<{
  close: [],
  ok: []
}>()

const loading = ref(false)
const secretKey = ref('')
const initialized = ref(false)
const qrCode = ref<InstanceType<typeof QRCodeVue3> | null>(null)

const formRef = ref<FormInstance>()
const formModel = reactive({
  password: '',
  code: '',
  type: 'totp'
})
const formRules = reactive<FormRules<typeof formModel>>({
  password: [{ required: true, message: '请输入你的登录密码' }],
  code: [{ required: true, message: '请输入安全码' }, { pattern: /^[0-9]{6}$/, message: '安全码只能是6位数字' }]
})
const verifyMfaErr = ref('')
const submitForm = () => {
  verifyMfaErr.value = ''

  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      setupMfa(formModel).then(() => {
        emits('ok')
      }).catch(err => {
        if (err.errMsg) {
          verifyMfaErr.value = err.errMsg
        }
      })
    }
  })
}

const getNewMfaConfig = () => {
  loading.value = true
  formRef.value?.resetFields()
  resetMfa().then(({ data }) => {
    secretKey.value = data.secretKey
    initialized.value = data.initialized || false
    //@ts-ignore
    qrCode.value = h(markRaw(QRCodeVue3), {
      value: data.config,
      qrOptions,
      imageOptions,
      dotsOptions,
      cornersSquareOptions,
      cornersDotOptions,
      width: props.width,
      height: props.height
    })
  }).catch(err => {
    if (err.errMsg) {
      verifyMfaErr.value = err.errMsg
    }
  }).finally(() => {
    loading.value = false
  })
}

const init = () => {
  loading.value = true
  verifyMfaErr.value = ''
  formRef.value?.resetFields()
  getMfaConfig().then(({ data }) => {
    secretKey.value = data.secretKey
    initialized.value = data.initialized || false
    //@ts-ignore
    qrCode.value = h(markRaw(QRCodeVue3), {
      value: data.config,
      qrOptions,
      imageOptions,
      dotsOptions,
      cornersSquareOptions,
      cornersDotOptions,
      width: props.width,
      height: props.height
    })
  }).catch(err => {
    if (err.errMsg) {
      verifyMfaErr.value = err.errMsg
    }
  }).finally(() => {
    loading.value = false
  })
}

defineExpose({ init })
</script>