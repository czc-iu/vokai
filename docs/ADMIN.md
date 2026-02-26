# 管理后台访问说明

## 🚀 快速开始

### 1. 数据库升级

如果数据库已经存在，需要手动添加 role 字段：

```sql
ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user' AFTER company;
```

### 2. 设置管理员

执行以下 SQL 将用户设置为管理员：

```bash
# 方法1: 通过用户ID设置
mysql -u root -p tomybot < database/set-admin.sql

# 方法2: 或者直接执行 SQL
mysql -u root -p tomybot -e "UPDATE users SET role = 'admin' WHERE id = 1;"
```

### 3. 访问管理后台

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 登录管理员账号：
   - 访问 http://localhost:3000/login
   - 使用管理员账号登录

3. 访问管理后台：
   - 直接访问 http://localhost:3000/admin
   - 或在用户菜单中点击"管理后台"链接

## 📋 管理后台功能

### 控制台 (`/admin`)
- 系统概览
- 快捷操作
- 系统状态监控

### RAG文档管理 (`/admin/rag`)
- 查看已索引文档
- 索引新文档
- 查看索引状态

### MCP服务管理 (`/admin/mcp`)
- 添加/删除 MCP 服务
- 查看服务状态

### 技能管理 (`/admin/skills`)
- 扫描技能目录
- 启用/禁用技能
- 删除技能

### 命令管理 (`/admin/commands`)
- 添加命令到白名单
- 删除命令
- 管理命令权限

## 🔒 权限控制

- 只有 `role = 'admin'` 的用户可以访问管理后台
- 所有 admin API 都需要管理员权限验证
- 非管理员访问会被拒绝（403 Forbidden）

## 🌐 多语言支持

管理后台支持三种语言：
- 中文 (zh-CN)
- 英文
- 日文

语言设置与前台保持一致。

## ⚠️ 注意事项

1. **首次使用**：确保执行数据库迁移脚本
2. **权限验证**：必须以管理员身份登录
3. **API保护**：所有管理API都已添加权限验证
4. **生产环境**：建议修改默认的管理员账号

## 🔧 故障排查

### 无法访问管理后台
1. 检查用户是否已设置为管理员
2. 检查是否已登录
3. 清除浏览器缓存

### API返回403错误
1. 确认用户角色为 admin
2. 检查 JWT token 是否有效
3. 重新登录

### 页面显示异常
1. 清除浏览器缓存
2. 检查控制台错误信息
3. 重启开发服务器
