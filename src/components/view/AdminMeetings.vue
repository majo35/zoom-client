<template>
  <div>
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

          <v-flex xs12 sm6 md4 px-3> </v-flex>

          <v-flex xs12 sm6 md4 text-xs-right mb-2 mt-2 pr-2>
            <ValidationObserver
              ref="observer"
              v-slot="{ invalid }"
              tag="form"
              @submit.prevent="submit()"
            >
              <v-dialog
                v-model="dialog"
                max-width="800px"
                content-class="dlgNewEditItem"
              >
                <template v-slot:activator="{ on }">
                  <div class="text-right">
                    <v-btn color="secondary" v-on="on" class="btnNewItem pr-4">
                      <v-icon class="mr-2">mdi-plus</v-icon>
                      {{ $t('dataTable.NEW_ITEM') }}
                    </v-btn>
                  </div>
                </template>

                <v-card>
                  <v-card-title>
                    <span class="headline">{{ formTitle }}</span>
                  </v-card-title>
                  <v-card-text>
                    <v-container grid-list-md>
                      <v-layout wrap>
                        <template v-if="editedItem.id">
                          <v-flex xs24 md6>
                            <label for="created_at">{{
                              $t('common.CREATED')
                            }}</label>
                            <div name="created_at">
                              {{ getFormat(editedItem.created_at) }}
                            </div>
                          </v-flex>
                        </template>

                        <v-flex xs24 md12 v-if="!editedItem.id">
                          <v-switch
                            v-model="concurrencyMeeting1"
                            :label="`Concurrency Meeting: ${concurrencyMeeting1.toString()}`"
                          ></v-switch>
                        </v-flex>

                        <!--                        <v-flex xs24 md12 v-if="!editedItem.id">-->
                        <!--                          <v-switch-->
                        <!--                            v-model="concurrencyMeeting2"-->
                        <!--                            :label="`concurrencyMeeting2: ${concurrencyMeeting2.toString()}`"-->
                        <!--                          ></v-switch>-->
                        <!--                        </v-flex>-->

                        <v-flex xs12 md6>
                          <ValidationProvider
                            rules="required"
                            v-slot="{ errors }"
                          >
                            <v-text-field
                              id="topic"
                              name="topic"
                              v-model="editedItem.topic"
                              :label="$t('meetings.headers.topic')"
                              :error="errors.length > 0"
                              :error-messages="errors[0]"
                              autocomplete="off"
                            ></v-text-field>
                          </ValidationProvider>
                        </v-flex>

                        <v-flex xs12 md6>
                          <ValidationProvider
                            rules="required"
                            v-slot="{ errors }"
                          >
                            <v-text-field
                              id="agenda"
                              name="agenda"
                              v-model="editedItem.agenda"
                              :label="$t('meetings.headers.agenda')"
                              :error="errors.length > 0"
                              :error-messages="errors[0]"
                              autocomplete="off"
                            ></v-text-field>
                          </ValidationProvider>
                        </v-flex>

                        <v-flex xs12 md6>
                          <ValidationProvider
                            rules="required"
                            v-slot="{ errors }"
                          >
                            <v-text-field
                              id="duration"
                              name="duration"
                              type="number"
                              class="inputNumber"
                              v-model="editedItem.duration"
                              :label="$t('meetings.headers.duration')"
                              :error="errors.length > 0"
                              :error-messages="errors[0]"
                              autocomplete="off"
                            ></v-text-field>
                          </ValidationProvider>
                        </v-flex>

                        <v-flex xs12 md6>
                          <ValidationProvider
                            rules="required"
                            v-slot="{ errors }"
                          >
                            <v-datetime-picker
                              id="start_time"
                              name="start_time"
                              :error="errors.length > 0"
                              :error-messages="errors[0]"
                              :label="$t('meetings.headers.start_time')"
                              v-model="editedItem.start_time"
                              timeFormat="HH:mm"
                            >
                            </v-datetime-picker>
                          </ValidationProvider>
                        </v-flex>

                        <v-flex xs12 md6>
                          <ValidationProvider
                            rules="required"
                            v-slot="{ errors }"
                          >
                            <v-text-field
                              id="password"
                              name="password"
                              v-model="editedItem.password"
                              :label="$t('meetings.headers.password')"
                              :error="errors.length > 0"
                              :error-messages="errors[0]"
                              autocomplete="off"
                            ></v-text-field>
                          </ValidationProvider>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="red lighten3"
                      text
                      @click="close"
                      class="btnCancel"
                      >{{ $t('dataTable.CANCEL') }}</v-btn
                    >
                    <v-btn
                      color="green"
                      text
                      @click="save"
                      :disabled="invalid"
                      class="btnSave"
                      >{{ $t('dataTable.SAVE') }}</v-btn
                    >
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </ValidationObserver>
          </v-flex>
        </v-layout>
      </template>

      <template v-slot:[`item.id`]="{ item }">
        <td class="fill-height px-0">
          <v-layout class="justify-center">
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn
                  id="edit"
                  icon
                  class="mx-0"
                  v-on="on"
                  @click="editItem(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>{{ $t('dataTable.EDIT') }}</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn
                  id="delete"
                  icon
                  class="mx-0"
                  v-on="on"
                  @click="deleteItem(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                  <!--                  <v-icon>mdi-human-greeting-proximity</v-icon>-->
                </v-btn>
              </template>
              <span>{{ $t('dataTable.DELETE') }}</span>
            </v-tooltip>

            <!--            <v-tooltip top>-->
            <!--              <template v-slot:activator="{ on }">-->
            <!--                <v-btn-->
            <!--                  id="join"-->
            <!--                  icon-->
            <!--                  class="mx-0"-->
            <!--                  v-on="on"-->
            <!--                  @click="joinTo(item)"-->
            <!--                >-->
            <!--                  <v-icon>mdi-clock-start</v-icon>-->
            <!--                </v-btn>-->
            <!--              </template>-->
            <!--              <span>{{ $t('dataTable.JOIN') }}</span>-->
            <!--            </v-tooltip>-->

            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn
                  id="join2"
                  icon
                  class="mx-0"
                  v-on="on"
                  @click="joinToIframe(item)"
                >
                  <v-icon>mdi-clock-start</v-icon>
                </v-btn>
              </template>
              <span>{{ $t('dataTable.JOIN') }}</span>
            </v-tooltip>

            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn
                  id="liveStream"
                  icon
                  class="mx-0"
                  v-on="on"
                  @click="liveStream(item)"
                >
                  <v-icon>mdi-cctv</v-icon>
                </v-btn>
              </template>
              <span>{{ $t('dataTable.LIVE_STREAM') }}</span>
            </v-tooltip>
          </v-layout>
        </td>
      </template>

      <template v-slot:[`item.start_time`]="{ item }">
        {{ getFormat(item.start_time) }}
      </template>

      <template v-slot:[`item.created_at`]="{ item }">
        {{ getFormat(item.created_at) }}
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
    <v-dialog
      v-model="liveDialog"
      max-width="800px"
      content-class="dlgNewEditItem"
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{ 'Live Streaming' }}</span>
        </v-card-title>

        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <template>
                <v-flex xs24 md6>
                  <label for="meeting_id">{{ $t('common.meeting_id') }}</label>
                  <div name="meeting_id">
                    {{ liveItem.id }}
                  </div>
                </v-flex>
              </template>

              <v-flex xs24 md12>
                <v-text-field
                  id="url"
                  name="url"
                  v-model="liveItem.url"
                  :label="$t('meetings.headers.url')"
                  autocomplete="off"
                ></v-text-field>
              </v-flex>

              <v-flex xs24 md12>
                <v-text-field
                  id="key"
                  name="key"
                  v-model="liveItem.key"
                  :label="$t('meetings.headers.key')"
                  autocomplete="off"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green"
            text
            @click="startLiveStream"
            class="btnLiveStream"
            >{{ $t('dataTable.START_STREAM') }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div
      class="parent-frame"
      id="zoom-call"
      :style="{
        display: zoomCall
      }"
    >
      <iframe
        style="background: #000000"
        id="admin_iframe"
        v-resize="{ log: true }"
        width="100%"
        height="500"
        frameborder="0"
        :src="ZOOM_CALL_URL"
        allow="camera *;microphone *; fullscreen"
        allowtransparency="true"
      ></iframe>
    </div>
    <zoom />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { getFormat } from '../../utils/utils.js'
import meetingsApi from '../../services/api/meetings'
import usersApi from '../../services/api/users'
import zoom from '../zoom'
import io from 'socket.io-client'
import { SERVER_URL, ZOOM_CALL_URL } from '../../plugins/axios'
import dayjs from 'dayjs'

export default {
  name: 'AdminMeetings',
  components: {
    zoom
  },
  async created() {
    usersApi.getUserInfo('6connextest@gmail.com').then((result) => {
      this.userId = result.data.id
    })

    const socket = io(SERVER_URL, {
      auth: {
        token: 'abc'
      },
      query: {
        role: 'admin',
        id: '12345',
        meetingNumber: '123',
        roomId: 'admin-room'
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
      console.log('Data from server: ', payload)
    })

    socket.on('notifications', async (payload) => {
      console.error('Data from server: ', payload)
      switch (payload.response.event) {
        case 'meeting.ended': {
          this.zoomCall = 'none'
          if (
            /* eslint-disable-next-line camelcase  */
            payload.response.payload.object.host_id &&
            this.userId &&
            /* eslint-disable-next-line camelcase  */
            payload.response.payload.object.host_id !== this.userId
          ) {
            this.dataTableLoading = true
            await this.deleteMeeting(payload.response.payload.object.id)
            /* eslint-disable-next-line camelcase  */
            await usersApi.deleteUser(payload.response.payload.object.host_id)
            await this.loadAllMeetings()
            this.dataTableLoading = false
          }
          break
        }
        case 'meeting.created':
        case 'meeting.deleted':
        case 'meeting.updated': {
          await this.loadAllMeetings()
        }
      }
    })
    socket.emit('test:msg', { test: 'test' })
  },
  mounted() {
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
  destroyed() {
    console.log('Destroyed')
  },
  metaInfo() {
    return {
      title: this.$store.getters.appTitle,
      titleTemplate: `${this.$t('meetings.TITLE')} - %s`
    }
  },
  data() {
    return {
      userId: null,
      ZOOM_CALL_URL,
      dataTableLoading: true,
      delayTimer: null,
      dialog: false,
      liveDialog: false,
      liveItem: { key: '', url: '' },
      zoomCall: 'none',
      pagination: {},
      editedItem: {
        /* eslint-disable-next-line camelcase  */
        start_time: new Date()
      },
      defaultItem: {},
      concurrencyMeeting1: false,
      concurrencyMeeting2: false,
      meetingConfig: {
        leaveUrl: 'http://localhost:8080/admin/meetings',
        role: 1,
        userEmail: 'admin@zoomRoomAdmin.com',
        userName: 'Admin of Room'
      }
    }
  },
  computed: {
    formTitle() {
      return this.editedItem.id
        ? this.$t('dataTable.EDIT_ITEM')
        : this.$t('dataTable.NEW_ITEM')
    },
    headers() {
      return [
        {
          text: this.$i18n.t('dataTable.ACTIONS'),
          value: 'id',
          sortable: false,
          width: 100
        },

        {
          text: 'Host ID',
          align: 'left',
          sortable: true,
          value: 'host_id'
        },

        {
          text: this.$i18n.t('meetings.topic'),
          align: 'left',
          sortable: true,
          value: 'topic'
        },

        {
          text: this.$i18n.t('meetings.agenda'),
          align: 'left',
          sortable: true,
          value: 'agenda'
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
        },

        {
          text: this.$i18n.t('meetings.CREATED'),
          align: 'left',
          sortable: true,
          value: 'created_at'
        }
      ]
    },
    items() {
      return this.$store.getters.meetings
    },
    totalItems() {
      return this.$store.getters.totalMeetings
    }
  },
  watch: {
    dialog(value) {
      return value ? true : this.close()
    },
    liveDialog(value) {
      return value ? true : this.closeLiveDialog()
    },
    pagination: {
      async handler() {
        this.dataTableLoading = true
        try {
          await this.loadAllMeetings()
          this.dataTableLoading = false
          // eslint-disable-next-line no-unused-vars
        } catch (error) {}
        this.dataTableLoading = false
      },
      deep: true
    }
  },
  methods: {
    async loadAllMeetings() {
      await this.getMeetings({
        userId: '6connextest@gmail.com'
      })
      const userListResponse = await usersApi.getListUsers()
      // console.error('Users: ', userListResponse.data.users)
      userListResponse.data.users.forEach(async (user) => {
        try {
          await this.getAdditionalMeetings({
            userId: user.email
          })
          // eslint-disable-next-line no-unused-vars
        } catch (error) {}
      })
    },
    /* eslint-disable-next-line max-statements */
    async eventHandler(e) {
      if (e.data) {
        try {
          const response = JSON.parse(e.data)
          switch (response.type) {
            case 'HIDE_CALL': {
              this.zoomCall = 'none'
              console.error('UserInfo: ', this.userId)
              console.error('hostId:', response.data?.hostId)
              // if (
              //   response.data?.hostId &&
              //   this.userId &&
              //   response.data?.hostId !== this.userId
              // ) {
              //   this.dataTableLoading = true
              //   await this.deleteMeeting(response.data?.meetingId)
              //   console.error('DELETE USER: ', response.data?.hostId)
              //   await usersApi.deleteUser(response.data?.hostId)
              //   await this.getMeetings({ userId: '6connextest@gmail.com' })
              //   await this.getAdditionalMeetings({ userId: 'majo@majo.com' })
              //   await this.getAdditionalMeetings({ userId: 'majo@majo2.com' })
              //   this.dataTableLoading = false
              // }
              break
            }
          }
          // eslint-disable-next-line no-unused-vars
        } catch (error) {}
      }
    },
    ...mapActions([
      'getMeetings',
      'createMeeting',
      'deleteMeeting',
      'getMeeting',
      'updateMeeting',
      'getAdditionalMeetings'
    ]),
    getFormat(date) {
      window.__localeId__ = this.$store.getters.locale
      return getFormat(date, 'iii, MMMM d yyyy, h:mm a')
    },
    close() {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = {
          /* eslint-disable-next-line camelcase  */
          start_time: new Date()
        }
      }, 300)
    },
    closeLiveDialog() {
      this.liveDialog = false
      setTimeout(() => {
        this.liveItem = {
          id: '',
          key: '',
          url: ''
        }
      }, 300)
    },
    trueFalse(value) {
      return value
        ? '<i aria-hidden="true" class="v-icon mdi mdi-check green--text" style="font-size: 16px;"></i>'
        : '<i aria-hidden="true" class="v-icon mdi mdi-close red--text" style="font-size: 16px;"></i>'
    },
    async editItem(item) {
      const meetingDetail = await this.getMeeting(item.id)
      this.editedItem = {
        ...meetingDetail,
        /* eslint-disable-next-line camelcase  */
        start_time: new Date(meetingDetail.start_time)
      }
      this.dialog = true
    },
    async deleteItem(item) {
      try {
        const response = await this.$confirm(
          this.$t('common.DO_YOU_REALLY_WANT_TO_DELETE_THIS_ITEM'),
          {
            title: this.$t('common.WARNING'),
            buttonTrueText: this.$t('common.DELETE'),
            buttonFalseText: this.$t('common.CANCEL'),
            buttonTrueColor: 'red lighten3',
            buttonFalseColor: 'yellow'
          }
        )
        if (response) {
          this.dataTableLoading = true
          await this.deleteMeeting(item.id)
          await this.loadAllMeetings()
          this.dataTableLoading = false
        }
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        this.dataTableLoading = false
      }
    },
    defaultSettings() {
      const settings = {
        /* eslint-disable-next-line camelcase  */
        host_video: false,
        /* eslint-disable-next-line camelcase  */
        participant_video: false,
        /* eslint-disable-next-line camelcase  */
        join_before_host: true,
        /* eslint-disable-next-line camelcase  */
        use_pmi: false,
        /* eslint-disable-next-line camelcase  */
        breakout_room: {
          enable: true,
          rooms: [
            {
              name: 'ui room1',
              participants: [
                //   'james.user01@somemail1234.com',
                //   'james.user02@somemail1234.com'
              ]
            },
            {
              name: 'ui room2',
              participants: [] // ['james.user03@somemail1234.com']
            }
          ],
          /* eslint-disable-next-line camelcase  */
          host_video: false,
          /* eslint-disable-next-line camelcase  */
          participant_video: false
        }
      }
      return settings
    },
    createUser(email) {
      return usersApi.createUser({
        action: 'custCreate',
        /* eslint-disable-next-line camelcase  */
        user_info: {
          email,
          type: 1,
          /* eslint-disable-next-line camelcase  */
          first_name: 'Tom',
          /* eslint-disable-next-line camelcase  */
          last_name: 'Jerry'
        }
      })
    },
    setUpUserSetting(email) {
      return usersApi.updateUserSettings(email, {
        /* eslint-disable-next-line camelcase  */
        in_meeting: {
          /* eslint-disable-next-line camelcase  */
          breakout_room: true,
          /* eslint-disable-next-line camelcase  */
          allow_live_streaming: false
        }
      })
    },
    /* eslint-disable-next-line max-statements */
    async save() {
      try {
        this.dataTableLoading = true
        // Updating item
        if (this.editedItem.id) {
          await this.updateMeeting({
            meetingId: this.editedItem.id,
            data: {
              topic: this.editedItem.topic,
              agenda: this.editedItem.agenda,
              duration: parseInt(this.editedItem.duration),
              /* eslint-disable-next-line camelcase  */
              start_time: dayjs(this.editedItem.start_time).format(
                `YYYY-MM-DDTHH:mm:ss`
              ),
              password: this.editedItem.password
            }
          })
          await this.loadAllMeetings()
          this.dataTableLoading = false
        } else {
          let userEmail = '6connextest@gmail.com'
          if (this.concurrencyMeeting1) {
            userEmail = `user${Math.floor(Math.random() * 100)}@majo.com`
          }
          const newMeeting = {
            userId: userEmail,
            meeting: {
              ...this.editedItem,
              duration: parseInt(this.editedItem.duration),
              /* eslint-disable-next-line camelcase  */
              start_time: dayjs(this.editedItem.start_time).format(
                `YYYY-MM-DDTHH:mm:ss`
              ),
              settings: this.defaultSettings()
            }
          }
          if (this.concurrencyMeeting1) {
            try {
              await this.createUser(userEmail)
              await this.setUpUserSetting(userEmail)
              await this.createMeeting(newMeeting)
              await this.loadAllMeetings()
              // eslint-disable-next-line no-unused-vars
            } catch (e) {}
          } else {
            await this.createMeeting(newMeeting)
            await this.loadAllMeetings()
          }
        }
        this.dataTableLoading = false
        this.close()
        this.concurrencyMeeting1 = false
        this.concurrencyMeeting2 = false
        return
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        this.dataTableLoading = false
        this.close()
      }
    },
    sendMessage(msg) {
      // Make sure you are sending a string, and to stringify JSON
      const iframeEl = document.getElementById('admin_iframe')
      iframeEl.contentWindow.postMessage(msg, '*')
    },
    async joinTo(item) {
      const {
        data: { signature, apiKey }
      } = await meetingsApi.getSignature(item.id, 1)
      const meetingDetail = await this.getMeeting(item.id)
      this.startMeeting(item.id, signature, apiKey, meetingDetail.password)
    },
    liveStream(item) {
      console.log('Live Stream: ', item)
      this.liveDialog = true
      this.liveItem = { ...this.liveItem, ...item }
    },
    startLiveStream() {
      console.log('Start Live Stream: ', this.liveItem)
      this.liveDialog = false
    },
    async joinToIframe(item) {
      // show iframe
      // id zoom-call
      this.zoomCall = 'block'
      const meetingDetail = await this.getMeeting(item.id)
      /* eslint-disable-next-line camelcase  */
      console.log('meetingDetail: ', meetingDetail.host_id)
      // Send a message to the child iframe
      const callData = {
        meetingNumber: item.id,
        userName: this.meetingConfig.userName,
        userEmail: this.meetingConfig.userEmail,
        passWord: meetingDetail.password,
        /* eslint-disable-next-line camelcase  */
        hostEmail: meetingDetail.host_email,
        /* eslint-disable-next-line camelcase  */
        hostId: meetingDetail.host_id,
        role: 1
      }
      this.sendMessage(
        JSON.stringify({
          type: 'START_MEETING',
          data: callData
        })
      )
    },
    startMeeting(meetingId, signature, apiKey, password) {
      document.getElementById('zmmtg-root').style.display = 'block'

      this.ZoomMtg.init({
        leaveUrl: this.meetingConfig.leaveUrl,
        isSupportAV: true,
        success: () => {
          this.ZoomMtg.join({
            meetingNumber: meetingId,
            userName: this.meetingConfig.userName,
            signature,
            apiKey,
            userEmail: this.meetingConfig.userEmail,
            passWord: password,
            success: (done) => {
              console.log(done)
            },
            error: (error) => {
              console.log(error)
            }
          })
        },
        error: (error) => {
          console.log(error)
        }
      })
    }
  }
}
</script>

<style>
.inputNumber input[type='number'] {
  -moz-appearance: textfield;
}
.inputNumber input::-webkit-outer-spin-button,
.inputNumber input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

/*.parent-frame {*/
/*  display: flex;*/
/*  flex-direction: column;*/
/*  min-height: 100vh;*/
/*}*/
/*.parent-frame .banner {*/
/*  background: #f00;*/
/*  width: 100%;*/
/*  height: 30px;*/
/*}*/
/*.parent-frame iframe {*/
/*  border: none;*/
/*  flex-grow: 1;*/
/*}*/
</style>
