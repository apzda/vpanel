<template>
  <div
    class="h-full flex justify-start items-center gap-1 text-gray-700 dark:text-white">
    <span class="shrink-0 w-[1.57142rem] h-[1.57142rem] icon-[ep--avatar]" />
    <div class="shrink-0 font-semibold text-lg mr-2">{{ ts('Profile') }}</div>
    <span class="grow text-sm text-gray-700 dark:text-gray-400">{{ ts('sys.u.tip') }}</span>
    <div class="shrink-0 mr-5">
      <logout-button />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ts } from '@/utils/i18n'
import LogoutButton from '~/sys/components/LogoutButton.vue'
</script>