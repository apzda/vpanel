import type { Plugin, DirectiveBinding } from 'vue'

export default {
  install(app) {
    app.directive('menu-text', (el, binding: DirectiveBinding) => {
      const f = binding.arg || 'name'
      // console.log(binding)
      if (binding.value && binding.value[f]) {
        const val = binding.value[f]
        if (typeof val === 'function') {
          // @ts-ignore
          el.innerText = val({ data: binding.value, t: window.i18n.t })
        } else if (val.startsWith('@:')) {
          // @ts-ignore
          el.innerText = window.i18n.t(val.substring(2), binding.value)
        } else {
          el.innerText = val
        }
      } else {
        el.innerText = undefined
      }
    })
  }
} as Plugin
