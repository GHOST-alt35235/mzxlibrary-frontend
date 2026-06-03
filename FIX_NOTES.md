# 登录问题修复说明

## 问题描述

前端登录时显示 "success" 错误提示，无法成功登录。

## 问题原因

前后端响应状态码不一致：
- **后端**: 使用 `code=0` 表示成功（见 `Result.java`）
- **前端**: 期望 `code=200` 才是成功（见 `request.js`）

这导致前端响应拦截器将所有成功的请求都判定为失败，并显示错误提示。

## 解决方案

修改了 `src/utils/request.js` 中的响应拦截器，将判断条件从 `res.code === 200` 改为 `res.code === 0`。

### 修改前
```javascript
if (res.code === 200) {
  return res
} else {
  ElMessage.error(res.message || '请求失败')
  return Promise.reject(new Error(res.message || '请求失败'))
}
```

### 修改后
```javascript
// 后端使用 code=0 表示成功，code=-1 或其他负数表示失败
if (res.code === 0) {
  return res
} else {
  ElMessage.error(res.message || '请求失败')
  return Promise.reject(new Error(res.message || '请求失败'))
}
```

## 后端响应格式说明

后端统一使用 `Result<T>` 类封装响应，格式如下：

```json
{
  "code": 0,          // 0=成功, -1=失败, 其他负数=自定义错误
  "message": "success", // 响应消息
  "data": {}          // 业务数据（泛型）
}
```

### 常用方法
- `Result.success(data)` - 返回成功响应，code=0, message="success"
- `Result.success(message, data)` - 返回成功响应，自定义消息
- `Result.fail(message)` - 返回失败响应，code=-1
- `Result.fail(code, message)` - 返回失败响应，自定义错误码

## 测试步骤

1. 确保后端服务运行在 `http://localhost:8080`
2. 确保前端服务运行在 `http://localhost:3000`
3. 访问 `http://localhost:3000/login`
4. 输入用户名和密码
5. 点击登录按钮
6. 应该能够成功登录并跳转到主页

## 相关文件

- [request.js](src/utils/request.js) - Axios请求封装和拦截器
- [Result.java](../LibrarySystem/src/main/java/cn/edu/wynu/common/api/Result.java) - 后端响应结果类
- [WebConfig.java](../LibrarySystem/src/main/java/cn/edu/wynu/common/config/WebConfig.java) - CORS跨域配置

## 其他修复

同时修复了以下问题：

1. **CORS跨域配置** - 添加了 `WebConfig.java` 允许前端跨域访问
2. **Token传递** - 增强了Header设置，同时设置多个可能的header名称
3. **localStorage同步** - 添加了小延迟确保localStorage更新后再调用API

---

**修复时间**: 2026年5月27日  
**修复人**: Lingma AI Assistant
