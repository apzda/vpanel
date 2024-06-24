<template>
  <div>
    <header-panel></header-panel>
    <router-view />
    <footer-panel></footer-panel>
  </div>
</template>
<script lang="ts" setup>
import HeaderPanel from '~/layout/components/HeaderPanel.vue'
import FooterPanel from '~/layout/components/FooterPanel.vue'
</script>
<style>
html, body {
  height: 100vh;
}
</style>