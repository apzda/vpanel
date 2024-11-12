<template>
  <div>
    <div class="flex flex-col justify-center h-full">
      <div class="flex flex-row justify-end">
        <!-- login tip -->
        <img :src="assets('img/user-left.png')" style="width: 70%" alt="">
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { assets } from '@/utils'
</script>