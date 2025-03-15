<template>
  <div class="flex justify-end border-b border-b-gray-300 dark:border-b-gray-600 gap-3 pl-[2.28571rem] pr-[0.85714rem]">
    <div class="item">
      <el-switch
        v-model="dark"
        :active-action-icon="Moon"
        :inactive-action-icon="Sunny"
      />
    </div>
    <div class="item">
      <el-dropdown placement="bottom-end" @command="languageChanged">
        <span class="icon-[mdi--translate-variant] icon"></span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="(item,idx) in languages" :key="idx" :command="idx">{{ item.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <a class="item" target="_blank" href="https://github.com/orgs/apzda/repositories">
      <span class="icon-[mdi--github] icon"></span>
    </a>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { language as locale } from '@/utils/lang'
import useAppStore from '@/stores/app'
import settings from '@/config/settings'

const languages = ref<{
  [lang: string]: {
    name: string
    flag?: string
  }
}>(settings.languages)

const { isDark, toggleDark } = useAppStore()
const dark = ref<boolean>(isDark)
watch(dark, toggleDark)

const languageChanged = (lang: string) => {
  locale.value = lang
  window.location.reload()
}
</script>
<style lang="scss" scoped>
.item {
  padding: .2rem;
}

.icon {
  width: 1.6rem;
  height: 1.6rem;
  margin-top: 6px;
}
</style>