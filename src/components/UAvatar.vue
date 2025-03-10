<template>
  <el-avatar v-if="avatar.startsWith('http')" :src="avatar" v-bind="$attrs" />
  <el-avatar v-else v-bind="$attrs">{{ avatar }}</el-avatar>
</template>
<script setup lang="ts">
import { avatar as userAvatar } from '@/stores/user'
import { computed } from 'vue'

const avatar = computed(() => userAvatar())
</script>
<style lang="scss" scoped>
@reference "../styles/main.scss";
.el-avatar {
  &.avatar {
    @apply bg-cyan-600;
  }
}
</style>