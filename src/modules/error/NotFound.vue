<template>
  <div class="h-[100vh] flex justify-center items-center">
    <div class="max-w-xl m-5 text-center -mt-10">
      <div>
        <img v-if="!isDark" :src="assets('img/error-2.svg')" class="w-full" alt="">
        <img v-if="isDark" :src="assets('img/error-2-dark.svg')" class="w-full" alt="">
      </div>
      <div class="mt-2">
        <h3 class="text-xl font-bold">{{ ts('error.not_found', 'We couldn\'t find that page') }}</h3>
        <p class="mt-2 text-gray-400">
          {{ ts('error.message', 'Looks like we couldn\'t find that page. Please try again or contact an administrator if the problem persists.')
          }}</p>
        <p class="mt-2">
          <el-button type="primary" @click="$router.back()">
            {{ ts('error.take_me_back', 'Take me Back') }}
          </el-button>
        </p>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { assets } from '@/utils'
import { useAppStore } from '@/stores/app'
import { ts } from '@/utils/i18n'

const { isDark } = useAppStore()
const $router = useRouter()
</script>