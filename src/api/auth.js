import request from '@/utils/request'

// 登录
export function login(data) {
  return request.post('/auth/login', data)
}

// 注册
export function register(data) {
  return request.post('/auth/register', data)
}

// 登出
export function logout() {
  return request.post('/auth/logout')
}

// 获取当前用户信息
export function getCurrentUser() {
  return request.get('/auth/me')
}

// 更新用户资料
export function updateProfile(data) {
  return request.put('/auth/profile', data)
}

// 修改密码
export function changePassword(data) {
  return request.put('/auth/password', data)
}
