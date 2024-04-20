<script lang="ts" setup>
import { ref } from 'vue'
import HelloWorld from '@/components/HelloWorld.vue'
import { user } from '@/stores/user'
import { loadConfig, getData } from '../api'
import { routerMgr } from '@/router'

loadConfig()

const d = () => {
  getData().then(({ data }) => {
    dataId.value = data.data?.id || 0
  })
}

const dataId = ref(0)
const menus = ref(routerMgr.nodes)
</script>

<template>
  <div>
    <HelloWorld :msg="user.username || ''"></HelloWorld>
    <ul>
      <li v-for="menu in menus" v-menu-name="menu"></li>
    </ul>
    <div>
      <div class="rounded-lg" @click="d">{{ dataId }}</div>
    </div>
  </div>
</template>
