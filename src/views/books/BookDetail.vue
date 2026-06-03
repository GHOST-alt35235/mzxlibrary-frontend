<template>
  <MainLayout>
    <div class="book-detail-container" v-loading="loading">
      <el-card v-if="bookInfo">
        <el-page-header @back="$router.back()" :title="'返回'" style="margin-bottom: 20px" />

        <el-row :gutter="20">
          <el-col :span="8">
            <div class="book-cover">
              <img :src="bookInfo.cover || defaultCover" alt="图书封面" />
            </div>
          </el-col>
          <el-col :span="16">
            <h2>{{ bookInfo.title }}</h2>
            <el-descriptions :column="2" border style="margin-top: 20px">
              <el-descriptions-item label="作者">{{ bookInfo.author }}</el-descriptions-item>
              <el-descriptions-item label="ISBN">{{ bookInfo.isbn }}</el-descriptions-item>
              <el-descriptions-item label="出版社">{{ bookInfo.publisher }}</el-descriptions-item>
              <el-descriptions-item label="出版日期">{{ bookInfo.publishDate }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="bookInfo.status === 1 ? 'success' : 'info'">
                  {{ bookInfo.status === 1 ? '上架' : '下架' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="评分">
                <div class="rating-stats">
                  <el-rate v-model="averageRating" disabled show-score text-color="#ff9900" />
                  <span class="rating-count">({{ ratingCount }}人评分)</span>
                </div>
              </el-descriptions-item>
            </el-descriptions>

            <div class="rating-section" style="margin-top: 20px">
              <h4>我的评分</h4>
              <el-rate v-model="myRating" @change="handleRate" allow-half />
              <span v-if="myRating" style="margin-left: 10px; color: #909399">
                ({{ myRating }}分)
              </span>
            </div>
          </el-col>
        </el-row>

        <el-divider />

        <div class="description-section">
          <h3>图书简介</h3>
          <p>{{ bookInfo.description || '暂无简介' }}</p>
        </div>

        <el-divider />

        <div class="comments-section">
          <div class="comments-header">
            <h3>评论 ({{ commentTotal }})</h3>
            <el-button type="primary" @click="showCommentDialog = true">
              <el-icon><edit-pen /></el-icon> 发表评论
            </el-button>
          </div>

          <div class="comment-list" v-if="commentList.length > 0">
            <div v-for="comment in commentList" :key="comment.id" class="comment-item">
              <div class="comment-header">
                <el-avatar :size="40" :icon="UserFilled" class="comment-avatar" />
                <div class="comment-meta">
                  <strong>{{ comment.username }}</strong>
                  <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
                </div>
                <div class="comment-actions">
                  <el-button
                    v-if="canDeleteComment(comment)"
                    size="small"
                    type="danger"
                    @click="deleteComment(comment.id)"
                  >
                    <el-icon><delete /></el-icon> 删除
                  </el-button>
                </div>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
              <div class="comment-interactions">
                <el-button
                  size="small"
                  :type="comment.isLiked ? 'primary' : 'default'"
                  @click="likeComment(comment.id)"
                >
                  <el-icon><thumbs-up /></el-icon>
                  {{ comment.likeCount || 0 }}
                </el-button>
                <el-button size="small" @click="replyComment(comment)">
                  <el-icon><message /></el-icon> 回复
                </el-button>
              </div>
              <!-- 回复列表 -->
              <div v-if="comment.replies && comment.replies.length > 0" class="reply-list">
                <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                  <div class="reply-header">
                    <strong>{{ reply.username }}</strong>
                    <span class="reply-time">{{ formatTime(reply.createTime) }}</span>
                    <el-button
                      v-if="canDeleteComment(reply)"
                      size="mini"
                      type="danger"
                      @click="deleteComment(reply.id)"
                    >
                      <el-icon><delete /></el-icon>
                    </el-button>
                  </div>
                  <div class="reply-content">{{ reply.content }}</div>
                  <div class="reply-interactions">
                    <el-button
                      size="mini"
                      :type="reply.isLiked ? 'primary' : 'default'"
                      @click="likeComment(reply.id)"
                    >
                      <el-icon><thumbs-up /></el-icon> {{ reply.likeCount || 0 }}
                    </el-button>
                    <el-button size="mini" @click="replyComment(reply)">
                      <el-icon><reply /></el-icon> 回复
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无评论" />

          <div class="pagination" v-if="commentTotal > 0">
            <el-pagination
              v-model:current-page="commentPage"
              :page-size="commentPageSize"
              :total="commentTotal"
              layout="prev, pager, next"
              @current-change="loadComments"
            />
          </div>
        </div>
      </el-card>

      <!-- 发表评论对话框 -->
      <el-dialog v-model="showCommentDialog" :title="replyTarget ? '回复评论' : '发表评论'" width="500px">
        <el-form :model="commentForm" :rules="commentRules" ref="commentFormRef">
          <el-form-item prop="content">
            <el-input
              v-model="commentForm.content"
              type="textarea"
              :rows="4"
              :placeholder="replyTarget ? `回复 ${replyTarget.username}` : '请输入评论内容'"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="cancelComment">取消</el-button>
          <el-button type="primary" @click="submitComment" :loading="submitting">
            {{ replyTarget ? '回复' : '发表' }}
          </el-button>
        </template>
      </el-dialog>
    </div>
  </MainLayout>
</template>

<script setup>import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getBookById } from '@/api/book';
import { getMyRating, rateBook } from '@/api/rating';
import { getCommentList, addComment, likeComment as apiLikeComment, deleteComment as apiDeleteComment } from '@/api/comment';
import { useUserStore } from '@/stores/user';
import MainLayout from '@/components/MainLayout.vue';
import { UserFilled } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
const route = useRoute();
const userStore = useUserStore();
const loading = ref(false);
const submitting = ref(false);
const bookInfo = ref(null);
const myRating = ref(0);
const averageRating = ref(0);
const ratingCount = ref(0);
const commentList = ref([]);
const commentTotal = ref(0);
const commentPage = ref(1);
const commentPageSize = ref(10);
const showCommentDialog = ref(false);
const commentFormRef = ref(null);
const replyTarget = ref(null);
const defaultCover = 'https://via.placeholder.com/300x400?text=No+Cover';
const commentForm = ref({
 content: '',
 parentId: null
});
const commentRules = {
 content: [
 { required: true, message: '请输入评论内容', trigger: 'blur' },
 { min: 1, max: 500, message: '长度在 1 到 500 个字符', trigger: 'blur' }
 ]
};
const loadBookDetail = async () => {
 loading.value = true;
 try {
 const res = await getBookById(route.params.id);
 bookInfo.value = res.data;
 // 处理评分统计
 if (res.data.ratingStats) {
 averageRating.value = res.data.ratingStats.averageScore || 0;
 ratingCount.value = res.data.ratingStats.count || 0;
 }
 }
 catch (error) {
 ElMessage.error('加载图书详情失败');
 }
 finally {
 loading.value = false;
 }
};
const loadMyRating = async () => {
 try {
 const res = await getMyRating(route.params.id);
 myRating.value = res.data || 0;
 }
 catch (error) {
 console.error('Load rating error:', error);
 }
};
const handleRate = async (value) => {
 try {
 await rateBook(route.params.id, value);
 ElMessage.success('评分成功');
 loadBookDetail();
 }
 catch (error) {
 ElMessage.error('评分失败');
 myRating.value = 0;
 }
};
const loadComments = async () => {
    try {
        const res = await getCommentList(route.params.id, {
            page: commentPage.value,
            size: commentPageSize.value
        });
        // 后端返回格式: { list: [ { comment: {}, replies: [] } ], page, size, total }
        // 需要将结构转换为前端期望的格式
        const rawList = res.data.list || [];
        commentList.value = rawList.map(item => {
            const comment = item.comment || {};
            const replies = (item.replies || []).map(reply => ({
                ...reply,
                username: '用户' + reply.userId, // 后端可能没有返回username，先用占位符
                createTime: reply.createdAt
            }));
            return {
                ...comment,
                username: '用户' + comment.userId, // 后端可能没有返回username
                createTime: comment.createdAt,
                replies: replies
            };
        });
        commentTotal.value = res.data.total || 0;
    } catch (error) {
        console.error('Load comments error:', error);
    }
};
const cancelComment = () => {
 showCommentDialog.value = false;
 commentForm.value.content = '';
 commentForm.value.parentId = null;
 replyTarget.value = null;
};
const submitComment = async () => {
 if (!commentFormRef.value)
 return;
 await commentFormRef.value.validate(async (valid) => {
 if (valid) {
 submitting.value = true;
 try {
 await addComment(route.params.id, {
 content: commentForm.value.content,
 parentId: commentForm.value.parentId
 });
 ElMessage.success(replyTarget.value ? '回复成功' : '评论成功');
 cancelComment();
 commentPage.value = 1;
 loadComments();
 }
 catch (error) {
 ElMessage.error(replyTarget.value ? '回复失败' : '评论失败');
 }
 finally {
 submitting.value = false;
 }
 }
 });
};
const replyComment = (comment) => {
 replyTarget.value = comment;
 commentForm.value.parentId = comment.id;
 showCommentDialog.value = true;
};
const likeComment = async (commentId) => {
 try {
 await apiLikeComment(route.params.id, commentId);
 ElMessage.success('点赞成功');
 loadComments();
 }
 catch (error) {
 ElMessage.error('点赞失败');
 }
};
const deleteComment = async (commentId) => {
 try {
 await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', { type: 'warning' });
 await apiDeleteComment(route.params.id, commentId);
 ElMessage.success('删除成功');
 loadComments();
 }
 catch (error) {
 if (error !== 'cancel') {
 ElMessage.error('删除失败');
 }
 }
};
const canDeleteComment = (comment) => {
 // 管理员可以删除任意评论，用户只能删除自己的评论
 const currentUserId = userStore.userInfo?.id;
 const isAdmin = userStore.userInfo?.role === 'admin' || userStore.userInfo?.role === 'super_admin';
 return isAdmin || comment.userId === currentUserId;
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
 loadBookDetail();
 loadMyRating();
 loadComments();
});
</script>

<style scoped>
.book-detail-container {
  max-width: 1200px;
  margin: 0 auto;
}

.book-cover img {
  width: 100%;
  max-width: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.rating-stats {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-count {
  color: #909399;
  font-size: 14px;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.comment-item {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.comment-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.comment-meta {
  flex: 1;
}

.comment-time {
  color: #909399;
  font-size: 14px;
  margin-left: 10px;
}

.comment-content {
  margin: 10px 0;
  line-height: 1.6;
  padding-left: 52px;
}

.comment-interactions {
  display: flex;
  gap: 10px;
  padding-left: 52px;
}

.reply-list {
  margin-top: 15px;
  padding-left: 52px;
  border-left: 2px solid #e4e7ed;
}

.reply-item {
  padding: 12px 15px;
  background: #fafafa;
  margin-bottom: 10px;
  border-radius: 4px;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.reply-time {
  color: #909399;
  font-size: 12px;
}

.reply-content {
  margin-bottom: 8px;
  font-size: 14px;
}

.reply-interactions {
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>