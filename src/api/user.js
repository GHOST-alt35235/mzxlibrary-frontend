import request from '@/utils/request'

// 获取用户列表（管理员）
export function getUserList(params) {
  return request.get('/admin/users', { params })
}

// 更新用户状态（封禁/解封）
export function updateUserStatus(userId, status) {
  return request.put(`/admin/users/${userId}/status`, { status })
}

// 重置用户密码（管理员）
export function resetUserPassword(userId, password) {
  return request.put(`/admin/users/${userId}/password`, { password })
}

// 创建用户（管理员）
export function createUser(data) {
  return request.post('/admin/users', data)
}

// 更新用户信息（管理员）
export function updateUser(userId, data) {
  return request.put(`/admin/users/${userId}`, data)
}

// 删除用户（管理员）
export function deleteUser(userId) {
  return request.delete(`/admin/users/${userId}`)
}
