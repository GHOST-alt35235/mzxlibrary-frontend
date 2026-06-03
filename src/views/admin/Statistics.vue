<template>
  <MainLayout>
    <div class="statistics">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="6" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card stat-blue">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40" color="#409eff" icon="book-open" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalBooks }}</div>
              <div class="stat-label">图书总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="6" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card stat-green">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40" color="#67c23a" icon="user" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalUsers }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="6" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card stat-orange">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40" color="#e6a23c" icon="calendar" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalBorrows }}</div>
              <div class="stat-label">借阅总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="6" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card stat-red">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40" color="#f56c6c" icon="warning" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.overdueCount }}</div>
              <div class="stat-label">逾期数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :xs="24" :md="14">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="20" color="#409eff" icon="trending-up" />
              <span>借阅趋势（最近30天）</span>
            </div>
          </template>
          <div class="chart-container">
            <svg viewBox="0 0 500 200" class="trend-chart">
              <line v-for="i in 5" :key="'h'+i" x1="50" :y1="20 + (i-1)*40" x2="480" :y2="20 + (i-1)*40" stroke="#e4e7ed" stroke-width="1" />
              <line v-for="i in 7" :key="'v'+i" :x1="50 + (i-1)*71" y1="20" :x2="50 + (i-1)*71" y2="180" stroke="#e4e7ed" stroke-width="1" />
              <text v-for="i in 5" :key="'yl'+i" x="40" :y="25 + (i-1)*40" fill="#909399" font-size="10" text-anchor="end">{{ (5-i)*30 }}</text>
              <text v-for="(day, i) in monthDays" :key="'xl'+i" :x="55 + i*71" y="195" fill="#909399" font-size="10" text-anchor="middle">{{ day }}</text>
              <polyline :points="linePoints" fill="none" stroke="#667eea" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
              <polygon :points="areaPoints" fill="url(#gradient)" opacity="0.3" />
              <circle v-for="(point, i) in dataPoints" :key="'dot'+i" :cx="point.x" :cy="point.y" r="5" fill="#667eea" class="data-point" />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.8" />
                  <stop offset="100%" style="stop-color:#667eea;stop-opacity:0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="10">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="20" color="#67c23a" icon="pie-chart" />
              <span>分类统计</span>
            </div>
          </template>
          <div class="chart-container">
            <svg viewBox="0 0 200 200" class="pie-chart">
              <g transform="translate(100, 100)">
                <path v-for="(item, i) in categoryData" :key="'pie'+i" :d="getPiePath(item.percentage, i)" :fill="item.color" class="pie-slice" />
              </g>
              <circle cx="100" cy="100" r="45" fill="white" />
              <text x="100" y="95" text-anchor="middle" font-size="14" font-weight="bold" fill="#303133">{{ stats.totalBooks }}</text>
              <text x="100" y="115" text-anchor="middle" font-size="10" fill="#909399">图书总数</text>
            </svg>
            <div class="legend">
              <div v-for="item in categoryData" :key="'legend'+item.name" class="legend-item">
                <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
                <span class="legend-text">{{ item.name }}</span>
                <span class="legend-value">{{ item.count }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 借阅排行 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :xs="24">
        <el-card class="list-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="20" color="#e6a23c" icon="hot" />
              <span>借阅排行榜</span>
            </div>
          </template>
          <el-table :data="borrowRank" :show-header="true" class="data-table">
            <el-table-column label="排名" width="80">
              <template #default="{ row, $index }">
                <span class="rank-badge" :class="{ top: $index < 3 }">{{ $index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="bookName" label="图书名称" width="300" />
            <el-table-column prop="author" label="作者" width="150" />
            <el-table-column prop="category" label="分类" width="120" />
            <el-table-column prop="borrowCount" label="借阅次数" width="100" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MainLayout from '@/components/MainLayout.vue'

const stats = ref({
  totalBooks: 0,
  totalUsers: 0,
  totalBorrows: 0,
  overdueCount: 0
})

const monthDays = ['01-01', '01-05', '01-10', '01-15', '01-20', '01-25', '01-30']
const borrowData = ref([45, 52, 38, 60, 55, 70, 65])

const dataPoints = computed(() => {
  const maxVal = Math.max(...borrowData.value)
  return borrowData.value.map((val, i) => ({
    x: 55 + i * 71,
    y: 180 - (val / maxVal) * 160
  }))
})

const linePoints = computed(() => {
  return dataPoints.value.map(p => `${p.x},${p.y}`).join(' ')
})

const areaPoints = computed(() => {
  const points = dataPoints.value.map(p => `${p.x},${p.y}`).join(' ')
  return `55,180 ${points} 475,180`
})

const categoryData = ref([
  { name: '计算机', count: 420, percentage: 33.6, color: '#667eea' },
  { name: '文学', count: 280, percentage: 22.4, color: '#764ba2' },
  { name: '历史', count: 180, percentage: 14.4, color: '#f093fb' },
  { name: '科学', count: 150, percentage: 12, color: '#4facfe' },
  { name: '艺术', count: 120, percentage: 9.6, color: '#43e97b' },
  { name: '经济', count: 100, percentage: 8, color: '#fa709a' }
])

const getPiePath = (percentage, index) => {
  const startAngle = categoryData.value.slice(0, index).reduce((sum, item) => sum + item.percentage, 0) * 3.6
  const endAngle = startAngle + percentage * 3.6
  const startRad = (startAngle - 90) * Math.PI / 180
  const endRad = (endAngle - 90) * Math.PI / 180
  const x1 = 60 * Math.cos(startRad)
  const y1 = 60 * Math.sin(startRad)
  const x2 = 60 * Math.cos(endRad)
  const y2 = 60 * Math.sin(endRad)
  const largeArcFlag = percentage > 50 ? 1 : 0
  return `M 0 0 L ${x1} ${y1} A 60 60 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
}

const borrowRank = ref([])

const loadStats = async () => {
  await new Promise(resolve => setTimeout(resolve, 500))
  stats.value = {
    totalBooks: 1256,
    totalUsers: 328,
    totalBorrows: 2340,
    overdueCount: 12
  }
}

const loadBorrowRank = async () => {
  await new Promise(resolve => setTimeout(resolve, 500))
  borrowRank.value = [
    { bookName: 'JavaScript高级程序设计', author: 'Matt Frisbie', category: '计算机', borrowCount: 156 },
    { bookName: 'Vue.js设计与实现', author: '霍春阳', category: '计算机', borrowCount: 132 },
    { bookName: '深入理解计算机系统', author: 'Randal E. Bryant', category: '计算机', borrowCount: 98 },
    { bookName: '活着', author: '余华', category: '文学', borrowCount: 87 },
    { bookName: '百年孤独', author: '加西亚·马尔克斯', category: '文学', borrowCount: 76 },
    { bookName: '三体', author: '刘慈欣', category: '科学', borrowCount: 72 },
    { bookName: '明朝那些事儿', author: '当年明月', category: '历史', borrowCount: 68 },
    { bookName: '人类简史', author: '尤瓦尔·赫拉利', category: '历史', borrowCount: 64 }
  ]
}

onMounted(() => {
  loadStats()
  loadBorrowRank()
})
</script>

<style scoped>
.statistics {
  padding: 20px;
}

.stats-row {
  margin-bottom: 0;
}

.stat-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-card :deep(.el-card__body) {
  padding: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.stat-blue .stat-icon {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.stat-green .stat-icon {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}

.stat-orange .stat-icon {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
}

.stat-red .stat-icon {
  background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}

.chart-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.chart-card :deep(.el-card__body) {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.chart-container {
  margin-top: 15px;
}

.trend-chart {
  width: 100%;
  height: 200px;
}

.data-point {
  cursor: pointer;
  transition: r 0.2s;
}

.data-point:hover {
  r: 8;
}

.pie-chart {
  width: 100%;
  height: 180px;
}

.pie-slice {
  cursor: pointer;
  transition: opacity 0.2s;
}

.pie-slice:hover {
  opacity: 0.8;
}

.legend {
  margin-top: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 4px;
}

.legend-text {
  flex: 1;
  font-size: 13px;
  color: #606266;
}

.legend-value {
  font-size: 13px;
  color: #909399;
}

.list-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.list-card :deep(.el-card__body) {
  padding: 20px;
}

.data-table :deep(.el-table th) {
  background: #fafafa;
  font-weight: 600;
  color: #606266;
}

.rank-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
}

.rank-badge.top {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa502 100%);
  color: white;
}
</style>