<template>
  <MainLayout>
    <el-card>
    <h2>资源审核</h2>

    <el-table :data="resourceList" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="资源名称" min-width="200" />
      <el-table-column prop="ownerName" label="上传者" width="150" />
      <el-table-column prop="points" label="所需积分" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 2"
            size="small"
            type="success"
            @click="approveResource(row)"
          >
            通过
          </el-button>
          <el-button
            v-if="row.status === 2"
            size="small"
            type="danger"
            @click="rejectResource(row)"
          >
            拒绝
          </el-button>
          <el-button
            v-if="row.status === 1"
            size="small"
            type="warning"
            @click="offlineResource(row)"
          >
            下架
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    </el-card>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MainLayout from '@/components/MainLayout.vue'
import { getResourceList, approveResource as apiApprove, rejectResource as apiReject, offlineResource as apiOffline } from '@/api/resource'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const resourceList = ref([])

const getStatusType = (status) => {
  const typeMap = {
    0: 'info',
    1: 'success',
    2: 'warning',
    3: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    0: '草稿',
    1: '已上架',
    2: '审核中',
    3: '已拒绝'
  }
  return textMap[status] || '未知'
}

const loadResources = async () => {
  loading.value = true
  try {
    const res = await getResourceList({ page: 1, size: 100 })
    // 后端返回格式: { list: [], page, size, total }
    resourceList.value = res.data.list || []
  } catch (error) {
    console.error('Load resources error:', error)
    ElMessage.error('加载资源列表失败')
  } finally {
    loading.value = false
  }
}

const approveResource = async (resource) => {
  try {
    await apiApprove(resource.id)
    ElMessage.success('审核通过')
    loadResources()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const rejectResource = async (resource) => {
  try {
    await apiReject(resource.id)
    ElMessage.success('已拒绝')
    loadResources()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const offlineResource = async (resource) => {
  try {
    await ElMessageBox.confirm(`确定要下架资源《${resource.name}》吗？`, '提示', { type: 'warning' })
    await apiOffline(resource.id)
    ElMessage.success('已下架')
    loadResources()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

onMounted(() => {
  loadResources()
})
</script>
