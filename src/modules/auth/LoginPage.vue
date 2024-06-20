<template>
  <div> Login Page</div>
</template>
<script lang="ts" setup>
import useAxios from '@/utils/axios'

const axios = useAxios()
axios.get('captcha/create', {
  params: {
    width: 120
  }
}).then(({ data }) => {
  console.log(data)
}).catch((err) => {
  console.error('应用侧捕获到错误: ', err)
}).finally(() => {
  console.log('App Launched successfully.')
})
</script>