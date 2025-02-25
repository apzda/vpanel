<template>
  <div class="flex flex-col items-stretch h-full">
    <div class="mb-5 shrink-0 border-b border-red-500" style="height: 130px">aaaa</div>
    <div class="mb-1 flex-1 border border-blue-500" ref="habc">

    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'

const habc = ref<HTMLElement | null>()

onMounted(() => {
  console.log(habc.value?.clientHeight)
})
</script>