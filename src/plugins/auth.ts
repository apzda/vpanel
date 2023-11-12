import type { Plugin, DirectiveBinding } from 'vue'
import { storeToRefs } from 'pinia'
import { user, isSuperAdmin, hasPermission, hasAuthority, hasRole } from './../stores/user'

export default {
  install(app) {
    app.config.globalProperties.$isSuperAdmin = isSuperAdmin
    app.config.globalProperties.$hasRole = hasRole
    app.config.globalProperties.$hasAuthority = hasAuthority
    app.config.globalProperties.$hasPermission = hasPermission
    app.config.globalProperties.$isAuthed = () => user.value.login
    app.config.globalProperties.$isLogin = () => user.value.login

    app.directive('is-super-admin', (el) => {
      if (!isSuperAdmin()) {
        el.parentNode.removeChild(el)
      }
    })

    app.directive('has-role', (el, binding: DirectiveBinding) => {
      if (!hasRole(binding.value, binding.modifiers)) {
        el.parentNode.removeChild(el)
      }
    })

    app.directive('has-authority', (el, binding: DirectiveBinding) => {
      if (!hasAuthority(binding.value, binding.modifiers)) {
        el.parentNode.removeChild(el)
      }
    })

    app.directive('has-permission', (el, binding: DirectiveBinding) => {
      if (!hasPermission(binding.value, binding.arg, binding.modifiers)) {
        el.parentNode.removeChild(el)
      }
    })
  }
} as Plugin
