<template>
  <div v-loading="props.loading" class="slider-wrapper p-0.5">
    <div style="width: var(--slider-width); margin: 0 auto" class="relative">
      <span class="absolute top-1 right-2 cursor-pointer" @click="emits('reload')">
        <el-icon size="20"><Refresh /></el-icon>
      </span>
      <img class="sv-bg-img" :src="captchaImages[0]" alt="" />
      <img ref="chunk" class="sv-chunk" :src="captchaImages[1]" alt="" :style="chunkPos" />
      <div class="mt-2 sv-slider-container bg-gray-200 dark:bg-gray-900">
        <div class="sv-prompt-text">
          {{ prompt }}
        </div>
        <div
          ref="slider"
          class="sv-slider bg-gray-100 dark:bg-gray-800"
          :style="sliderToLeftStyle"
          @mousedown.passive="mouseDownHandler($event)"
          @touchstart.passive="handleTouchStart($event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Refresh } from '@element-plus/icons-vue'

const props = withDefaults(
  defineProps<{
    captcha?: string
    loading?: boolean
    prompt?: string
  }>(),
  {
    captcha: '',
    loading: true,
    prompt: 'Sliding to login'
  }
)

const emits = defineEmits<{
  (event: 'dropped', value: any): void
  (event: 'reload'): void
}>()
// refs
const slider = ref<HTMLDivElement>()
// bindings
const dragging = ref(false)
const beginClientX = ref(0)
const offset = ref(0)

// computed
const captchaImages = computed(() => {
  return props.captcha.split('&&')
})

const chunkPos = computed(() => {
  const chunks = props.captcha.split('&&')
  return {
    top: chunks[2] + 'px',
    left: offset.value - 3 + 'px'
  }
})

const sliderToLeftStyle = computed(() => {
  return {
    left: offset.value + 'px'
  }
})

// methods
const addListener = () => {
  const ele = document.getElementsByTagName('html')[0]
  ele.addEventListener('mousemove', mouseMoveHandler, { passive: true })
  ele.addEventListener('mouseup', moseUpHandler, { passive: true })
  ele.addEventListener('touchend', handleTouchEnd, { passive: true })
  ele.addEventListener('touchmove', handleTouchMove, { passive: true })
}

const handleTouchStart = (event: any) => {
  startDrag(event.changedTouches[0].clientX, event.changedTouches[0].clientY)
}

const mouseDownHandler = (e: MouseEvent) => {
  // 鼠标在滑块上按下事件
  startDrag(e.clientX, e.clientY)
}

const handleTouchMove = (e: any) => {
  moveSlider(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
}

const mouseMoveHandler = (e: MouseEvent) => {
  moveSlider(e.clientX, e.clientY)
}

const handleTouchEnd = (e: any) => {
  // 触摸结束时的处理逻辑
  stopDrag(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
}

const moseUpHandler = (e: MouseEvent) => {
  stopDrag(e.clientX, e.clientY)
}

const startDrag = (x: number, y: number) => {
  if (!dragging.value) {
    dragging.value = true
    beginClientX.value = x
    offset.value = 0
    addListener()
  }
}

const moveSlider = (x: number, y: number) => {
  if (dragging.value) {
    const width = x - beginClientX.value
    if (width < 0) {
      offset.value = 0
    } else if (width > 260) {
      offset.value = 260
    } else {
      offset.value = width
    }
  }
}

const stopDrag = (x: number, y: number) => {
  if (!dragging.value) {
    return
  }
  dragging.value = false
  emits('dropped', x - beginClientX.value)
  reset()
}

// exposes
const reset = () => {
  // 重置
  beginClientX.value = 0
  offset.value = 0
  const ele = document.getElementsByTagName('html')[0]
  ele.removeEventListener('mousemove', mouseMoveHandler)
  ele.removeEventListener('mouseup', moseUpHandler)
  ele.removeEventListener('touchend', handleTouchEnd)
  ele.removeEventListener('touchmove', handleTouchMove)
}

defineExpose({ open, reset })
</script>
<style scoped lang="scss">
.slider-wrapper {
  --slider-width: 300px;
  --slider-height: 150px;

  .sv-slider-container {
    position: relative;
    width: 100%;
    height: 42px;
    line-height: 150%;
    text-align: center;
    user-select: none;
  }

  .sv-slider {
    position: absolute;
    top: 0;
    width: 42px;
    height: 42px;
    cursor: move;
    background-image: url('data:image/png;base64,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');
    background-position: center;
    background-repeat: no-repeat;
    background-size: 30px 30px;
  }

  .sv-prompt-text {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    text-align: center;
    font-size: 1rem;
    line-height: 100%;
    padding: 13px;
  }

  .sv-bg-img {
    width: var(--slider-width);
    height: var(--slider-height);
  }

  .sv-chunk {
    top: 0;
    left: 0;
    width: 60px;
    height: 60px;
    position: absolute;
  }
}
</style>
