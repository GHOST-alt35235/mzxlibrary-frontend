import request from '@/utils/request'

// 获取会话列表
export function getSessions() {
  return request.get('/chat/sessions')
}

// 创建会话
export function createSession(targetUserId) {
  return request.post('/chat/sessions', { targetUserId })
}

// 获取消息列表
export function getMessages(sessionId, params) {
  return request.get(`/chat/sessions/${sessionId}/messages`, { params })
}

// 发送消息
export function sendMessage(sessionId, data) {
  return request.post(`/chat/sessions/${sessionId}/messages`, data)
}

// 标记已读
export function markAsRead(sessionId) {
  return request.post(`/chat/sessions/${sessionId}/read`)
}
