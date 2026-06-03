import request from '@/utils/request'

// 批量导入图书
export function batchImportBooks(books) {
  return request.post('/batch/books/import', books)
}

// 批量删除图书
export function batchDeleteBooks(bookIds) {
  return request.delete('/batch/books', { data: bookIds })
}

// 批量导入用户
export function batchImportUsers(users) {
  return request.post('/batch/users/import', users)
}

// 批量禁用用户
export function batchDisableUsers(userIds) {
  return request.put('/batch/users/disable', userIds)
}

// 批量删除评论
export function batchDeleteComments(commentIds) {
  return request.delete('/batch/comments', { data: commentIds })
}
