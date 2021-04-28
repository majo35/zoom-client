<template>
  <div>
    <v-layout wrap>
      <v-flex xs2>
        <v-snackbar-queue
          :items="notifications"
          bottom
          centered
          @remove="removeItem"
        ></v-snackbar-queue>
      </v-flex>
    </v-layout>

    <v-data-table
      :loading="dataTableLoading"
      :no-data-text="$t('dataTable.NO_DATA')"
      :no-results-text="$t('dataTable.NO_RESULTS')"
      :headers="headers"
      :items="items"
      :options.sync="pagination"
      :items-per-page="5"
      :server-items-length="totalItems"
      class="elevation-1"
      :footer-props="{
        'items-per-page-text': $t('dataTable.ROWS_PER_PAGE'),
        'items-per-page-options': [5, 10, 25]
      }"
    >
      <template v-slot:top>
        <v-layout wrap>
          <v-flex xs12 sm12 md4 mt-3 pl-4>
            <div class="text-left">
              <v-toolbar-title>{{ $t('meetings.TITLE') }}</v-toolbar-title>
            </div>
          </v-flex>
        </v-layout>
      </template>

      <template v-slot:[`item.id`]="{ item }">
        <td class="fill-height px-0">
          <v-layout class="justify-center">
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn
                  id="delete"
                  icon
                  class="mx-0"
                  v-on="on"
                  @click="joinToIframe(item)"
                >
                  <v-icon>mdi-human-greeting-proximity</v-icon>
                </v-btn>
              </template>
              <span>{{ $t('dataTable.JOIN') }}</span>
            </v-tooltip>
          </v-layout>
        </td>
      </template>

      <template v-slot:[`item.start_time`]="{ item }">
        {{ getFormat(item.start_time) }}
      </template>

      <template
        v-slot:[`footer.page-text`]="{ pageStart, pageStop, itemsLength }"
      >
        {{ pageStart }} - {{ pageStop }}
        {{ $t('dataTable.OF') }}
        {{ itemsLength }}
      </template>
      <template v-slot:no-data>{{ $t('dataTable.NO_DATA') }}</template>
      <template v-slot:no-results>{{ $t('dataTable.NO_RESULTS') }}</template>
    </v-data-table>
    <ErrorMessage />
    <SuccessMessage />
    <div
      class="parent-frame"
      id="zoom-call"
      :style="{
        display: zoomCall
      }"
    >
      <iframe
        style="background: #000000"
        id="user_iframe"
        v-resize="{ log: true }"
        width="100%"
        height="500"
        frameborder="0"
        src="http://localhost:9090/"
        allow="camera *;microphone *; fullscreen"
        allowtransparency="true"
      ></iframe>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import io from 'socket.io-client'
import { SERVER_URL } from '../../plugins/axios'
import { getFormat } from '../../utils/utils.js'

export default {
  metaInfo() {
    return {
      title: this.$store.getters.appTitle,
      titleTemplate: `${this.$t('home.TITLE')} - %s`
    }
  },
  created() {
    const socket = io(SERVER_URL, {
      auth: {
        token: 'abc'
      },
      query: {
        role: 'user',
        id: '12345-u',
        meetingNumber: '123',
        roomId: 'user-room'
      }
    })

    socket.on('connect', () => {
      console.log('client socket: ', socket.id)
      console.log(socket.connected)
    })

    socket.on('disconnect', () => {
      console.log(socket.connected)
    })

    socket.on('connect_error', () => {
      console.log('Error')
      socket.connect()
    })

    socket.on('test:msg', (payload) => {
      console.log('HOME - Data from server: ', payload)
    })

    socket.on('notifications', async (payload) => {
      console.log('HOME Data from zoom server: ', payload)
      switch (payload.response.event) {
        case 'meeting.created': {
          const notification = {
            id: payload.response.payload.object.id,
            color: 'success',
            message: `Created ${payload.response.payload.object.topic}`
          }
          this.notifications.push(notification)
          await this.getUserMeetings({
            userId: '6connextest@gmail.com',
            params: {
              type: 'upcoming'
            }
          })
          break
        }
        case 'meeting.deleted': {
          const notification = {
            id: payload.response.payload.object.id,
            color: 'error',
            message: `Deleted ${payload.response.payload.object.topic}`
          }
          const userMeeting = this.$store.getters.userMeetings.some(
            (item) => item.id === payload.response.payload.object.id
          )
          if (userMeeting) {
            this.notifications.push(notification)
            await this.getUserMeetings({
              userId: '6connextest@gmail.com',
              params: {
                type: 'upcoming'
              }
            })
          }
          break
        }
        case 'meeting.updated': {
          const notification = {
            id: payload.response.payload.object.id,
            color: 'warning',
            message: `Updated ${payload.response.payload.object.topic || ''}`
          }
          // const userMeeting = this.$store.getters.userMeetings.some(
          //   (item) => item.id === payload.response.payload.object.id
          // )
          // if (userMeeting) {
          await this.getUserMeetings({
            userId: '6connextest@gmail.com',
            params: {
              type: 'upcoming'
            }
          })
          this.notifications.push(notification)
          // }
          // break
        }
      }
    })
    socket.emit('test:msg', { test: 'test' })
  },
  async mounted() {
    const bindEvent = (element, eventName, eventHandler) => {
      if (element.addEventListener) {
        element.addEventListener(eventName, eventHandler, false)
      } else if (element.attachEvent) {
        element.attachEvent(`on${eventName}`, eventHandler)
      }
    }
    // Listen to message from child window
    bindEvent(window, 'message', this.eventHandler)
  },
  beforeDestroy() {
    const unbindMessageListener = (listener) => {
      if (listener) {
        if (window.removeEventListener) {
          window.removeEventListener('message', listener, false)
        } else if (window.detachEvent) {
          window.detachEvent('onmessage', listener)
        }
      }
    }
    unbindMessageListener(this.eventHandler)
  },
  data() {
    return {
      // colors: ["warning", "error", "info", "success"]
      notifications: [],
      dataTableLoading: true,
      delayTimer: null,
      zoomCall: 'none',
      pagination: {},
      meetingConfig: {
        role: 0,
        userEmail: 'majo@majo.com',
        userName: `User-${Math.floor(Math.random() * 10)}`
      }
    }
  },
  methods: {
    getFormat(date) {
      window.__localeId__ = this.$store.getters.locale
      return getFormat(date, 'iii, MMMM d yyyy, h:mm a')
    },
    removeItem(id) {
      const index = this.notifications.findIndex((item) => item.id === id)
      if (index !== -1) {
        this.notifications.splice(index, 1)
      }
    },
    ...mapActions(['getUserMeeting', 'getUserMeetings']),
    eventHandler(e) {
      if (e.data) {
        try {
          const response = JSON.parse(e.data)
          switch (response.type) {
            case 'HIDE_CALL': {
              this.zoomCall = 'none'
              break
            }
          }
          // eslint-disable-next-line no-unused-vars
        } catch (error) {}
      }
    },
    sendMessage(msg) {
      // Make sure you are sending a string, and to stringify JSON
      const iframeEl = document.getElementById('user_iframe')
      iframeEl.contentWindow.postMessage(msg, '*')
    },
    async joinToIframe(item) {
      this.zoomCall = 'block'
      const meetingDetail = await this.getUserMeeting(item.id)
      const callData = {
        meetingNumber: item.id,
        userName: this.meetingConfig.userName,
        userEmail: this.meetingConfig.userEmail,
        passWord: meetingDetail.password,
        role: 0
      }
      this.sendMessage(
        JSON.stringify({
          type: 'START_MEETING',
          data: callData
        })
      )
    }
  },
  computed: {
    headers() {
      return [
        {
          text: this.$i18n.t('dataTable.ACTIONS'),
          value: 'id',
          sortable: false,
          width: 100
        },
        {
          text: this.$i18n.t('meetings.topic'),
          align: 'left',
          sortable: true,
          value: 'topic'
        },
        {
          text: this.$i18n.t('meetings.duration'),
          align: 'left',
          sortable: true,
          value: 'duration'
        },

        {
          text: this.$i18n.t('meetings.start_time'),
          align: 'left',
          sortable: true,
          value: 'start_time'
        },

        {
          text: this.$i18n.t('meetings.timezone'),
          align: 'left',
          sortable: true,
          value: 'timezone'
        },

        {
          text: this.$i18n.t('meetings.join_url'),
          align: 'left',
          sortable: true,
          value: 'join_url'
        }
      ]
    },
    items() {
      return this.$store.getters.userMeetings
    },
    totalItems() {
      return this.$store.getters.userTotalMeetings
    }
  },
  watch: {
    pagination: {
      async handler() {
        try {
          this.dataTableLoading = true
          await this.getUserMeetings({
            userId: '6connextest@gmail.com',
            params: {
              type: 'upcoming'
            }
          })
          this.dataTableLoading = false
          // eslint-disable-next-line no-unused-vars
        } catch (error) {
          this.dataTableLoading = false
        }
      },
      deep: true
    }
  }
}
</script>

<style scoped></style>
