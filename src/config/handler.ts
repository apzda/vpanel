import { gotoLoginPage } from '@/router'
import { defineHandler } from '.'

export default defineHandler({
  onLogin({ url, next }) {
    gotoLoginPage(url, next)
  },
  onRequestTooFast({ url }) {
    console.warn('request "' + url + '" is too fast')
  },
  onErr801: (event) => {
    console.log(event)
  },
  onErr802: (event) => {
    console.log(event)
  }
})
