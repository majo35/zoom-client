import axios from 'axios'

export default {
  getUserInfo(userId) {
    return axios.post(`/zoom/userInfo`, { userId })
  },
  createUser(payload) {
    return axios.post('zoom/users', payload)
  },
  getListUsers() {
    return axios.get(`/zoom/users`)
  },
  updateUserSettings(userId, payload) {
    return axios.patch(`/zoom/users/${userId}/settings`, payload)
  },
  deleteUser(userId) {
    return axios.delete(`/zoom/users/${userId}`)
  }
}
