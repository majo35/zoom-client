import Vue from 'vue'
import '@/plugins/axios'
import vuetify from '@/plugins/vuetify'
import '@/plugins/veevalidate'
import '@/plugins/common'
import '@/plugins/googleAnalytics'
import i18n from '@/plugins/i18n'
import App from '@/App.vue'
import router from '@/router'
import { store } from '@/store'
import VuetifyConfirm from 'vuetify-confirm'
import iframeResize from 'iframe-resizer/js/iframeResizer'
import VueNotification from '@kugatsu/vuenotification'
import VuetifySnackbarQueue from 'vuetify-snackbar-queue'

Vue.use(VuetifySnackbarQueue)

Vue.config.productionTip = false

Vue.prototype.ZoomMtg = window.ZoomMtg

Vue.use(VuetifyConfirm, { vuetify })

Vue.use(VueNotification, {
  timer: 20
})

Vue.directive('resize', {
  bind(el, { value = {} }) {
    el.addEventListener('load', () => iframeResize(value, el))
  },
  unbind(el) {
    el.iFrameResizer.removeListeners()
  }
})

new Vue({
  vuetify,
  router,
  store,
  i18n,
  render: (h) => h(App),
  created() {
    store.dispatch('setLocale', store.getters.locale)
  }
}).$mount('#app')
