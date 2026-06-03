<template>
  <MainLayout>
    <div class="points-container">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="balance-card">
            <div class="balance-header">
              <h3>我的积分</h3>
              <el-icon :size="32" color="#e6a23c"><coin /></el-icon>
            </div>
            <div class="balance-value">{{ balance }}</div>
            <div class="balance-label">可用积分</div>
          </el-card>

          <!-- 管理员操作面板 -->
          <el-card v-if="isAdmin" class="admin-card" style="margin-top: 20px">
            <h3>管理员操作</h3>
            <el-form :model="adminForm" :rules="adminRules" ref="adminFormRef" label-width="100px">
              <el-form-item label="用户ID" prop="userId">
                <el-input v-model.number="adminForm.userId" placeholder="输入用户ID" />
              </el-form-item>
              <el-form-item label="积分数量" prop="amount">
                <el-input v-model.number="adminForm.amount" placeholder="输入积分数量" />
              </el-form-item>
              <el-form-item>
                <el-button type="success" @click="grantPoints" :loading="adminLoading">
                  <el-icon><plus /></el-icon> 发放积分
                </el-button>
                <el-button type="danger" @click="deductPoints" :loading="adminLoading" style="margin-left: 10px">
                  <el-icon><minus /></el-icon> 扣减积分
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <el-col :span="16">
          <el-card>
            <div class="transactions-header">
              <h3>积分流水</h3>
              <div class="filter-tabs">
                <el-button 
                  @click="filterType = 'all'" 
                  :class="{ active: filterType === 'all' }"
                >
                  全部
                </el-button>
                <el-button 
                  @click="filterType = 'income'" 
                  :class="{ active: filterType === 'income' }"
                >
                  <el-icon><arrow-down /></el-icon> 收入
                </el-button>
                <el-button 
                  @click="filterType = 'expense'" 
                  :class="{ active: filterType === 'expense' }"
                >
                  <el-icon><arrow-up /></el-icon> 支出
                </el-button>
              </div>
            </div>
            <el-table :data="filteredTransactions" v-loading="loading" style="margin-top: 20px">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="type" label="类型" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.type === 1 ? 'success' : 'danger'">
                    {{ row.type === 1 ? '收入' : '支出' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="amount" label="金额" width="100">
                <template #default="{ row }">
                  <span :style="{ color: row.type === 1 ? '#67c23a' : '#f56c6c', fontWeight: 'bold' }">
                    {{ row.type === 1 ? '+' : '-' }}{{ row.amount }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="说明" min-width="200" />
              <el-table-column prop="balance" label="余额" width="100">
                <template #default="{ row }">
                  <span style="color: #409eff">{{ row.balance }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="时间" width="180">
                <template #default="{ row }">
                  {{ formatTime(row.createTime) }}
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
                @size-change="loadTransactions"
                @current-change="loadTransactions"
              />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </MainLayout>
</template>

<script setup>import { ref, computed, onMounted } from 'vue';
import { getMyBalance, getMyTransactions, grantPoints as apiGrantPoints, deductPoints as apiDeductPoints } from '@/api/points';
import { useUserStore } from '@/stores/user';
import MainLayout from '@/components/MainLayout.vue';
import { Coin, Plus, Minus, ArrowDown, ArrowUp } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
const userStore = useUserStore();
const loading = ref(false);
const adminLoading = ref(false);
const balance = ref(0);
const transactions = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const filterType = ref('all');
const adminFormRef = ref(null);
const adminForm = ref({
 userId: null,
 amount: null
});
const adminRules = {
 userId: [
 { required: true, message: '请输入用户ID', trigger: 'blur' },
 { type: 'number', message: '用户ID必须为数字', trigger: 'blur' }
 ],
 amount: [
 { required: true, message: '请输入积分数量', trigger: 'blur' },
 { type: 'number', min: 1, message: '积分数量必须大于0', trigger: 'blur' }
 ]
};
const isAdmin = computed(() => {
 return userStore.userInfo?.role === 'admin' || userStore.userInfo?.role === 'super_admin';
});
const filteredTransactions = computed(() => {
 if (filterType.value === 'all') {
 return transactions.value;
 }
 else if (filterType.value === 'income') {
 return transactions.value.filter(t => t.type === 1);
 }
 else {
 return transactions.value.filter(t => t.type === 0);
 }
});
const loadBalance = async () => {
 try {
 const res = await getMyBalance();
 balance.value = res.data;
 }
 catch (error) {
 ElMessage.error('加载积分余额失败');
 }
};
const loadTransactions = async () => {
 loading.value = true;
 try {
 const res = await getMyTransactions({
 page: currentPage.value,
 size: pageSize.value
 });
 // 后端返回格式: { list: [], page, size, total }
 transactions.value = res.data.list || [];
 total.value = res.data.total || 0;
 }
 catch (error) {
 console.error('Load transactions error:', error);
 ElMessage.error('加载积分流水失败');
 }
 finally {
 loading.value = false;
 }
};
const grantPoints = async () => {
 if (!adminFormRef.value)
 return;
 await adminFormRef.value.validate(async (valid) => {
 if (valid) {
 adminLoading.value = true;
 try {
 await apiGrantPoints(adminForm.value.userId, adminForm.value.amount);
 ElMessage.success('积分发放成功');
 adminForm.value.userId = null;
 adminForm.value.amount = null;
 }
 catch (error) {
 ElMessage.error('操作失败');
 }
 finally {
 adminLoading.value = false;
 }
 }
 });
};
const deductPoints = async () => {
 if (!adminFormRef.value)
 return;
 await adminFormRef.value.validate(async (valid) => {
 if (valid) {
 adminLoading.value = true;
 try {
 await apiDeductPoints(adminForm.value.userId, adminForm.value.amount);
 ElMessage.success('积分扣减成功');
 adminForm.value.userId = null;
 adminForm.value.amount = null;
 }
 catch (error) {
 ElMessage.error('操作失败');
 }
 finally {
 adminLoading.value = false;
 }
 }
 });
};
const formatTime = (time) => {
 if (!time)
 return '';
 const date = new Date(time);
 const now = new Date();
 const diff = now - date;
 if (diff < 60000) {
 return '刚刚';
 }
 else if (diff < 3600000) {
 return `${Math.floor(diff / 60000)}分钟前`;
 }
 else if (diff < 86400000) {
 return `${Math.floor(diff / 3600000)}小时前`;
 }
 else {
 return date.toLocaleString('zh-CN');
 }
};
onMounted(() => {
 loadBalance();
 loadTransactions();
});
</script>

<style scoped>
.points-container {
  max-width: 1200px;
  margin: 0 auto;
}

.balance-card {
  text-align: center;
  border-radius: 12px;
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance-header h3 {
  margin: 0;
}

.balance-value {
  font-size: 48px;
  font-weight: bold;
  color: #e6a23c;
  margin: 20px 0;
}

.balance-label {
  font-size: 16px;
  color: #909399;
}

.admin-card {
  border-radius: 12px;
}

.admin-card h3 {
  margin: 0 0 15px 0;
}

.transactions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transactions-header h3 {
  margin: 0;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tabs .el-button.active {
  background-color: #409eff;
  color: white;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>