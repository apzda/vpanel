<template>
  <div>
    <header-panel></header-panel>
    <router-view />
    <footer-panel></footer-panel>
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