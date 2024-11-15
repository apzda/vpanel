<template>
  <el-popconfirm
    :title="ts('sys.exitMsg')"
    contenteditable="false"
    width="300"
    :confirm-button-text="ts('Yes')"
    confirm-button-type="success"
    :cancel-button-text="ts('No')"
    cancel-button-type="danger"
    @confirm="logout"
  >
    <template #reference>
      <div class="flex items-center justify-start w-full gap-2 cursor-pointer">
        <span class="icon-[mdi--sign-out-variant] w-[24px] h-[24px] text-red-600"></span>
        <div v-if="text">
          {{ text }}
        </div>
      </div>
    </template>
  </el-popconfirm>
</template>
<script setup lang="ts">
import { ts } from '@/utils/i18n'
import { logout as userLogout, switchBack, user } from '@/stores/user'
import { notify } from '@/utils/msgbox'
import settings from '@/config/settings'
import useAxios from '@/utils/axios'
import { useRoute, useRouter } from 'vue-router'

withDefaults(defineProps<{
  text?: string
}>(), {
  text: ''
})

const axios = useAxios()
const $route = useRoute()
const $router = useRouter()
const fromArg = settings.fromArg || 'from'

const logout = () => {
  if (user.value.runAs) {
    switchBack().then((res) => {
      if (res.errCode == 0) {
        notify({ title: '账户切换', message: `你已切回自己的账户！`, type: 'success' })
        res.data.login = true
        user.value = res.data
        setTimeout(() => {
          if (user.value.credentialsExpired) {
            $router.push('/forgot-password')
          } else {
            $router.push(($route.query[fromArg] || '/home') as string)
          }
        }, 100)
      } else {
        doLogout()
      }
    }).catch(doLogout)

    return
  }
  doLogout()
}
const doLogout = async () => {
  if (settings.logoutApi) {
    await axios.get(settings.logoutApi, { showErrMsg: false })
  }
  userLogout()
  setTimeout(() => {
    $router.push(settings.loginUrl || '/')
  }, 100)
}
</script>


