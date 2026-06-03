import request from '@/utils/request'

// 分页查询图书列表
export function getBookList(params) {
  return request.get('/books', { params })
}

// 查询图书详情
export function getBookById(id) {
  return request.get(`/books/${id}`)
}

// 新增图书
export function createBook(data) {
  return request.post('/books', data)
}

// 更新图书
export function updateBook(id, data) {
  return request.put(`/books/${id}`, data)
}

// 删除图书
export function deleteBook(id) {
  return request.delete(`/books/${id}`)
}

// 更新图书状态
export function updateBookStatus(id, status) {
  return request.put(`/books/${id}/status`, { status })
}
