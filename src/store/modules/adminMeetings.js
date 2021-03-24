import meetingsApi from '../../services/api/meetings'
import { buildSuccess, handleError } from '@/utils/utils.js'
import * as types from '../mutation-types'

const getters = {
  meetings: (state) => state.meetings,
  totalMeetings: (state) => state.totalUsers
}

const actions = {
  getMeetings({ commit }, { userId, params }) {
    return new Promise((resolve, reject) => {
      meetingsApi
        .getListMeetings(userId, params)
        .then((response) => {
          commit(types.MEETINGS, response.data.meetings)
          /* eslint-disable-next-line camelcase  */
          commit(types.TOTAL_MEETINGS, response.data.total_records)
          resolve()
        })
        .catch((error) => {
          handleError(error, commit, reject)
        })
    })
  },
  createMeeting({ commit }, payload) {
    return new Promise((resolve, reject) => {
      meetingsApi
        .createMeeting(payload)
        .then(() => {
          buildSuccess(
            {
              msg: 'common.SAVED_SUCCESSFULLY'
            },
            commit,
            resolve
          )
        })
        .catch((error) => {
          handleError(error, commit, reject)
        })
    })
  },
  deleteMeeting({ commit }, payload) {
    return new Promise((resolve, reject) => {
      meetingsApi
        .deleteMeeting(payload)
        .then(() => {
          buildSuccess(
            {
              msg: 'common.DELETED_SUCCESSFULLY'
            },
            commit,
            resolve
          )
        })
        .catch((error) => {
          handleError(error, commit, reject)
        })
    })
  },
  getMeeting({ commit }, meetingId) {
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
  updateMeeting({ commit }, { meetingId, data }) {
    return new Promise((resolve, reject) => {
      meetingsApi
        .updateMeeting(meetingId, data)
        .then(() => {
          buildSuccess(
            {
              msg: 'common.SAVED_SUCCESSFULLY'
            },
            commit,
            resolve
          )
        })
        .catch((error) => {
          handleError(error, commit, reject)
        })
    })
  }
}

const mutations = {
  [types.MEETINGS](state, meetings) {
    state.meetings = meetings
  },
  [types.TOTAL_MEETINGS](state, value) {
    state.totalMeetings = value
  }
}

const state = {
  meetings: [],
  totalMeetings: 0
}

export default {
  state,
  getters,
  actions,
  mutations
}
