<script lang="ts" setup>
import HelloWorld from '@/components/HelloWorld.vue'
import { user } from '@/stores/user'
import { loadConfig } from '../api'
loadConfig()
</script>

<template>
  <div>
    <HelloWorld :msg="user.username || ''"></HelloWorld>
  </div>
</template>
