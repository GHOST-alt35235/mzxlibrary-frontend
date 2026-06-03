import request from '@/utils/request'

// 发布评论
export function addComment(bookId, data) {
  return request.post(`/books/${bookId}/comments`, data)
}

// 查询评论列表
export function getCommentList(bookId, params) {
  return request.get(`/books/${bookId}/comments`, { params })
}

// 点赞评论
export function likeComment(bookId, commentId) {
  return request.put(`/books/${bookId}/comments/${commentId}/like`)
}

// 取消点赞
export function unlikeComment(bookId, commentId) {
  return request.delete(`/books/${bookId}/comments/${commentId}/like`)
}

// 删除评论
export function deleteComment(bookId, commentId) {
  return request.delete(`/books/${bookId}/comments/${commentId}`)
}
