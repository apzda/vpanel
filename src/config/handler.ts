import { gotoLoginPage, gotoPage } from '@/router'
import { defineHandler } from '.'

export default defineHandler({
  onLogin({ url, next }) {
    gotoLoginPage(url, next)
  },
  onResetPassword({ url, next }) {
    gotoPage('resetPwdUrl', url, next)
  },
  onRequestTooFast({ url }) {
    console.warn('request "' + url + '" is too fast')
  },
  onErr801(event) {
    event.suppress = true
    gotoPage('mfaSetupUrl')
    return true
  },
  onErr802(event) {
    event.suppress = true
    gotoPage('mfaVerifyUrl')
    return true
  },
  onErr813(event) {
    event.suppress = true
    gotoPage('resetPwdUrl')
    return true
  }
})
