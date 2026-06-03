<template>
  <div class="login-container">
    <!-- 背景装饰圆 -->
    <div class="bg-circle circle-1"></div>
    <div class="bg-circle circle-2"></div>
    <div class="bg-circle circle-3"></div>
    
    <div class="login-wrapper">
      <!-- 左侧装饰区 -->
      <div class="login-left">
        <div class="logo-section">
          <h1 class="main-title">书海寻踪</h1>
          <p class="sub-title">探索知识的海洋，发现阅读的无限可能</p>
        </div>
        <div class="book-decoration">
          <svg viewBox="0 0 200 200" class="book-icon">
            <rect x="30" y="40" width="140" height="120" rx="8" fill="rgba(255,255,255,0.2)" />
            <rect x="35" y="45" width="130" height="110" rx="5" fill="rgba(255,255,255,0.1)" />
            <line x1="100" y1="45" x2="100" y2="155" stroke="rgba(255,255,255,0.3)" stroke-width="2" />
            <line x1="45" y1="70" x2="95" y2="70" stroke="rgba(255,255,255,0.4)" stroke-width="2" />
            <line x1="45" y1="90" x2="90" y2="90" stroke="rgba(255,255,255,0.4)" stroke-width="2" />
            <line x1="45" y1="110" x2="85" y2="110" stroke="rgba(255,255,255,0.4)" stroke-width="2" />
            <line x1="105" y1="70" x2="155" y2="70" stroke="rgba(255,255,255,0.4)" stroke-width="2" />
            <line x1="105" y1="90" x2="150" y2="90" stroke="rgba(255,255,255,0.4)" stroke-width="2" />
            <line x1="105" y1="110" x2="145" y2="110" stroke="rgba(255,255,255,0.4)" stroke-width="2" />
            <line x1="105" y1="130" x2="155" y2="130" stroke="rgba(255,255,255,0.4)" stroke-width="2" />
          </svg>
        </div>
      </div>
      
      <!-- 右侧登录表单 -->
      <div class="login-right">
        <div class="form-container">
          <h2 class="form-title">欢迎回来</h2>
          <p class="form-subtitle">登录您的账号，继续您的阅读之旅</p>
          
          <el-form :model="loginForm" :rules="rules" ref="formRef" label-width="0">
            <el-form-item prop="username">
              <el-input 
                v-model="loginForm.username" 
                placeholder="用户名" 
                class="input-field"
                prefix-icon="User"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input 
                v-model="loginForm.password" 
                type="password" 
                placeholder="密码" 
                class="input-field"
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <div class="form-options">
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
              <el-link type="primary" class="forgot-link">忘记密码?</el-link>
            </div>
            
            <el-form-item>
              <el-button type="primary" @click="handleLogin" :loading="loading" class="login-btn">
                登录
              </el-button>
            </el-form-item>
            
            <div class="register-link">
              <span>还没有账号？</span>
              <el-link type="primary" @click="$router.push('/register')">立即注册</el-link>
            </div>
          </el-form>
        </div>
        
        <p class="copyright">探索阅读的无限可能 | 图书推荐系统 © 2025</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)
const rememberMe = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.login(loginForm)
        ElMessage.success('登录成功')
        router.push('/')
      } catch (error) {
        console.error('Login error:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f7ff 0%, #e0efff 50%, #c7d9ff 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

/* 背景装饰圆 */
.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.1);
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  right: -50px;
  background: rgba(118, 75, 162, 0.1);
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  right: 20%;
  background: rgba(102, 126, 234, 0.05);
}

.login-wrapper {
  display: flex;
  width: 800px;
  height: 500px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 10;
}

/* 左侧装饰区 */
.login-left {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  position: relative;
}

.logo-section {
  text-align: center;
  z-index: 10;
}

.main-title {
  font-size: 42px;
  color: white;
  margin: 0 0 16px 0;
  font-weight: 700;
  letter-spacing: 8px;
}

.sub-title {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.6;
}

.book-decoration {
  margin-top: 40px;
  z-index: 10;
}

.book-icon {
  width: 180px;
  height: 180px;
}

/* 右侧登录表单 */
.login-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  position: relative;
}

.form-container {
  width: 100%;
  max-width: 320px;
}

.form-title {
  font-size: 28px;
  color: #303133;
  text-align: center;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.form-subtitle {
  font-size: 14px;
  color: #909399;
  text-align: center;
  margin: 0 0 32px 0;
}

.input-field {
  height: 44px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
}

.input-field:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0;
}

.forgot-link {
  font-size: 13px;
}

.login-btn {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.register-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #606266;
}

.register-link .el-link {
  margin-left: 4px;
}

.copyright {
  position: absolute;
  bottom: 20px;
  font-size: 12px;
  color: #c0c4cc;
}

/* 响应式 */
@media (max-width: 850px) {
  .login-wrapper {
    width: 90%;
    height: auto;
    flex-direction: column;
  }
  
  .login-left {
    padding: 30px;
  }
  
  .main-title {
    font-size: 32px;
    letter-spacing: 4px;
  }
  
  .book-icon {
    width: 140px;
    height: 140px;
  }
}
</style>