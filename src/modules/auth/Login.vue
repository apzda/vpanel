<template>
  <div class="flex flex-row gap-3 h-[100vh]">
    <!-- left -->
    <div class="hidden md:w-2/5 md:block bg-gray-200">
      <div class="flex flex-col justify-center h-full">
        <div class="flex flex-row justify-end">
          <!-- login tip -->
          <div>
            优美的提示在这里
          </div>
        </div>
      </div>
    </div>
    <!-- right -->
    <div class="w-full md:w-3/5">
      <div class="flex flex-col justify-center h-full">
        <div class="flex flex-row  justify-center">
          <div class="w-4/5 max-w-[500px] md:w-2/3 md:min-w-[500px]">
            <!-- login form -->
            <div class="rounded shadow shadow-gray-300 p-2">
              登录表单在这里
            </div>
            <!-- extra actions -->
            <div class="mt-2">还有一些链接在这里</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { createCaptcha } from './api'


createCaptcha()

</script>