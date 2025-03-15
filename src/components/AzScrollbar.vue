<template>
  <el-scrollbar class="az-scrollbar">
    <slot />
  </el-scrollbar>
</template>

<style lang="scss" scoped>
.az-scrollbar :deep(.el-scrollbar__view) {
  min-height: 100% !important;
}
</style>