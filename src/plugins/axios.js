import Vue from 'vue'
import axios from 'axios'

export const SERVER_URL = process.env.VUE_APP_API_URL || ''

export const ZOOM_CALL_URL =
  process.env.ZOOM_CALL_APP_URL || 'http://localhost:9090'

console.log('ZOOM APP: ', ZOOM_CALL_URL)

axios.defaults.baseURL = SERVER_URL
axios.defaults.headers.common['Accept-Language'] =
  JSON.parse(localStorage.getItem('locale')) || 'en'

axios.interceptors.request.use(
  (config) => {
    // Do something before request is sent
    // If request is different than any of the URLS in urlsExcludedForBearerHeader
    // then send Authorization header with token from localstorage
    const urlsExcludedForBearerHeader = [
      '/login',
      '/forgot',
      '/register',
      '/reset',
      `${window.location.origin}/version.json`
    ]
    if (urlsExcludedForBearerHeader.indexOf(config.url) === -1) {
      // ${JSON.parse(localStorage.getItem('token'))}
      // config.headers.Authorization = `Bearer ${JWT_TOKEN}`
    }
    return config
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error)
  }
)

// Add a response interceptor
axios.interceptors.response.use(
  (response) => {
    // Do something with response data
    // Checks if app is being used in mobile
    return response
  },
  (error) => {
    // Do something with response error
    return Promise.reject(error)
  }
)

// eslint-disable-next-line no-shadow
Plugin.install = (Vue) => {
  Vue.axios = axios
  window.axios = axios
  Object.defineProperties(Vue.prototype, {
    axios: {
      get() {
        return axios
      }
    },
    $axios: {
      get() {
        return axios
      }
    }
  })
}

Vue.use(Plugin)

export default Plugin
