import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/Register.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/Profile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/books',
      name: 'BookList',
      component: () => import('@/views/books/BookList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/books/:id',
      name: 'BookDetail',
      component: () => import('@/views/books/BookDetail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/resources',
      name: 'ResourceList',
      component: () => import('@/views/resources/ResourceList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/chat',
      name: 'Chat',
      component: () => import('@/views/chat/Chat.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/points',
      name: 'Points',
      component: () => import('@/views/points/Points.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/dashboard',
      name: 'AdminDashboard',
      component: () => import('@/views/admin/AdminDashboard.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/users',
      name: 'UserManagement',
      component: () => import('@/views/admin/UserManagement.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/books',
      name: 'BookManagement',
      component: () => import('@/views/admin/BookManagement.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/books/offline',
      name: 'OfflineBookManagement',
      component: () => import('@/views/admin/OfflineBookManagement.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/resources',
      name: 'ResourceManagement',
      component: () => import('@/views/admin/ResourceManagement.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/comments',
      name: 'CommentManagement',
      component: () => import('@/views/admin/CommentManagement.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/statistics',
      name: 'Statistics',
      component: () => import('@/views/admin/Statistics.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
})

// 路由守卫 - 简化版本，直接访问所有页面
router.beforeEach(async (to, from, next) => {
  next()
})

export default router