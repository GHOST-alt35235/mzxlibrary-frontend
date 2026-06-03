<template>
  <MainLayout>
    <div class="dashboard-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="6" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card stat-blue">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40" color="#409eff" icon="book-open" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.bookCount }}</div>
              <div class="stat-label">图书总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="6" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card stat-green">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40" color="#67c23a"><user /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.userCount }}</div>
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
              <div class="stat-value">{{ stats.todayBorrow }}</div>
              <div class="stat-label">今日借阅</div>
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
              <div class="stat-label">逾期未还</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <!-- 借阅趋势图 -->
      <el-col :xs="24" :md="14">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="20" color="#409eff" icon="trending-up" />
              <span>借阅趋势（最近7天）</span>
            </div>
          </template>
          <div class="chart-container">
            <svg viewBox="0 0 500 200" class="trend-chart">
              <!-- 网格线 -->
              <line v-for="i in 5" :key="'h'+i" x1="50" :y1="20 + (i-1)*40" x2="480" :y2="20 + (i-1)*40" stroke="#e4e7ed" stroke-width="1" />
              <line v-for="i in 8" :key="'v'+i" :x1="50 + (i-1)*60" y1="20" :x2="50 + (i-1)*60" y2="180" stroke="#e4e7ed" stroke-width="1" />
              
              <!-- Y轴标签 -->
              <text v-for="i in 5" :key="'yl'+i" x="40" :y="25 + (i-1)*40" fill="#909399" font-size="10" text-anchor="end">{{ (5-i)*20 }}</text>
              
              <!-- X轴标签 -->
              <text v-for="(day, i) in weekDays" :key="'xl'+i" :x="55 + i*60" y="195" fill="#909399" font-size="10" text-anchor="middle">{{ day }}</text>
              
              <!-- 折线 -->
              <polyline 
                :points="linePoints" 
                fill="none" 
                stroke="#667eea" 
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              
              <!-- 填充区域 -->
              <polygon 
                :points="areaPoints" 
                fill="url(#gradient)" 
                opacity="0.3"
              />
              
              <!-- 数据点 -->
              <circle 
                v-for="(point, i) in dataPoints" 
                :key="'dot'+i"
                :cx="point.x" 
                :cy="point.y" 
                r="5" 
                fill="#667eea"
                class="data-point"
              />
              
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
      
      <!-- 分类统计 -->
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
                <path 
                  v-for="(item, i) in categoryData" 
                  :key="'pie'+i"
                  :d="getPiePath(item.percentage, i)"
                  :fill="item.color"
                  class="pie-slice"
                />
              </g>
              
              <!-- 中心圆 -->
              <circle cx="100" cy="100" r="45" fill="white" />
              <text x="100" y="95" text-anchor="middle" font-size="14" font-weight="bold" fill="#303133">{{ stats.bookCount }}</text>
              <text x="100" y="115" text-anchor="middle" font-size="10" fill="#909399">图书总数</text>
            </svg>
            
            <!-- 图例 -->
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
    
    <!-- 最近借阅和热门图书 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <!-- 最近借阅 -->
      <el-col :xs="24" :md="14">
        <el-card class="list-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="20" color="#909399" icon="clock" />
              <span>最近借阅</span>
            </div>
          </template>
          <el-table :data="recentBorrows" :show-header="true" class="data-table">
            <el-table-column prop="bookName" label="图书名称" width="250" />
            <el-table-column prop="borrower" label="借阅人" width="120" />
            <el-table-column prop="borrowDate" label="借阅日期" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '借阅中' ? 'warning' : 'success'" effect="plain">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <!-- 热门图书 -->
      <el-col :xs="24" :md="10">
        <el-card class="list-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="20" color="#e6a23c" icon="hot" />
              <span>热门图书</span>
            </div>
          </template>
          <div class="hot-books">
            <div v-for="(book, index) in hotBooks" :key="book.id" class="hot-book-item">
              <div class="rank-badge" :class="{ top: index < 3 }">{{ index + 1 }}</div>
              <div class="book-info">
                <div class="book-name">{{ book.title }}</div>
                <div class="book-author">{{ book.author }}</div>
              </div>
              <div class="borrow-count">{{ book.borrowCount }}次</div>
            </div>
          </div>
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
  bookCount: 0,
  userCount: 0,
  todayBorrow: 0,
  overdueCount: 0
})

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const borrowData = ref([45, 52, 38, 60, 55, 70, 65])

const dataPoints = computed(() => {
  const maxVal = Math.max(...borrowData.value)
  return borrowData.value.map((val, i) => ({
    x: 55 + i * 60,
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

const recentBorrows = ref([])
const hotBooks = ref([])

const loadStats = async () => {
  await new Promise(resolve => setTimeout(resolve, 500))
  stats.value = {
    bookCount: 1256,
    userCount: 328,
    todayBorrow: 45,
    overdueCount: 12
  }
}

const loadRecentBorrows = async () => {
  await new Promise(resolve => setTimeout(resolve, 500))
  recentBorrows.value = [
    { id: 1, bookName: 'JavaScript高级程序设计', borrower: '张三', borrowDate: '2026-01-15', status: '借阅中' },
    { id: 2, bookName: 'Vue.js设计与实现', borrower: '李四', borrowDate: '2026-01-14', status: '已归还' },
    { id: 3, bookName: '深入理解计算机系统', borrower: '王五', borrowDate: '2026-01-13', status: '已归还' },
    { id: 4, bookName: '算法导论', borrower: '赵六', borrowDate: '2026-01-12', status: '已归还' },
    { id: 5, bookName: '设计模式', borrower: '钱七', borrowDate: '2026-01-11', status: '已归还' }
  ]
}

const loadHotBooks = async () => {
  await new Promise(resolve => setTimeout(resolve, 500))
  hotBooks.value = [
    { id: 1, title: 'JavaScript高级程序设计', author: 'Matt Frisbie', borrowCount: 156 },
    { id: 2, title: 'Vue.js设计与实现', author: '霍春阳', borrowCount: 132 },
    { id: 3, title: '深入理解计算机系统', author: 'Randal E. Bryant', borrowCount: 98 },
    { id: 4, title: '算法导论', author: 'Thomas H. Cormen', borrowCount: 87 },
    { id: 5, title: '设计模式', author: 'Erich Gamma', borrowCount: 76 }
  ]
}

onMounted(() => {
  loadStats()
  loadRecentBorrows()
  loadHotBooks()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

/* 统计卡片 */
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

/* 图表卡片 */
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

/* 趋势图 */
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

/* 饼图 */
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

/* 列表卡片 */
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

/* 热门图书 */
.hot-books {
  margin-top: 15px;
}

.hot-book-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.hot-book-item:last-child {
  border-bottom: none;
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
  margin-right: 12px;
}

.rank-badge.top {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa502 100%);
  color: white;
}

.book-info {
  flex: 1;
}

.book-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.book-author {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.borrow-count {
  font-size: 14px;
  font-weight: 600;
  color: #e6a23c;
}

/* 响应式 */
@media (max-width: 768px) {
  .stat-content {
    flex-direction: column;
    text-align: center;
  }
  
  .stat-icon {
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .legend-item {
    flex-wrap: wrap;
  }
}
</style>