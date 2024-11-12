<template>
  <div
    class="h-full flex justify-start items-center gap-1 text-gray-700 dark:text-white">
    <span class="flex-shrink-0 w-[20px] h-[20px] icon-[ep--avatar]" />
    <div class="flex-shrink-0 font-semibold text-md mr-2">个人资料</div>
    <span class="flex-grow text-xs text-gray-700 dark:text-gray-400">管理您的账户信息与密码</span>
    <div class="flex-shrink-0 mr-5">
      <el-popconfirm
        title="您确定退出系统吗？"
        contenteditable="false"
        width="200"
        confirm-button-text="是"
        confirm-button-type="success"
        cancel-button-text="否"
        cancel-button-type="info"
        @confirm="logout"
      >
        <template #reference>
          <span class="icon-[mdi--sign-out-variant] w-[24px] h-[24px] text-red-600"></span>
        </template>
      </el-popconfirm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { logout as userLogout, switchBack, user } from '@/stores/user'
import settings from '@/config/settings'
import useAxios from '@/utils/axios'
import { useRoute, useRouter } from 'vue-router'
import { notify } from '@/utils/msgbox'

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
    $router.push(settings.loginUrl || '/login')
  }, 100)
}
</script>