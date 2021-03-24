import axios from 'axios'

export default {
  getListMeetings(userId, params) {
    return axios.get(`/zoom/${userId}/meetings`, { params })
  },
  createMeeting(payload) {
    return axios.post('zoom/createMeeting', payload)
  },
  getMeeting(meetingId) {
    return axios.get(`/zoom/meetings/${meetingId}`)
  },
  updateMeeting(meetingId, payload) {
    return axios.patch(`/zoom/meetings/${meetingId}`, payload)
  },
  deleteMeeting(meetingId) {
    return axios.delete(`/zoom/meetings/${meetingId}`)
  },
  getSignature(meetingNumber, role) {
    return axios.post(`/zoom/web-sdk/signature`, {
      meetingNumber,
      role
    })
  }
}
