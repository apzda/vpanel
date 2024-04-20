<script lang="ts" setup>
import { ref } from 'vue'
import HelloWorld from '@/components/HelloWorld.vue'
import { user } from '@/stores/user'
import { loadConfig, getData } from '../api'
loadConfig()

const d = () => {
  getData().then(({ data }) => {
    dataId.value = data.data?.id || 0
  })
}

const dataId = ref(0)
</script>

<template>
  <div>
    <HelloWorld :msg="user.username || ''"></HelloWorld>
    <div>
      <div class="rounded-lg" @click="d">{{ dataId }}</div>
    </div>
  </div>
</template>
