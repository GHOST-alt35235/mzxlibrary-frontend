<template>
  <MainLayout>
    <div class="resource-list-container">
      <el-card>
        <div class="header-actions">
          <h2>学习资源</h2>
          <div class="action-buttons">
            <el-button type="primary" @click="showUploadDialog = true">
              <el-icon><upload /></el-icon> 上传资源
            </el-button>
            <el-button @click="activeTab = 'all'" :class="{ active: activeTab === 'all' }">
              全部资源
            </el-button>
            <el-button @click="activeTab = 'my'" :class="{ active: activeTab === 'my' }">
              我的资源
            </el-button>
          </div>
        </div>

        <el-table :data="resourceList" v-loading="loading" style="margin-top: 20px">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="资源名称" min-width="200">
            <template #default="{ row }">
              <el-link type="primary" @click="viewDetail(row)">{{ row.name }}</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip />
          <el-table-column prop="points" label="所需积分" width="100">
            <template #default="{ row }">
              <el-tag :type="row.points > 0 ? 'warning' : 'success'">
                {{ row.points > 0 ? `${row.points} 积分` : '免费' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="downloadCount" label="下载次数" width="100" />
          <el-table-column prop="createTime" label="上传时间" width="180">
            <template #default="{ row }">
              {{ formatTime(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button
                v-if="row.status === 1"
                size="small"
                type="primary"
                @click="downloadResource(row)"
              >
                <el-icon><download /></el-icon> 下载
              </el-button>
              <template v-else>
                <el-button size="small" type="info" disabled>
                  {{ row.status === 2 ? '审核中' : row.status === 3 ? '已拒绝' : '未上架' }}
                </el-button>
              </template>
              <template v-if="activeTab === 'my'">
                <el-button
                  v-if="row.status === 0"
                  size="small"
                  type="success"
                  @click="submitResource(row)"
                >
                  提交审核
                </el-button>
                <el-button
                  v-if="row.status === 1 || row.status === 0"
                  size="small"
                  type="warning"
                  @click="editResource(row)"
                >
                  编辑
                </el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadResources"
            @current-change="loadResources"
          />
        </div>
      </el-card>
    </div>

    <!-- 资源详情弹窗 -->
    <el-dialog v-model="showDetailDialog" title="资源详情" width="600px">
      <el-descriptions :column="2" border v-if="selectedResource">
        <el-descriptions-item label="资源名称">{{ selectedResource.name }}</el-descriptions-item>
        <el-descriptions-item label="所需积分">
          <el-tag :type="selectedResource.points > 0 ? 'warning' : 'success'">
            {{ selectedResource.points > 0 ? `${selectedResource.points} 积分` : '免费' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(selectedResource.status)">
            {{ getStatusText(selectedResource.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="下载次数">{{ selectedResource.downloadCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="上传时间">{{ formatTime(selectedResource.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ selectedResource.description || '暂无描述' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button
          v-if="selectedResource?.status === 1"
          type="primary"
          @click="downloadResource(selectedResource)"
        >
          下载
        </el-button>
      </template>
    </el-dialog>

    <!-- 上传资源对话框 -->
    <el-dialog v-model="showUploadDialog" :title="isEdit ? '编辑资源' : '上传资源'" width="600px">
      <el-form :model="resourceForm" :rules="resourceRules" ref="resourceFormRef" label-width="100px">
        <el-form-item label="资源名称" prop="name">
          <el-input v-model="resourceForm.name" placeholder="请输入资源名称" />
        </el-form-item>
        <el-form-item label="资源描述" prop="description">
          <el-input v-model="resourceForm.description" type="textarea" :rows="3" placeholder="请输入资源描述" />
        </el-form-item>
        <el-form-item label="积分价格" prop="pointsCost">
          <el-input v-model.number="resourceForm.pointsCost" placeholder="免费请输入0" />
        </el-form-item>
        <el-form-item label="关联图书（可选）" prop="bookId">
          <el-select v-model="resourceForm.bookId" placeholder="请选择要关联的图书" clearable filterable>
            <el-option 
              v-for="book in bookList" 
              :key="book.id" 
              :label="book.name" 
              :value="book.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="上传文件" v-if="!isEdit">
          <el-upload
            class="upload-demo"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :before-upload="beforeUpload"
            :on-success="onUploadSuccess"
            :on-error="onUploadError"
            :file-list="fileList"
            :auto-upload="true"
            ref="uploadRef"
          >
            <el-button type="primary">选择文件</el-button>
          </el-upload>
          <div v-if="resourceForm.fileId" class="file-info">
            <el-icon><document /></el-icon>
            <span>已上传文件</span>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelUpload">取消</el-button>
        <el-button type="primary" @click="submitResourceForm" :loading="submitting">
          {{ isEdit ? '保存' : '上传' }}
        </el-button>
      </template>
    </el-dialog>
  </MainLayout>
</template>

<script setup>import { ref, reactive, onMounted, computed } from 'vue';
import { getResourceList, getMyResources, createResource, updateResource, submitForReview } from '@/api/resource';
import { uploadFile } from '@/api/file';
import { getBookList } from '@/api/book';
import MainLayout from '@/components/MainLayout.vue';
import { ElMessage } from 'element-plus';
const loading = ref(false);
const submitting = ref(false);
const resourceList = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const activeTab = ref('all');
const showUploadDialog = ref(false);
const showDetailDialog = ref(false);
const isEdit = ref(false);
const selectedResource = ref(null);
const resourceFormRef = ref(null);
const uploadRef = ref(null);
const fileList = ref([]);
const bookList = ref([]);
const uploadUrl = computed(() => '/api/files');
const uploadHeaders = computed(() => ({
 satoken: localStorage.getItem('token') || ''
}));
const resourceForm = reactive({
 name: '',
 description: '',
 pointsCost: 0,
 bookId: null,
 fileId: null
});
const resourceRules = {
 name: [{ required: true, message: '请输入资源名称', trigger: 'blur' }],
 description: [{ required: true, message: '请输入资源描述', trigger: 'blur' }],
 pointsCost: [{ required: true, message: '请输入积分价格', trigger: 'blur' }, { type: 'number', min: 0, message: '积分不能为负数', trigger: 'blur' }]
};
const getStatusType = (status) => {
 const typeMap = {
 0: 'info',
 1: 'success',
 2: 'warning',
 3: 'danger'
 };
 return typeMap[status] || 'info';
};
const getStatusText = (status) => {
 const textMap = {
 0: '草稿',
 1: '已上架',
 2: '审核中',
 3: '已拒绝'
 };
 return textMap[status] || '未知';
};
const loadResources = async () => {
 loading.value = true;
 try {
 const apiFunc = activeTab.value === 'my' ? getMyResources : getResourceList;
 console.log('Loading resources, tab:', activeTab.value);
 const res = await apiFunc({
 page: currentPage.value,
 size: pageSize.value
 });
 console.log('API Response:', res);
 console.log('Response data:', res.data);
 // 后端返回格式: { list: [], page, size, total }
 resourceList.value = res.data.list || [];
 total.value = res.data.total || 0;
 console.log('Loaded resources:', resourceList.value);
 console.log('Total:', total.value);
 }
 catch (error) {
 console.error('Load resources error:', error);
 ElMessage.error('加载资源列表失败');
 }
 finally {
 loading.value = false;
 }
};
const viewDetail = (resource) => {
 selectedResource.value = resource;
 showDetailDialog.value = true;
};
const downloadResource = async (resource) => {
 loading.value = true;
 try {
 const response = await fetch(`/api/resources/${resource.id}/download`, {
 method: 'GET',
 headers: {
 'satoken': localStorage.getItem('token') || ''
 }
 });
 if (!response.ok) {
 throw new Error('下载失败');
 }
 const blob = await response.blob();
 const contentDisposition = response.headers.get('Content-Disposition');
 let filename = 'download';
 if (contentDisposition) {
 const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
 if (match != null && match[1]) {
 filename = decodeURIComponent(match[1].replace(/['"]/g, ''));
 }
 }
 const url = window.URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = filename;
 document.body.appendChild(a);
 a.click();
 window.URL.revokeObjectURL(url);
 document.body.removeChild(a);
 ElMessage.success('下载成功');
 }
 catch (error) {
 console.error('Download error:', error);
 ElMessage.error(error.message || '下载失败');
 }
 finally {
 loading.value = false;
 }
};
const editResource = (resource) => {
 isEdit.value = true;
 Object.assign(resourceForm, resource);
 showUploadDialog.value = true;
};
const cancelUpload = () => {
 showUploadDialog.value = false;
 isEdit.value = false;
 resourceForm.name = '';
 resourceForm.description = '';
 resourceForm.points = 0;
 resourceForm.bookId = null;
 resourceForm.fileId = null;
 fileList.value = [];
};
const beforeUpload = (file) => {
 const fileSize = file.size / 1024 / 1024;
 if (fileSize > 50) {
 ElMessage.error('文件大小不能超过50MB');
 return false;
 }
 return true;
};
const onUploadSuccess = (response, file, fileList) => {
 if (response.code === 200 || response.code === 0) {
 resourceForm.fileId = response.data.id;
 ElMessage.success('文件上传成功');
 }
 else {
 ElMessage.error(response.message || '文件上传失败');
 }
};
const onUploadError = (error, file, fileList) => {
 ElMessage.error('文件上传失败');
 uploadingFile.value = false;
};
const submitResourceForm = async () => {
 if (!resourceFormRef.value)
 return;
 await resourceFormRef.value.validate(async (valid) => {
 if (valid) {
 if (!isEdit.value && !resourceForm.fileId) {
 ElMessage.error('请先选择并上传文件');
 return;
 }
 submitting.value = true;
 try {
 console.log('Submitting resource:', resourceForm);
 if (isEdit.value) {
 const res = await updateResource(resourceForm.id, resourceForm);
 console.log('Update response:', res);
 ElMessage.success('更新成功');
 }
 else {
 const res = await createResource(resourceForm);
 console.log('Create response:', res);
 ElMessage.success('上传成功，等待审核');
 activeTab.value = 'my'; // 自动切换到我的资源标签页
 }
 cancelUpload();
 loadResources();
 }
 catch (error) {
 console.error('Submit error:', error);
 ElMessage.error(isEdit.value ? '更新失败' : '上传失败');
 }
 finally {
 submitting.value = false;
 }
 }
 });
};
const uploadingFile = ref(false);
const submitResource = async (resource) => {
 try {
 await submitForReview(resource.id);
 ElMessage.success('已提交审核');
 loadResources();
 }
 catch (error) {
 ElMessage.error('提交失败');
 }
};
const loadBooks = async () => {
 try {
 const res = await getBookList({ page: 1, size: 100 });
 bookList.value = res.data.list || [];
 }
 catch (error) {
 console.error('Load books error:', error);
 }
};
const formatTime = (time) => {
 if (!time)
 return '';
 return new Date(time).toLocaleString('zh-CN');
};
onMounted(() => {
 loadResources();
 loadBooks();
});
</script>

<style scoped>
.resource-list-container {
  max-width: 1400px;
  margin: 0 auto;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions h2 {
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.action-buttons .el-button.active {
  background-color: #409eff;
  color: white;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  color: #67c23a;
}
</style>