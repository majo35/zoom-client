export default [
  {
    path: '*',
    component: () =>
      import(
        /* webpackChunkName: "notfound" */ '@/components/view/NotFound.vue'
      )
  }
]
