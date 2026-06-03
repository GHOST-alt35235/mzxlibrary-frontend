<template>
  <MainLayout>
    <el-card>
      <div class="header-actions">
        <h2>下架图书管理</h2>
        <el-button type="primary" @click="batchOnline">
          批量上架
        </el-button>
      </div>

      <el-table :data="offlineBookList" v-loading="loading" :selectable="selectable">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="书名" min-width="200" />
        <el-table-column prop="author" label="作者" width="150" />
        <el-table-column prop="isbn" label="ISBN" width="150" />
        <el-table-column label="封面" width="120">
          <template #default="{ row }">
            <img v-if="row.cover" :src="row.cover" class="cover-image" />
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="下架时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="success" @click="onlineBook(row)">
              上架
            </el-button>
            <el-button size="small" type="danger" @click="deleteBook(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination" v-if="total > 0">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="loadOfflineBooks"
        />
      </div>
    </el-card>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MainLayout from '@/components/MainLayout.vue'
import { getBookList, updateBookStatus, deleteBook as apiDeleteBook } from '@/api/book'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const offlineBookList = ref([])
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const selectedBooks = ref([])

const loadOfflineBooks = async (currentPage = page.value) => {
  loading.value = true
  try {
    const res = await getBookList({ page: currentPage, size: pageSize.value, status: 0 })
    offlineBookList.value = res.data.list || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('Load offline books error:', error)
    ElMessage.error('加载下架图书列表失败')
  } finally {
    loading.value = false
  }
}

const onlineBook = async (book) => {
  try {
    await updateBookStatus(book.id, 1)
    ElMessage.success('上架成功')
    loadOfflineBooks()
  } catch (error) {
    ElMessage.error('上架失败')
  }
}

const batchOnline = async () => {
  if (selectedBooks.value.length === 0) {
    ElMessage.warning('请选择要上架的图书')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要上架选中的 ${selectedBooks.value.length} 本图书吗？`, '提示', { type: 'warning' })
    
    for (const bookId of selectedBooks.value) {
      await updateBookStatus(bookId, 1)
    }
    
    ElMessage.success(`成功上架 ${selectedBooks.value.length} 本图书`)
    selectedBooks.value = []
    loadOfflineBooks()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量上架失败')
    }
  }
}

const deleteBook = async (book) => {
  try {
    await ElMessageBox.confirm(`确定要删除图书《${book.title}》吗？此操作不可恢复。`, '提示', { type: 'warning' })
    await apiDeleteBook(book.id)
    ElMessage.success('删除成功')
    loadOfflineBooks()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const selectable = (row) => {
  return row.status === 0
}

const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  loadOfflineBooks()
})
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions h2 {
  margin: 0;
}

.cover-image {
  width: 50px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
