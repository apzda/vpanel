<template>
  <el-config-provider :locale="locale">
    <RouterView />
  </el-config-provider>
</template>

<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import { watchEffect, ref } from 'vue'
import { RouterView } from 'vue-router'
import { language } from './utils/lang'
// @ts-ignore
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
// @ts-ignore
import en from 'element-plus/dist/locale/en.mjs'

const locale = ref(zhCn)

watchEffect(() => {
  if (language.value == 'zh-CN') {
    locale.value = zhCn
  } else {
    locale.value = en
  }
})
</script>
