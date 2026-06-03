import request from '@/utils/request'

// 评分
export function rateBook(bookId, score) {
  return request.put(`/books/${bookId}/rating`, { score })
}

// 获取我的评分
export function getMyRating(bookId) {
  return request.get(`/books/${bookId}/rating`)
}
