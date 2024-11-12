<template>
  <el-dialog v-bind="$attrs" v-model="visible">
    <totp-authenticator-wizard @ok="close" ref="authenticatorWizard" />
  </el-dialog>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import TotpAuthenticatorWizard from './TotpAuthenticatorWizard.vue'

const visible = ref(false)
const authenticatorWizard = ref<InstanceType<typeof TotpAuthenticatorWizard>>()
const close = () => {
  visible.value = false
}

const show = () => {
  if (!visible.value) {
    visible.value = true
    nextTick(() => {
      authenticatorWizard.value?.init()
    })
  }
}

defineExpose({ show, close })

</script>