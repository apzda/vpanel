<template>
  <div
    class="h-full flex justify-start items-center gap-1 text-gray-700 dark:text-white">
    <span class="flex-shrink-0 w-[20px] h-[20px] icon-[ep--avatar]" />
    <div class="flex-shrink-0 font-semibold text-md mr-2">{{ ts('Profile') }}</div>
    <span class="flex-grow text-xs text-gray-700 dark:text-gray-400">{{ ts('sys.u.tip') }}</span>
    <div class="flex-shrink-0 mr-5">
      <logout-button />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ts } from '@/utils/i18n'
import LogoutButton from '~/sys/components/LogoutButton.vue'
</script>