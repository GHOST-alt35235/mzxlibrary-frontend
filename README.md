# 图书馆系统 - 前端项目

基于 Vue 3 + Vite + Element Plus 构建的现代化前端应用。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Element Plus** - Vue 3 组件库
- **Pinia** - Vue 状态管理
- **Vue Router** - Vue 官方路由
- **Axios** - HTTP 客户端

## 项目结构

```
library-frontend/
├── src/
│   ├── api/              # API 接口封装
│   │   ├── auth.js       # 认证相关接口
│   │   ├── book.js       # 图书相关接口
│   │   ├── comment.js    # 评论相关接口
│   │   ├── rating.js     # 评分相关接口
│   │   ├── resource.js   # 资源相关接口
│   │   ├── chat.js       # 聊天相关接口
│   │   └── points.js     # 积分相关接口
│   ├── components/       # 公共组件
│   │   └── MainLayout.vue  # 主布局组件
│   ├── router/           # 路由配置
│   │   └── index.js
│   ├── stores/           # Pinia 状态管理
│   │   └── user.js       # 用户状态
│   ├── utils/            # 工具函数
│   │   └── request.js    # Axios 封装
│   ├── views/            # 页面组件
│   │   ├── Login.vue     # 登录页
│   │   ├── Register.vue  # 注册页
│   │   ├── Home.vue      # 首页
│   │   ├── books/        # 图书模块
│   │   ├── resources/    # 资源模块
│   │   ├── chat/         # 聊天模块
│   │   ├── points/       # 积分模块
│   │   └── admin/        # 管理后台
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件
├── index.html
├── package.json
└── vite.config.js
```

## 功能模块

### 1. 用户认证
- 用户登录
- 用户注册
- 自动登录（Token 持久化）
- 路由守卫

### 2. 图书模块
- 图书列表（分页、搜索）
- 图书详情
- 图书评分
- 图书评论

### 3. 资源模块
- 资源列表
- 资源下载
- 资源上传（待实现）

### 4. 聊天模块
- 会话列表
- 实时消息
- 新建聊天

### 5. 积分模块
- 积分余额查询
- 积分流水

### 6. 管理后台
- 用户管理（封禁/解封、重置密码）
- 图书管理（增删改查、上下架）
- 资源审核（通过/拒绝/下架）

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## API 代理配置

开发环境下，所有 `/api` 请求将代理到后端服务器：

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    }
  }
}
```

## 环境变量

创建 `.env` 文件配置环境变量：

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## 代码规范

- 使用 ES Module
- 使用 Composition API (`<script setup>`)
- 组件名使用 PascalCase
- 文件名使用 kebab-case 或 PascalCase

## 注意事项

1. Token 存储在 localStorage 中
2. 所有 API 请求自动携带 satoken header
3. 401 错误自动跳转到登录页
4. 统一使用 Element Plus 的消息提示

## 后续优化建议

1. 添加加载骨架屏
2. 实现图片懒加载
3. 添加错误边界处理
4. 实现 PWA 支持
5. 添加单元测试（Vitest）
6. 优化首屏加载性能
7. 实现 WebSocket 实时通信
