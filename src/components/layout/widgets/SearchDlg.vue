<template>
  <el-dialog>
    <div>
      <el-input
        v-model="q"
        size="large"
        class="w-full"
        placeholder="Type something"
        @change="doSearch"
      >
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
      </el-input>
    </div>
    <div class="min-h-[400px]"></div>
    <template #footer>
      <div class="flex justify-end">
        <div>a</div>
        <div>b</div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

let timer: any = 0
// data bindings
const q = ref('')
// handlers
const doSearch = () => {
  if (timer) {
    clearTimeout(timer)
  }
  timer = setTimeout(async () => {
    console.log('do search:', q.value)
  }, 500)
}
</script>
