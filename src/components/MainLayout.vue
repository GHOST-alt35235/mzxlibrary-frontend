<template>
  <el-container class="main-layout">
    <!-- 侧边栏 -->
    <el-aside class="sidebar" :width="collapsed ? '64px' : '200px'">
      <div class="sidebar-header">
        <div class="logo" @click="$router.push('/')">
          <el-icon :size="28" color="#fff"><collection-tag /></el-icon>
          <span v-show="!collapsed">图书管理系统</span>
        </div>
        <el-button 
          class="collapse-btn" 
          @click="collapsed = !collapsed"
          icon="Menu"
        />
      </div>
      
      <el-menu 
        mode="vertical" 
        :default-active="activeMenu" 
        router 
        class="sidebar-menu"
        :collapse="collapsed"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/">
          <el-icon><house /></el-icon>
          <template #title>首页</template>
        </el-menu-item>
        
        <el-sub-menu index="/books">
          <template #title>
            <el-icon icon="book-open" />
            <span>图书管理</span>
          </template>
          <el-menu-item index="/books">图书列表</el-menu-item>
          <el-menu-item index="/admin/books">图书管理</el-menu-item>
          <el-menu-item index="/admin/books/offline">下架图书</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="/admin/users">
          <template #title>
            <el-icon icon="users" />
            <span>读者管理</span>
          </template>
          <el-menu-item index="/admin/users">用户列表</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="/admin/resources">
          <template #title>
            <el-icon><folder-opened /></el-icon>
            <span>分类管理</span>
          </template>
          <el-menu-item index="/admin/resources">分类管理</el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/resources">
          <el-icon><download /></el-icon>
          <template #title>借阅管理</template>
        </el-menu-item>
        
        <el-menu-item index="/admin/comments">
          <el-icon><comment /></el-icon>
          <template #title>评论管理</template>
        </el-menu-item>
        
        <el-menu-item index="/admin/statistics">
          <el-icon icon="bar-chart" />
          <template #title>统计分析</template>
        </el-menu-item>
        
        <el-menu-item index="/chat">
          <el-icon icon="message-circle" />
          <template #title>图书推荐</template>
        </el-menu-item>
        
        <el-menu-item index="/profile">
          <el-icon icon="user" />
          <template #title>个人中心</template>
        </el-menu-item>
        
        <el-menu-item index="/admin/dashboard">
          <el-icon icon="layout" />
          <template #title>管理后台</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <!-- 主内容区域 -->
    <el-container class="main-content-container">
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-for="item in breadcrumbItems" :key="item.path" :to="{ path: item.path }">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              <el-avatar :size="32" :src="userStore.userInfo?.avatar" class="user-avatar">
                <UserFilled />
              </el-avatar>
              <span v-show="!collapsed">{{ userStore.userInfo?.username || '用户' }}</span>
              <el-icon><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><user /></el-icon> 个人信息
                </el-dropdown-item>
                <el-dropdown-item command="switchUser">
                  <el-icon><refresh /></el-icon> 切换用户
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon icon="log-out" /> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 内容区域 -->
      <el-main class="main-content">
        <slot />
      </el-main>
    </el-container>
    
    <!-- 切换用户弹窗 -->
    <el-dialog title="切换用户" v-model="switchUserDialogVisible" width="400px" :close-on-click-modal="false">
      <el-form :model="switchUserForm" label-width="80px">
        <el-form-item label="选择用户">
          <el-select v-model="switchUserForm.userId" placeholder="请选择用户">
            <el-option 
              v-for="user in availableUsers" 
              :key="user.id" 
              :label="`${user.username} (${user.role})`" 
              :value="user.id" 
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="switchUserDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSwitchUser">确认切换</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { 
  CollectionTag, 
  House, 
  Collection,
  FolderOpened,
  Download,
  Comment,
  Setting,
  User,
  ArrowDown,
  UserFilled,
  Refresh
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const collapsed = ref(false)

const activeMenu = computed(() => {
  const path = route.path
  // 处理子菜单的激活状态
  if (path === '/books' || path === '/admin/books') {
    return '/books'
  } else if (path === '/admin/users') {
    return '/admin/users'
  } else if (path === '/admin/resources') {
    return '/admin/resources'
  }
  return path
})

const breadcrumbItems = computed(() => {
  const path = route.path
  const items = []
  
  if (path === '/books') {
    items.push({ path: '/books', title: '图书列表' })
  } else if (path === '/admin/users') {
    items.push({ path: '/admin/users', title: '用户管理' })
  } else if (path === '/admin/books') {
    items.push({ path: '/admin/books', title: '图书管理' })
  } else if (path === '/admin/resources') {
    items.push({ path: '/admin/resources', title: '分类管理' })
  } else if (path === '/admin/comments') {
    items.push({ path: '/admin/comments', title: '评论管理' })
  } else if (path === '/admin/statistics') {
    items.push({ path: '/admin/statistics', title: '统计分析' })
  } else if (path === '/admin/dashboard') {
    items.push({ path: '/admin/dashboard', title: '管理后台' })
  } else if (path === '/resources') {
    items.push({ path: '/resources', title: '借阅管理' })
  } else if (path === '/chat') {
    items.push({ path: '/chat', title: '图书推荐' })
  } else if (path === '/profile') {
    items.push({ path: '/profile', title: '个人中心' })
  }
  
  return items
})

// 切换用户相关
const switchUserDialogVisible = ref(false)
const switchUserForm = ref({
  userId: null
})

const availableUsers = ref([
  { id: 1, username: 'admin', role: '管理员' },
  { id: 2, username: 'moderator', role: '审核员' },
  { id: 3, username: 'testuser', role: '普通用户' }
])

onMounted(async () => {
  if (userStore.isLoggedIn && !userStore.userInfo) {
    try {
      await userStore.fetchUserInfo()
    } catch (error) {
      console.error('Fetch user info error:', error)
    }
  }
})

const handleCommand = async (command) => {
  if (command === 'logout') {
    await userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } else if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'switchUser') {
    switchUserDialogVisible.value = true
  }
}

const handleMenuSelect = (index) => {
  if (index && index.startsWith('/')) {
    router.push(index)
  }
}

const confirmSwitchUser = async () => {
  if (!switchUserForm.value.userId) {
    ElMessage.warning('请选择要切换的用户')
    return
  }
  
  const user = availableUsers.value.find(u => u.id === switchUserForm.value.userId)
  if (user) {
    await userStore.logout()
    
    const mockUsers = {
      1: { username: 'admin', password: 'admin123' },
      2: { username: 'moderator', password: 'moderator123' },
      3: { username: 'testuser', password: 'test123' }
    }
    
    try {
      const mockUser = mockUsers[switchUserForm.value.userId]
      await new Promise(resolve => setTimeout(resolve, 500))
      
      userStore.token = `mock-token-${user.id}`
      userStore.userInfo = {
        id: user.id,
        username: user.username,
        role: user.role === '管理员' ? 'admin' : user.role === '审核员' ? 'moderator' : 'user',
        nickname: user.username,
        points: 100,
        status: 1
      }
      
      ElMessage.success(`已切换为 ${user.username} (${user.role})`)
      switchUserDialogVisible.value = false
      switchUserForm.value.userId = null
      router.go(0)
    } catch (error) {
      ElMessage.error('切换用户失败')
    }
  }
}
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
}

/* 侧边栏 */
.sidebar {
  background: linear-gradient(180deg, #2d3748 0%, #1a202c 100%);
  color: white;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 100;
  transition: width 0.3s ease;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  color: white;
}

.collapse-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.sidebar-menu {
  border-right: none;
  background: transparent;
  padding-top: 20px;
}

.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  color: rgba(255, 255, 255, 0.8);
  height: 48px;
  line-height: 48px;
  margin: 0 8px;
  border-radius: 8px;
  margin-bottom: 4px;
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-menu :deep(.el-menu-item.is-active),
.sidebar-menu :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item) {
  margin-left: 24px;
  background: rgba(45, 55, 72, 0.8) !important;
}

.sidebar-menu :deep(.el-sub-menu__menu) {
  background: transparent !important;
  border: none;
}

/* 主内容容器 */
.main-content-container {
  flex: 1;
  margin-left: 200px;
  transition: margin-left 0.3s ease;
}

.sidebar.collapsed + .main-content-container {
  margin-left: 64px;
}

/* 顶部导航 */
.header {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 20px;
  transition: background 0.3s;
}

.user-dropdown:hover {
  background: #f5f7fa;
}

.user-avatar {
  border: 2px solid #e4e7ed;
}

/* 主内容区域 */
.main-content {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}
</style>