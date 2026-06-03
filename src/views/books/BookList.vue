<template>
  <MainLayout>
    <div class="book-list-container">
      <el-card>
        <div class="header-actions">
          <h2>图书列表</h2>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索图书..."
            style="width: 300px; margin-left: 20px"
            clearable
            @clear="loadBooks"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">
                <el-icon><search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>

        <el-table :data="bookList" v-loading="loading" style="margin-top: 20px">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="title" label="书名" min-width="200">
            <template #default="{ row }">
              <el-link type="primary" @click="viewDetail(row.id)">{{ row.title }}</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="author" label="作者" width="150" />
          <el-table-column prop="isbn" label="ISBN" width="150" />
          <el-table-column prop="publisher" label="出版社" width="150" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'">
                {{ row.status === 1 ? '上架' : '下架' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="viewDetail(row.id)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadBooks"
            @current-change="loadBooks"
          />
        </div>
      </el-card>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getBookList } from '@/api/book'
import MainLayout from '@/components/MainLayout.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const bookList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchKeyword = ref('')

const loadBooks = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      status: 1
    }
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }
    const res = await getBookList(params)
    bookList.value = res.data.list || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('Load books error:', error)
    ElMessage.error('加载图书列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadBooks()
}

const viewDetail = (id) => {
  router.push(`/books/${id}`)
}

onMounted(() => {
  loadBooks()
})
</script>

<style scoped>
.book-list-container {
  max-width: 1200px;
  margin: 0 auto;
}

.header-actions {
  display: flex;
  align-items: center;
}

.header-actions h2 {
  margin: 0;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
