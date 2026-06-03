import request from '@/utils/request'

// 获取我的积分余额
export function getMyBalance() {
  return request.get('/points/me')
}

// 获取我的积分流水
export function getMyTransactions(params) {
  return request.get('/points/txns', { params })
}

// 管理员发放积分
export function grantPoints(userId, amount) {
  return request.post(`/points/admin/users/${userId}/grant`, { amount })
}

// 管理员扣减积分
export function deductPoints(userId, amount) {
  return request.post(`/points/admin/users/${userId}/deduct`, { amount })
}
