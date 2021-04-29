import meetingsApi from '../../services/api/meetings'
import { handleError } from '@/utils/utils.js'
import * as types from '../mutation-types'

const getters = {
  userMeetings: (state) => state.userMeetings,
  userTotalMeetings: (state) => state.userTotalMeetings
}

const actions = {
  getUserMeetings({ commit }, { userId, params }) {
    return new Promise((resolve, reject) => {
      meetingsApi
        .getListMeetings(userId, params)
        .then((response) => {
          commit(types.USER_MEETINGS, response.data.meetings)
          /* eslint-disable-next-line camelcase  */
          commit(types.USER_TOTAL_MEETINGS, response.data.total_records)
          resolve()
        })
        .catch((error) => {
          handleError(error, commit, reject)
        })
    })
  },
  getUserMeeting({ commit }, meetingId) {
    return new Promise((resolve, reject) => {
      meetingsApi
        .getMeeting(meetingId)
        .then(({ data }) => {
          resolve(data)
        })
        .catch((error) => {
          handleError(error, commit, reject)
        })
    })
  },
  getUserAdditionalMeetings({ commit }, { userId, params }) {
    return new Promise((resolve, reject) => {
      meetingsApi
        .getListMeetings(userId, params)
        .then((response) => {
          console.error('Additional: ', response.data.meetings)
          commit(types.ADD_USER_MEETINGS, response.data.meetings)
          /* eslint-disable-next-line camelcase  */
          commit(types.TOTAL_USER_MEETINGS_INC, response.data.total_records)
          resolve()
        })
        .catch((error) => {
          handleError(error, commit, reject)
        })
    })
  }
}

const mutations = {
  [types.USER_MEETINGS](state, meetings) {
    state.userMeetings = meetings
  },
  [types.USER_TOTAL_MEETINGS](state, value) {
    state.userTotalMeetings = value
  },
  [types.ADD_USER_MEETINGS](state, meetings) {
    state.userMeetings = [...state.userMeetings, ...meetings]
  },
  [types.TOTAL_USER_MEETINGS_INC](state, value) {
    state.userTotalMeetings += value
  }
}

const state = {
  userMeetings: [],
  userTotalMeetings: 0
}

export default {
  state,
  getters,
  actions,
  mutations
}
