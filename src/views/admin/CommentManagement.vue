<template>
  <MainLayout>
    <div class="comment-management">
    <div class="search-bar">
      <div class="search-item">
        <label>图书名称</label>
        <el-input v-model="searchForm.bookName" placeholder="请输入图书名称" class="search-input" />
      </div>
      <div class="search-item">
        <label>状态</label>
        <el-select v-model="searchForm.status" placeholder="请选择状态" class="search-select">
          <el-option label="全部" value="" />
          <el-option label="待审核" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
      </div>
      <div class="search-actions">
        <el-button type="primary" @click="handleSearch"><el-icon icon="search" /> 搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <el-table :data="commentList" :show-header="true" class="data-table">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="bookName" label="图书名称" width="200" />
      <el-table-column prop="username" label="评论人" width="120" />
      <el-table-column prop="content" label="评论内容" width="300" />
      <el-table-column prop="rating" label="评分" width="80">
        <template #default="{ row }">
          <span class="rating-stars">
            <i v-for="i in 5" :key="i" class="star" :class="{ filled: i <= row.rating }">★</i>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="评论时间" width="150" />
      <el-table-column prop="operation" label="操作" width="150">
        <template #default="{ row }">
          <el-button v-if="row.status === 'pending'" size="small" type="primary" @click="handleApprove(row.id)">通过</el-button>
          <el-button v-if="row.status === 'pending'" size="small" type="danger" @click="handleReject(row.id)">拒绝</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        @current-change="handlePageChange"
      />
    </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, reactive } from 'vue'
import MainLayout from '@/components/MainLayout.vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const commentList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const searchForm = reactive({
  bookName: '',
  status: ''
})

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return texts[status] || status
}

const loadCommentList = async () => {
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  commentList.value = [
    { id: 1, bookName: 'JavaScript高级程序设计', username: '张三', content: '非常好的一本书，推荐阅读！', rating: 5, status: 'approved', createdAt: '2026-01-15 14:30:00' },
    { id: 2, bookName: 'Vue.js设计与实现', username: '李四', content: '内容很深入，值得学习', rating: 4, status: 'pending', createdAt: '2026-01-15 13:20:00' },
    { id: 3, bookName: '深入理解计算机系统', username: '王五', content: '经典之作，受益匪浅', rating: 5, status: 'approved', createdAt: '2026-01-14 10:15:00' },
    { id: 4, bookName: '算法导论', username: '赵六', content: '太难了，不适合初学者', rating: 2, status: 'rejected', createdAt: '2026-01-14 09:00:00' },
    { id: 5, bookName: '设计模式', username: '钱七', content: '设计模式讲解清晰', rating: 4, status: 'pending', createdAt: '2026-01-13 16:45:00' }
  ]
  total.value = 5
  loading.value = false
}

const handleSearch = () => {
  currentPage.value = 1
  loadCommentList()
}

const handleReset = () => {
  searchForm.bookName = ''
  searchForm.status = ''
  currentPage.value = 1
  loadCommentList()
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadCommentList()
}

const handleApprove = (id) => {
  ElMessage.success('评论已通过')
  loadCommentList()
}

const handleReject = (id) => {
  ElMessage.success('评论已拒绝')
  loadCommentList()
}

const handleDelete = (id) => {
  ElMessage.success('评论已删除')
  loadCommentList()
}

loadCommentList()
</script>

<style scoped>
.comment-management {
  padding: 20px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-item label {
  font-size: 14px;
  color: #606266;
}

.search-input {
  width: 200px;
}

.search-select {
  width: 150px;
}

.search-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.data-table {
  background: white;
  border-radius: 12px;
}

.data-table :deep(.el-table th) {
  background: #fafafa;
  font-weight: 600;
  color: #606266;
}

.rating-stars {
  color: #e6a23c;
  font-size: 14px;
}

.rating-stars .star {
  opacity: 0.3;
}

.rating-stars .star.filled {
  opacity: 1;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>