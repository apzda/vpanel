<template>
  <div class="h-[100vh] flex flex-col justify-between">
    <header-panel class="flex-initial sticky" />
    <router-view class="grow" />
    <footer-panel class="flex-initial" />
  </div>
</template>
<script lang="ts" setup>
import HeaderPanel from './widgets/HeaderPanel.vue'
import FooterPanel from './widgets/FooterPanel.vue'
</script>
<style>
html, body {
  height: 100vh;
}
</style>