<template>
  <MainLayout>
    <el-card>
    <div class="header-actions">
      <h2>图书管理</h2>
      <el-button type="primary" @click="openAddDialog">
        添加图书
      </el-button>
    </div>

    <el-table :data="bookList" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="书名" min-width="200" />
      <el-table-column prop="author" label="作者" width="150" />
      <el-table-column prop="isbn" label="ISBN" width="150" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="封面" width="120">
        <template #default="{ row }">
          <img v-if="row.cover" :src="row.cover" class="cover-image" />
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="editBook(row)">
            编辑
          </el-button>
          <el-button
            size="small"
            :type="row.status === 1 ? 'warning' : 'success'"
            @click="toggleStatus(row)"
          >
            {{ row.status === 1 ? '下架' : '上架' }}
          </el-button>
          <el-button size="small" type="danger" @click="deleteBook(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑图书对话框 -->
    <el-dialog v-model="showAddDialog" :title="isEdit ? '编辑图书' : '添加图书'" width="600px">
      <el-form :model="bookForm" :rules="bookRules" ref="bookFormRef" label-width="100px">
        <!-- 添加图书时显示下架图书选择 -->
        <el-form-item label="选择下架图书" v-if="!isEdit">
          <el-select v-model="selectedOfflineBookId" placeholder="请选择要上架的图书（可选）" clearable style="width: 100%" @change="handleSelectOfflineBook">
            <el-option v-for="book in offlineBooks" :key="book.id" :label="book.title" :value="book.id">
              <span style="color: #606266">{{ book.title }}</span>
              <span style="color: #909399; font-size: 12px; margin-left: 10px">{{ book.author }}</span>
            </el-option>
          </el-select>
          <div style="color: #909399; font-size: 12px; margin-top: 5px">选择后将自动填充图书信息</div>
        </el-form-item>
        <el-form-item label="书名" prop="title">
          <el-input v-model="bookForm.title" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="bookForm.author" />
        </el-form-item>
        <el-form-item label="ISBN" prop="isbn">
          <el-input v-model="bookForm.isbn" />
        </el-form-item>
        <el-form-item label="出版社" prop="publisher">
          <el-input v-model="bookForm.publisher" />
        </el-form-item>
        <el-form-item label="出版日期" prop="publishDate">
          <el-date-picker v-model="bookForm.publishDate" type="date" style="width: 100%" />
        </el-form-item>
        <el-form-item label="封面图片">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleCoverUploadSuccess"
            :before-upload="beforeCoverUpload"
          >
            <img v-if="bookForm.cover" :src="bookForm.cover" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="简介" prop="description">
          <el-input v-model="bookForm.description" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelBookForm">取消</el-button>
        <el-button type="primary" @click="submitBookForm" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
    </el-card>
  </MainLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import MainLayout from '@/components/MainLayout.vue'
import { getBookList, createBook, updateBook, deleteBook as apiDeleteBook, updateBookStatus } from '@/api/book'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const loading = ref(false)
const submitting = ref(false)
const bookList = ref([])
const showAddDialog = ref(false)
const isEdit = ref(false)
const bookFormRef = ref(null)
const selectedOfflineBookId = ref(null)

const uploadUrl = ref('http://localhost:8080/api/files/upload')

const uploadHeaders = ref({
  'Authorization': `Bearer ${userStore.token}`
})

const bookForm = reactive({
  id: null,
  title: '',
  author: '',
  isbn: '',
  publisher: '',
  publishDate: '',
  cover: '',
  description: ''
})

const bookRules = {
  title: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  isbn: [{ required: true, message: '请输入ISBN', trigger: 'blur' }]
}

// 计算属性：获取下架的图书
const offlineBooks = computed(() => {
  return bookList.value.filter(book => book.status === 0)
})

const loadBooks = async () => {
  loading.value = true
  try {
    const res = await getBookList({ page: 1, size: 200, status: null })
    bookList.value = res.data.list || []
  } catch (error) {
    console.error('Load books error:', error)
    ElMessage.error('加载图书列表失败')
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  selectedOfflineBookId.value = null
  isEdit.value = false
  resetForm()
  showAddDialog.value = true
}

const resetForm = () => {
  bookForm.id = null
  bookForm.title = ''
  bookForm.author = ''
  bookForm.isbn = ''
  bookForm.publisher = ''
  bookForm.publishDate = ''
  bookForm.cover = ''
  bookForm.description = ''
}

const handleSelectOfflineBook = (bookId) => {
  if (!bookId) {
    resetForm()
    return
  }
  const book = bookList.value.find(b => b.id === bookId)
  if (book) {
    bookForm.id = book.id
    bookForm.title = book.title || ''
    bookForm.author = book.author || ''
    bookForm.isbn = book.isbn || ''
    bookForm.publisher = book.publisher || ''
    bookForm.publishDate = book.publishDate || ''
    bookForm.cover = book.cover || ''
    bookForm.description = book.description || ''
  }
}

const editBook = (book) => {
  isEdit.value = true
  selectedOfflineBookId.value = null
  bookForm.id = book.id
  bookForm.title = book.title || ''
  bookForm.author = book.author || ''
  bookForm.isbn = book.isbn || ''
  bookForm.publisher = book.publisher || ''
  bookForm.publishDate = book.publishDate || ''
  bookForm.cover = book.cover || ''
  bookForm.description = book.description || ''
  showAddDialog.value = true
}

const cancelBookForm = () => {
  showAddDialog.value = false
  selectedOfflineBookId.value = null
  resetForm()
  isEdit.value = false
}

const submitBookForm = async () => {
  if (!bookFormRef.value) return

  await bookFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        // 如果选择了下架的图书，直接上架
        if (!isEdit && selectedOfflineBookId.value) {
          await updateBookStatus(selectedOfflineBookId.value, 1)
          ElMessage.success('图书上架成功')
        } else if (isEdit) {
          // 编辑图书
          const formData = {
            title: bookForm.title,
            author: bookForm.author,
            isbn: bookForm.isbn,
            publisher: bookForm.publisher,
            publishDate: bookForm.publishDate,
            cover: bookForm.cover,
            description: bookForm.description
          }
          await updateBook(bookForm.id, formData)
          ElMessage.success('更新成功')
        } else {
          // 新建图书
          const formData = {
            title: bookForm.title,
            author: bookForm.author,
            isbn: bookForm.isbn,
            publisher: bookForm.publisher,
            publishDate: bookForm.publishDate,
            cover: bookForm.cover,
            description: bookForm.description
          }
          await createBook(formData)
          ElMessage.success('添加成功')
        }
        cancelBookForm()
        loadBooks()
      } catch (error) {
        ElMessage.error(isEdit ? '更新失败' : '添加失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleCoverUploadSuccess = (response) => {
  if (response && response.data) {
    bookForm.cover = response.data.url
    ElMessage.success('封面上传成功')
  } else {
    ElMessage.error('封面上传失败')
  }
}

const beforeCoverUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('请上传图片文件')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB')
    return false
  }
  return true
}

const toggleStatus = async (book) => {
  try {
    await updateBookStatus(book.id, book.status === 1 ? 0 : 1)
    ElMessage.success('操作成功')
    loadBooks()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const deleteBook = async (book) => {
  try {
    await ElMessageBox.confirm(`确定要删除图书《${book.title}》吗？`, '提示', { type: 'warning' })
    await apiDeleteBook(book.id)
    ElMessage.success('删除成功')
    loadBooks()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadBooks()
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

.avatar-uploader {
  display: flex;
  align-items: center;
}

.avatar {
  width: 120px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #ccc;
  width: 120px;
  height: 150px;
  line-height: 150px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
}
</style>
