<template>
  <MainLayout>
    <el-container class="flex-grow">
      <div class="w-full">
        <router-view />
      </div>
    </el-container>
  </MainLayout>
</template>
<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue'
</script>