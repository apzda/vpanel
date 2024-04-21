import type { Plugin, DirectiveBinding } from 'vue'
import { hasAuthority, hasRole } from '@/stores/user'

const injectMenuName = (el: HTMLElement, binding: DirectiveBinding) => {
  const f = binding.arg || 'name'
  console.log(binding, f)
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
    el.innerText = 'undefined'
  }
}
const createMenuItem = (el: HTMLElement, binding: DirectiveBinding, inject: boolean) => {
  if (binding.value) {
    const menu = binding.value
    const checkDisabled = !(menu.authorities || menu.roles)

    if (checkDisabled || (menu.authorities && hasAuthority(menu.authorities))) {
      return inject && injectMenuName(el, binding)
    }
    if (checkDisabled || (menu.roles && hasRole(menu.roles))) {
      return inject && injectMenuName(el, binding)
    }
  } else {
    el.innerText = 'undefined'
  }

  el.parentNode?.removeChild(el)
}
export default {
  install(app) {
    app.directive('menu-name', (el: HTMLElement, binding: DirectiveBinding) => {
      createMenuItem(el, binding, true)
    })
    app.directive('menu', (el: HTMLElement, binding: DirectiveBinding) => {
      createMenuItem(el, binding, false)
    })
  }
} as Plugin
