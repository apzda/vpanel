<template>
  <div class="flex flex-row gap-3">
    <!-- left -->
    <left-aside class="hidden md:w-2/5 md:block" />
    <!-- right -->
    <right-aside class="w-full md:w-3/5">
      <!-- verify form -->
      <div class="rounded shadow shadow-gray-300 dark:shadow-gray-600 p-4 md:p-10">
        <totp-authenticator-wizard
          @ok="mfaSetupOk"
          ref="authenticatorWizard"
          :height="200"
          :width="200"
          :ok-btn-text="ts('auth.setupMfa','Setup MFA & Sign In')" />
      </div>
    </right-aside>
  </div>
</template>
<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue'
import LeftAside from '~/auth/components/LeftAside.vue'
import RightAside from '~/auth/components/RightAside.vue'
import TotpAuthenticatorWizard from '~/sys/components/TotpAuthenticatorWizard.vue'
import settings from '@/config/settings'
import { useRoute, useRouter } from 'vue-router'
import { user } from '@/stores/user'
import { ts } from '@/utils/i18n'

const authenticatorWizard = ref<InstanceType<typeof TotpAuthenticatorWizard>>()

const fromArg: string = settings.fromArg || ''
const $router = useRouter()
const $route = useRoute()

const mfaSetupOk = () => {
  user.value.mfa = 'VERIFIED'
  setTimeout(() => {
    $router.push(($route.query[fromArg] || settings.landing || '/') as string)
  }, 100)
}

onMounted(() => {
  nextTick(() => authenticatorWizard.value?.init())
})
</script>