<script lang="ts" setup>
import settings from '@/config/settings'
import { login } from '../api'
import { user } from '@/stores/user'
import { useRoute, useRouter } from 'vue-router'
import { nextTick } from 'vue'

const fromArg = settings.fromArg || ''

const route = useRoute()
const router = useRouter()

const doLogin = () => {
  login({
    username: 'admin',
    password: '123456'
  })
    .then(({ data }) => {
      console.log(data)
      if (data.errCode == 0 && data.data) {
        user.value.login = true
        user.value.username = data.data.username
        user.value.token = data.data.accessToken
        user.value.refreshToken = data.data.refreshToken
        const from = (route.query[fromArg] || '/') as string
        console.log('登录成功，跳回:', from)
        if (/^https?:\/\/.+/.test(from)) {
          window.location.href = from
        } else {
          nextTick()
          router.push(from)
        }
      }
    })
    .catch((err) => {
      console.error(err)
    })
}
</script>
<template>
  <div>
    <div class="mx-auto mt-20 text-center">
      <div class="text-center">
        <button @click="doLogin" v-t="'login.login'"></button>
      </div>
    </div>
  </div>
</template>
