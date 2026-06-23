import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layout/index.vue'),
      redirect: '/xhs',
      children: [
        {
          path: 'xhs',
          name: 'xiaohongshu',
          component: () => import('@/views/xiaohongshu/index.vue')
        },
        {
          path: 'wechat',
          name: 'wechat',
          component: () => import('@/views/wechat/index.vue')
        },
        {
          path: 'markdown',
          name: 'markdown',
          component: () => import('@/views/markdown/index.vue')
        },
        {
          path: 'image2',
          name: 'image2',
          component: () => import('@/views/image2/index.vue')
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/xhs'
    }
  ]
})

router.beforeEach((to, from, next) => {
  next()
})

export default router
