export default [
  {
    path: '/about',
    name: 'about',
    component: () =>
      import(/* webpackChunkName: "about" */ '@/components/view/About.vue')
  }
]
