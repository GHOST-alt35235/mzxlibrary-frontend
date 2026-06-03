<template>
  <MainLayout>
    <div class="profile-container">
      <el-card class="profile-card">
        <div class="profile-header">
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <el-avatar :size="120" :src="userInfo.avatar" class="profile-avatar">
                <UserFilled />
              </el-avatar>
              <div class="upload-btn">
                <label for="avatar-upload">
                  <el-button type="primary" size="small" icon="upload">更换头像</el-button>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png"
                  style="display: none"
                  @change="handleAvatarUpload"
                />
              </div>
            </div>
          </div>
          <div class="user-info-section">
            <h2>{{ userInfo.username }}</h2>
            <el-tag :type="getRoleType(userInfo.role)" effect="dark">
              {{ getRoleText(userInfo.role) }}
            </el-tag>
            <div class="info-row">
              <el-icon><phone /></el-icon>
              <span>{{ userInfo.phone || '未设置' }}</span>
            </div>
            <div class="info-row">
              <el-icon><calendar /></el-icon>
              <span>注册时间：{{ formatTime(userInfo.createTime) }}</span>
            </div>
            <div class="info-row points-info">
              <el-icon><coins /></el-icon>
              <span>可用积分：</span>
              <span class="points-value">{{ userInfo.points || 0 }}</span>
            </div>
          </div>
        </div>

        <el-divider />

        <h3>编辑资料</h3>
        <el-form :model="profileForm" :rules="profileRules" ref="profileFormRef" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="profileForm.username" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="profileForm.phone" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="profileForm.nickname" placeholder="可选，显示名称" />
          </el-form-item>
          <el-form-item label="个人简介" prop="bio">
            <el-input v-model="profileForm.bio" type="textarea" :rows="4" placeholder="介绍一下你自己..." />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveProfile" :loading="saving">
              <el-icon><save /></el-icon> 保存修改
            </el-button>
          </el-form-item>
        </el-form>

        <el-divider />

        <h3>安全设置</h3>
        <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="120px">
          <el-form-item label="原密码" prop="oldPassword">
            <el-input v-model="passwordForm.oldPassword" type="password" />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="passwordForm.newPassword" type="password" />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="passwordForm.confirmPassword" type="password" />
          </el-form-item>
          <el-form-item>
            <el-button type="warning" @click="changePasswordFunc" :loading="changingPassword">
              <el-icon><key /></el-icon> 修改密码
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </MainLayout>
</template>

<script setup>import { ref, reactive, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { uploadAvatar } from '@/api/file';
import { updateProfile, changePassword } from '@/api/auth';
import MainLayout from '@/components/MainLayout.vue';
import { UserFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
const userStore = useUserStore();
const saving = ref(false);
const changingPassword = ref(false);
const profileFormRef = ref(null);
const passwordFormRef = ref(null);
const userInfo = ref({
  id: null,
  username: '',
  phone: '',
  nickname: '',
  bio: '',
  role: '',
  points: 0,
  avatar: '',
  createTime: null
});
const profileForm = reactive({
  username: '',
  phone: '',
  nickname: '',
  bio: ''
});
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});
const profileRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
};
const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度必须在6-20个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};
const loadUserInfo = async () => {
  try {
    if (userStore.userInfo) {
      userInfo.value = { ...userStore.userInfo };
      profileForm.username = userStore.userInfo.username;
      profileForm.phone = userStore.userInfo.phone || '';
      profileForm.nickname = userStore.userInfo.nickname || '';
      profileForm.bio = userStore.userInfo.bio || '';
    }
  } catch (error) {
    console.error('Load user info error:', error);
  }
};
const handleAvatarUpload = async (event) => {
  const file = event.target.files[0];
  if (!file)
    return;
  const fileSize = file.size / 1024 / 1024;
  if (fileSize > 2) {
    ElMessage.error('头像大小不能超过2MB');
    event.target.value = '';
    return;
  }
  try {
    const res = await uploadAvatar(file);
    if (res.code === 0) {
      // 更新本地显示
      const reader = new FileReader();
      reader.onload = (e) => {
        userInfo.value.avatar = e.target.result;
      };
      reader.readAsDataURL(file);
      // 刷新用户信息
      await userStore.fetchUserInfo();
      await loadUserInfo();
      ElMessage.success('头像上传成功');
    } else {
      ElMessage.error(res.message || '上传失败');
    }
  } catch (error) {
    ElMessage.error('头像上传失败');
  }
  event.target.value = '';
};
const saveProfile = async () => {
  if (!profileFormRef.value)
    return;
  await profileFormRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true;
      try {
        await updateProfile({
          nickname: profileForm.nickname,
          phone: profileForm.phone
        });
        ElMessage.success('资料更新成功');
        await userStore.fetchUserInfo();
        await loadUserInfo();
      } catch (error) {
        ElMessage.error(error.message || '更新失败');
      } finally {
        saving.value = false;
      }
    }
  });
};
const changePasswordFunc = async () => {
  if (!passwordFormRef.value)
    return;
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      changingPassword.value = true;
      try {
        await changePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        });
        ElMessage.success('密码修改成功');
        passwordForm.oldPassword = '';
        passwordForm.newPassword = '';
        passwordForm.confirmPassword = '';
      } catch (error) {
        ElMessage.error(error.message || '密码修改失败');
      } finally {
        changingPassword.value = false;
      }
    }
  });
};
const getRoleText = (role) => {
  const roleMap = {
    'user': '普通用户',
    'admin': '管理员',
    'moderator': '审核员',
    'super_admin': '超级管理员'
  };
  return roleMap[role] || role;
};
const getRoleType = (role) => {
  const typeMap = {
    'user': 'info',
    'admin': 'warning',
    'moderator': 'success',
    'super_admin': 'danger'
  };
  return typeMap[role] || 'info';
};
const formatTime = (time) => {
  if (!time)
    return '';
  return new Date(time).toLocaleString('zh-CN');
};
onMounted(() => {
  loadUserInfo();
});
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  border-radius: 12px;
}

.profile-header {
  display: flex;
  gap: 40px;
  padding-bottom: 20px;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar-wrapper {
  position: relative;
}

.profile-avatar {
  border: 4px solid #e4e7ed;
  transition: all 0.3s;
}

.profile-avatar:hover {
  border-color: #409eff;
}

.upload-btn {
  margin-top: 15px;
  text-align: center;
}

.user-info-section {
  flex: 1;
}

.user-info-section h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: #606266;
}

.points-info {
  margin-top: 15px;
}

.points-value {
  font-size: 20px;
  font-weight: bold;
  color: #e6a23c;
}

h3 {
  margin: 20px 0 15px 0;
  font-size: 16px;
  color: #303133;
}
</style>