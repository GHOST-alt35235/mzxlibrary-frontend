import request from '@/utils/request'

// 查询资源列表
export function getResourceList(params) {
  return request.get('/resources', { params })
}

// 查询我的资源
export function getMyResources(params) {
  return request.get('/resources/me', { params })
}

// 查询资源详情
export function getResourceById(id) {
  return request.get(`/resources/${id}`)
}

// 创建资源
export function createResource(data) {
  return request.post('/resources', data)
}

// 更新资源
export function updateResource(id, data) {
  return request.put(`/resources/${id}`, data)
}

// 提交审核
export function submitForReview(id) {
  return request.put(`/resources/${id}/submit`)
}

// 审核通过
export function approveResource(id) {
  return request.put(`/resources/${id}/approve`)
}

// 拒绝审核
export function rejectResource(id) {
  return request.put(`/resources/${id}/reject`)
}

// 下架资源
export function offlineResource(id) {
  return request.put(`/resources/${id}/offline`)
}
