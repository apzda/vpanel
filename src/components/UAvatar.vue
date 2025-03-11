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
.el-avatar {
  &.avatar {
    --el-avatar-bg-color: var(--color-cyan-600, oklch(0.609 0.126 221.723));
  }
}
</style>