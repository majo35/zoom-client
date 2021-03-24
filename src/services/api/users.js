import axios from 'axios'

export default {
  getUserInfo(userId) {
    return axios.post(`/zoom/userInfo`, { userId })
  }
}
