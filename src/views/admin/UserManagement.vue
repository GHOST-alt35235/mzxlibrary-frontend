<template>
  <MainLayout>
    <el-card class="user-management-card">
    <!-- 搜索区域 -->
    <div class="search-bar">
      <div class="search-item">
        <label>用户名</label>
        <el-input 
          v-model="searchForm.username" 
          placeholder="请输入用户名" 
          class="search-input"
        />
      </div>
      <div class="search-item">
        <label>角色</label>
        <el-select v-model="searchForm.role" placeholder="请选择角色" class="search-select">
          <el-option label="全部" value="" />
          <el-option label="管理员" value="admin" />
          <el-option label="审核员" value="moderator" />
          <el-option label="普通用户" value="user" />
        </el-select>
      </div>
      <div class="search-actions">
        <el-button type="primary" @click="handleSearch">
          <el-icon><search /></el-icon> 搜索
        </el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="success" @click="handleAdd">
          <el-icon><plus /></el-icon> 新增用户
        </el-button>
      </div>
    </div>
    
    <!-- 用户列表表格 -->
    <el-table :data="userList" v-loading="loading" class="user-table">
      <el-table-column prop="id" label="序号" width="80" />
      <el-table-column prop="username" label="用户名" width="150" />
      <el-table-column prop="nickname" label="真实姓名" width="120" />
      <el-table-column prop="phone" label="手机号" width="150" />
      <el-table-column prop="role" label="角色" width="120">
        <template #default="{ row }">
          <el-tag :type="getRoleType(row.role)" effect="dark">
            {{ getRoleText(row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" effect="dark">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="handleEdit(row)">
            <el-icon><edit /></el-icon> 编辑
          </el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">
            <el-icon><delete /></el-icon> 删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <div class="pagination">
      <span class="total">Total: {{ total }}</span>
      <el-pagination
        :current-page="pagination.page"
        :page-size="pagination.size"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="->, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 新增/编辑用户弹窗 -->
    <el-dialog title="新增用户" v-model="dialogVisible" width="450px">
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="审核员" value="moderator" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!formData.id" label="密码" prop="password">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>
    </el-card>
  </MainLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import MainLayout from '@/components/MainLayout.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { getUserList, updateUserStatus, resetUserPassword, createUser, updateUser, deleteUser } from '@/api/user'

const loading = ref(false)
const userList = ref([])
const total = ref(0)

const searchForm = reactive({
  username: '',
  role: ''
})

const pagination = reactive({
  page: 1,
  size: 10
})

const dialogVisible = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: null,
  username: '',
  nickname: '',
  phone: '',
  role: 'user',
  password: '',
  status: 1
})

const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3-20个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6-20个字符', trigger: 'blur' }
  ]
}

const getRoleText = (role) => {
  const roleMap = {
    'user': '普通用户',
    'admin': '管理员',
    'moderator': '审核员'
  }
  return roleMap[role] || role
}

const getRoleType = (role) => {
  const typeMap = {
    'user': 'info',
    'admin': 'warning',
    'moderator': 'success'
  }
  return typeMap[role] || 'info'
}

const loadUsers = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
      username: searchForm.username || undefined,
      role: searchForm.role || undefined
    }
    const res = await getUserList(params)
    userList.value = res.data.list || res.data || []
    total.value = res.data.total || userList.value.length
  } catch (error) {
    console.error('Load users error:', error)
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadUsers()
}

const handleReset = () => {
  searchForm.username = ''
  searchForm.role = ''
  pagination.page = 1
  loadUsers()
}

const handleAdd = () => {
  formData.id = null
  formData.username = ''
  formData.nickname = ''
  formData.phone = ''
  formData.role = 'user'
  formData.password = ''
  formData.status = 1
  dialogVisible.value = true
}

const handleEdit = (row) => {
  formData.id = row.id
  formData.username = row.username
  formData.nickname = row.nickname || ''
  formData.phone = row.phone || ''
  formData.role = row.role
  formData.password = ''
  formData.status = row.status
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 ${row.username} 吗？`,
      '提示',
      { type: 'warning' }
    )
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (formData.id) {
          // 编辑用户
          const data = { ...formData }
          delete data.password
          await updateUser(formData.id, data)
          ElMessage.success('修改成功')
        } else {
          // 新增用户
          await createUser(formData)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        loadUsers()
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }
  })
}

const handleSizeChange = (size) => {
  pagination.size = size
  loadUsers()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  loadUsers()
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.user-management-card {
  border-radius: 12px;
}

.user-management-card :deep(.el-card__body) {
  padding: 20px;
}

/* 搜索区域 */
.search-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 20px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-item label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
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

.search-actions .el-button {
  padding: 8px 16px;
}

/* 用户表格 */
.user-table :deep(.el-table) {
  border-radius: 8px;
}

.user-table :deep(.el-table th) {
  background: #f5f7fa;
  font-weight: 600;
  color: #606266;
}

.user-table :deep(.el-tag) {
  padding: 2px 8px;
  font-size: 12px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #e4e7ed;
}

.total {
  font-size: 14px;
  color: #606266;
}

/* 弹窗样式 */
:deep(.el-dialog__header) {
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}
</style>