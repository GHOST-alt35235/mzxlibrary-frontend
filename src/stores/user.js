import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '@/utils/request'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)

  const isLoggedIn = computed(() => !!token.value)

  // 登录
  async function login(loginData) {
    const res = await request.post('/auth/login', loginData)
    const newToken = res.data.token
    token.value = newToken
    localStorage.setItem('token', newToken)
    // 等待一小段时间确保localStorage已更新
    await new Promise(resolve => setTimeout(resolve, 10))
    await fetchUserInfo()
    return res
  }

  // 注册
  async function register(registerData) {
    const res = await request.post('/auth/register', registerData)
    token.value = res.data.token
    localStorage.setItem('token', res.data.token)
    await fetchUserInfo()
    return res
  }

  // 登出
  async function logout() {
    try {
      await request.post('/auth/logout')
    } finally {
      token.value = ''
      userInfo.value = null
      localStorage.removeItem('token')
    }
  }

  // 获取用户信息
  async function fetchUserInfo() {
    const res = await request.get('/auth/me')
    userInfo.value = res.data
    return res
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    register,
    logout,
    fetchUserInfo
  }
})
