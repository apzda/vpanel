<template>
  <div class="h-[100vh] flex flex-col justify-between">
    <header-panel class="flex-initial sticky"></header-panel>
    <router-view class="flex-grow" />
    <footer-panel class="flex-initial"></footer-panel>
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