<template>
  <MainLayout>
    <div class="chat-container">
      <el-row :gutter="20" style="height: calc(100vh - 140px)">
        <!-- 会话列表 -->
        <el-col :span="6">
          <el-card class="session-list-card">
            <h3>聊天会话</h3>
            <el-button type="primary" @click="showNewChatDialog = true" style="width: 100%; margin-bottom: 15px">
              新建聊天
            </el-button>
            <div class="session-list" v-loading="sessionLoading">
              <div
                v-for="session in sessions"
                :key="session.id"
                class="session-item"
                :class="{ active: currentSessionId === session.id }"
                @click="selectSession(session.id)"
              >
                <div class="session-info">
                  <div class="session-name">{{ session.targetUsername }}</div>
                  <div class="session-preview">{{ session.lastMessage || '暂无消息' }}</div>
                </div>
                <div class="session-meta">
                  <div class="session-time">{{ formatTime(session.updateTime) }}</div>
                  <el-badge v-if="session.unreadCount > 0" :value="session.unreadCount" />
                </div>
              </div>
              <el-empty v-if="sessions.length === 0" description="暂无会话" />
            </div>
          </el-card>
        </el-col>

        <!-- 聊天窗口 -->
        <el-col :span="18">
          <el-card class="chat-window-card" v-if="currentSessionId">
            <div class="chat-header">
              <h3>{{ currentSessionName }}</h3>
            </div>
            <div class="chat-messages" ref="messagesRef">
              <div
                v-for="msg in messages"
                :key="msg.id"
                class="message-item"
                :class="msg.senderId === myUserId ? 'my-message' : 'other-message'"
              >
                <div class="message-content">
                  <div class="message-text">{{ msg.content }}</div>
                  <div class="message-time">{{ formatTime(msg.createTime) }}</div>
                </div>
              </div>
            </div>
            <div class="chat-input">
              <el-input
                v-model="messageContent"
                type="textarea"
                :rows="3"
                placeholder="输入消息..."
                @keyup.ctrl.enter="sendMessage"
              />
              <el-button type="primary" @click="sendMessage" :loading="sending" style="margin-top: 10px">
                发送 (Ctrl+Enter)
              </el-button>
            </div>
          </el-card>
          <el-card v-else class="empty-chat">
            <el-empty description="选择一个会话开始聊天" />
          </el-card>
        </el-col>
      </el-row>

      <!-- 新建聊天对话框 -->
      <el-dialog v-model="showNewChatDialog" title="新建聊天" width="400px">
        <el-form :model="newChatForm">
          <el-form-item label="用户ID">
            <el-input v-model.number="newChatForm.targetUserId" placeholder="输入要聊天的用户ID" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showNewChatDialog = false">取消</el-button>
          <el-button type="primary" @click="createNewChat">确定</el-button>
        </template>
      </el-dialog>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { getSessions, createSession, getMessages, sendMessage as apiSendMessage } from '@/api/chat'
import { useUserStore } from '@/stores/user'
import MainLayout from '@/components/MainLayout.vue'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const myUserId = ref(null)

const sessionLoading = ref(false)
const sessions = ref([])
const currentSessionId = ref(null)
const currentSessionName = ref('')
const messages = ref([])
const messageContent = ref('')
const sending = ref(false)
const showNewChatDialog = ref(false)
const messagesRef = ref(null)

const newChatForm = ref({
  targetUserId: null
})

const loadSessions = async () => {
  sessionLoading.value = true
  try {
    const res = await getSessions()
    sessions.value = res.data || []
  } catch (error) {
    console.error('Load sessions error:', error)
  } finally {
    sessionLoading.value = false
  }
}

const selectSession = async (sessionId) => {
  currentSessionId.value = sessionId
  const session = sessions.value.find(s => s.id === sessionId)
  if (session) {
    currentSessionName.value = session.targetUsername
  }
  await loadMessages(sessionId)
}

const loadMessages = async (sessionId) => {
  try {
    const res = await getMessages(sessionId, { page: 1, size: 50 })
    // 后端返回格式: { list: [], page, size, total }
    messages.value = res.data.list || []
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Load messages error:', error)
  }
}

const sendMessage = async () => {
  if (!messageContent.value.trim() || !currentSessionId.value) return

  sending.value = true
  try {
    await apiSendMessage(currentSessionId.value, {
      msgType: 'text',  // 增加必填的消息类型字段
      content: messageContent.value
    })
    messageContent.value = ''
    await loadMessages(currentSessionId.value)
    await loadSessions()
  } catch (error) {
    ElMessage.error('发送消息失败')
  } finally {
    sending.value = false
  }
}

const createNewChat = async () => {
  if (!newChatForm.value.targetUserId) {
    ElMessage.warning('请输入用户ID')
    return
  }

  try {
    const res = await createSession(newChatForm.value.targetUserId)
    showNewChatDialog.value = false
    await loadSessions()
    await selectSession(res.data.id)
  } catch (error) {
    ElMessage.error('创建会话失败')
  }
}

const scrollToBottom = () => {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

onMounted(async () => {
  if (userStore.userInfo) {
    myUserId.value = userStore.userInfo.id
  }
  await loadSessions()
})
</script>

<style scoped>
.chat-container {
  max-width: 1400px;
  margin: 0 auto;
}

.session-list-card {
  height: 100%;
}

.session-list {
  max-height: calc(100vh - 280px);
  overflow-y: auto;
}

.session-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid #e4e7ed;
  cursor: pointer;
  transition: background-color 0.3s;
}

.session-item:hover {
  background-color: #f5f7fa;
}

.session-item.active {
  background-color: #ecf5ff;
  border-left: 3px solid #409eff;
}

.session-info {
  flex: 1;
  overflow: hidden;
}

.session-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.session-preview {
  color: #909399;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: 10px;
}

.session-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.chat-window-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-header {
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  min-height: 400px;
}

.message-item {
  margin-bottom: 15px;
  display: flex;
}

.my-message {
  justify-content: flex-end;
}

.other-message {
  justify-content: flex-start;
}

.message-content {
  max-width: 60%;
}

.message-text {
  padding: 10px 15px;
  border-radius: 8px;
  background-color: #f0f0f0;
  word-wrap: break-word;
}

.my-message .message-text {
  background-color: #409eff;
  color: white;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.chat-input {
  border-top: 1px solid #e4e7ed;
  padding-top: 15px;
  margin-top: 15px;
}

.empty-chat {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
