export default [
  {
    path: '/admin/meetings',
    name: 'admin-meetings',
    // meta: {
    //   requiresAuth: true
    // },
    component: () =>
      import(
        /* webpackChunkName: "admin-cities" */ '@/components/view/AdminMeetings.vue'
      )
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    // meta: {
    //   requiresAuth: true
    // },
    component: () =>
      import(
        /* webpackChunkName: "admin-users" */ '@/components/view/AdminUsers.vue'
      )
  }
]
