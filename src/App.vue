<template>
  <el-config-provider :locale="locale">
    <router-view v-show="localeDetected" />
  </el-config-provider>
</template>

<script lang="ts" setup>
import { inject, ref, watchEffect } from 'vue'
import { ElConfigProvider } from 'element-plus'
import { RouterView } from 'vue-router'
import { language } from '@/utils/lang'
import { LANGUAGE_LOAD_KEY } from '@/@types'

// @ts-ignore
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
// @ts-ignore
import en from 'element-plus/dist/locale/en.mjs'

const locale = ref(zhCn)
const localeDetected = inject(LANGUAGE_LOAD_KEY)

watchEffect(() => {
  if (language.value == 'zh-CN') {
    locale.value = zhCn
  } else {
    locale.value = en
  }
})
</script>

<style>
#app {
  height: 100%;
}
</style>
