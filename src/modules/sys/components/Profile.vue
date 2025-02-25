<template>
  <el-popover
    ref="popover"
    :width="300"
    :virtual-ref="navItem"
    trigger="click"
    virtual-triggering
    placement="right-end"
    style="--el-popover-padding: 12px 0"
  >
    <div class="flex flex-col w-full items-center justify-center gap-2">
      <u-avatar class="bg-cyan-600" />
      <div class="font-bold">{{ user.displayName }}</div>
      <div v-if="user.organization" class="font-semibold">{{ user.organization.name }}</div>
      <div v-if="user.email" class="font-semibold">{{ user.email }}</div>
      <div class="w-full p-3 pb-0 border-t hover:text-blue-500 dark:border-gray-500">
        <router-link :to="{name:'MyProfile'}" @click="hide">
          <div class="flex items-center justify-start w-full gap-2">
            <span class="icon-[ep--avatar] w-[1.375rem] h-[1.375rem] text-blue-500" />
            <span class="text-base">{{ ts('Profile', 'Profile') }}</span>
          </div>
        </router-link>
      </div>
      <div class="w-full p-3 pb-0 border-t hover:text-red-600 dark:border-gray-500">
        <logout-button :width="22" :height="22" :text="t('Logout')" />
      </div>
      <div class="w-full p-3 pb-0 border-t dark:border-gray-500">
        <div class="flex items-center justify-start w-full gap-2 text-base text-gray-400">
          <span>{{ ts('sys.version', 'Version') }}:</span>
          <span>{{ ver }}</span>
        </div>
      </div>
    </div>
  </el-popover>
</template>
<script setup lang="ts">
import { version } from '../../../../package.json'
import { ref, type VNodeRef } from 'vue'
import { ElPopover } from 'element-plus'
import UAvatar from '@/components/UAvatar.vue'
import { user } from '@/stores/user'
import { t, ts } from '@/utils/i18n'
import LogoutButton from '~/sys/components/LogoutButton.vue'

defineProps<{
  navItem: VNodeRef
}>()
const ver = ref(version || '1.0.0')

const popover = ref<InstanceType<typeof ElPopover> | null>(null)

const hide = () => {
  popover.value?.hide()
}
</script>