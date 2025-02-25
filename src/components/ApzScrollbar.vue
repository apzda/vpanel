<template>
  <el-scrollbar class="apz-scrollbar">
    <slot />
  </el-scrollbar>
</template>

<style lang="scss" scoped>
.apz-scrollbar :deep(.el-scrollbar__view) {
  min-height: 100% !important;
}
</style>