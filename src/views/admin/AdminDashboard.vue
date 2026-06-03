<template>
  <MainLayout>
    <div class="admin-container">
      <el-row :gutter="20">
        <el-col :span="4">
          <el-card>
            <el-menu :default-active="$route.path" router>
              <el-menu-item index="/admin/users">
                <el-icon><user /></el-icon>
                <span>用户管理</span>
              </el-menu-item>
              <el-menu-item index="/admin/books">
                <el-icon><collection /></el-icon>
                <span>图书管理</span>
              </el-menu-item>
              <el-menu-item index="/admin/resources">
                <el-icon><document /></el-icon>
                <span>资源审核</span>
              </el-menu-item>
            </el-menu>
          </el-card>
        </el-col>

        <el-col :span="20">
          <router-view />
        </el-col>
      </el-row>
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from '@/components/MainLayout.vue'
</script>

<style scoped>
.admin-container {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
