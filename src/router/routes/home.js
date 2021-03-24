export default [
  {
    path: '/',
    name: 'home-public',
    // meta: {
    //   requiresAuth: true
    // },
    component: () =>
      import(/* webpackChunkName: "home" */ '@/components/view/Home.vue')
  },
  {
    path: '/home',
    name: 'home',
    // meta: {
    //   requiresAuth: true
    // },
    component: () =>
      import(/* webpackChunkName: "home" */ '@/components/view/Home.vue')
  }
]
