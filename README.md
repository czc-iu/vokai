# TomyBot - AI 智能助手

> 让客服更智能，让服务更高效

TomyBot 是一个基于 Nuxt 3 的全栈 AI 智能客服系统，集成阿里云通义千问（Qwen）大模型，提供企业级智能对话服务。采用日系极简设计风格，为用户提供优雅的交互体验。

## 功能特性

### 核心功能
- **用户认证** - 注册、登录、JWT Token 认证
- **AI 智能对话** - 基于阿里云 Qwen 大模型的智能客服
- **流式响应** - SSE 实时流式输出，支持 Markdown 渲染
- **联网搜索** - 支持 Qwen 联网搜索功能
- **深度思考** - 支持开启/关闭思考模式，展示推理过程
- **对话管理** - 多会话管理、历史记录持久化
- **联系表单** - 公开的客户咨询提交

### 高级功能
- **RAG 知识库** - 基于 Vectra 的向量检索增强生成，支持 Markdown 文档索引
- **用户记忆** - 自动提取用户信息，支持手动记忆管理
- **MCP 服务** - 集成 Model Context Protocol，支持外部工具调用
- **Skills 技能** - 基于 SKILL.md 的自定义技能系统
- **命令执行** - 白名单控制的命令行工具执行

### 技术特性
- **类型安全** - TypeScript 严格模式
- **输入验证** - Zod 运行时验证
- **响应式设计** - 移动端优先的响应式布局
- **测试覆盖** - 148+ 单元测试

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Nuxt 3 + Vue 3 |
| UI 框架 | TailwindCSS |
| 后端 API | Nuxt Server API |
| 数据库 | MySQL 8.0 |
| 认证 | JWT + bcrypt |
| AI 模型 | 阿里云 Qwen (通义千问) |
| 向量数据库 | Vectra |
| MCP SDK | @modelcontextprotocol/sdk |
| 验证 | Zod |
| 部署 | Docker + Nginx |

## 快速开始

### 环境要求
- Node.js 20+
- MySQL 8.0+
- npm 或 pnpm

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd Tomybot

# 安装依赖
npm install

# 复制环境变量
cp .env.example .env

# 编辑 .env 文件，填入必要配置
```

### 配置环境变量

```bash
# JWT 配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tomybot
DB_USER=root
DB_PASSWORD=your-password

# Qwen API
QWEN_API_KEY=your-qwen-api-key
QWEN_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
QWEN_MODEL=qwen-plus
QWEN_SYSTEM_PROMPT=你是TomyBot智能助手...

# RAG 知识库
RAG_DOCS_PATH=./docs
RAG_INDEX_PATH=./.vectra

# Skills 技能
SKILLS_PATH=./skills

# 联系邮箱
CONTACT_EMAIL=info@sayco.com.cn
```

### 初始化数据库

```bash
mysql -u root -p < database/init.sql
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
Tomybot/
├── app/                          # Nuxt 应用
│   ├── assets/css/               # 全局样式
│   ├── components/               # Vue 组件
│   │   └── ChatMessage.vue       # 聊天消息组件（支持 Markdown）
│   ├── composables/              # Vue Composables
│   │   └── useAuth.ts            # 认证状态管理
│   ├── layouts/                  # 布局组件
│   │   └── default.vue           # 默认布局
│   ├── middleware/               # 路由中间件
│   │   └── auth.ts               # 认证守卫
│   ├── pages/                    # 页面组件
│   │   ├── index.vue             # 首页
│   │   ├── login.vue             # 登录
│   │   ├── register.vue          # 注册
│   │   ├── chat.vue              # AI 对话（流式 + Markdown）
│   │   ├── contact.vue           # 联系我们
│   │   └── coming-soon.vue       # 敬请期待
│   └── app.vue                   # 根组件
│
├── server/                       # 服务端代码
│   ├── api/                      # API 路由
│   │   ├── auth/                 # 认证接口
│   │   │   ├── register.post.ts
│   │   │   ├── login.post.ts
│   │   │   └── me.get.ts
│   │   ├── chat/                 # 对话接口
│   │   │   ├── index.post.ts     # 标准对话
│   │   │   ├── stream.post.ts    # 流式对话
│   │   │   ├── execute.post.ts   # 命令执行
│   │   │   ├── conversations.get.ts
│   │   │   └── conversations/[id].get.ts
│   │   ├── contact/              # 联系表单
│   │   │   └── index.post.ts
│   │   ├── memory/               # 用户记忆
│   │   │   ├── index.get.ts
│   │   │   ├── index.post.ts
│   │   │   └── [key].delete.ts
│   │   └── admin/                # 管理接口
│   │       ├── rag/              # RAG 管理
│   │       ├── mcp/              # MCP 服务管理
│   │       ├── skills/           # 技能管理
│   │       └── commands/         # 命令白名单管理
│   ├── middleware/               # 服务端中间件
│   │   └── auth.ts               # JWT 验证
│   ├── utils/                    # 工具函数
│   │   ├── ai.ts                 # Qwen API 集成（OpenAI 兼容格式）
│   │   ├── auth.ts               # 认证工具
│   │   ├── constants.ts          # 常量定义
│   │   ├── db.ts                 # 数据库操作
│   │   ├── embedding.ts          # 文本嵌入（Qwen text-embedding-v3）
│   │   ├── executor.ts           # 命令执行器
│   │   ├── mcp.ts                # MCP 服务集成
│   │   ├── memory.ts             # 用户记忆管理
│   │   ├── rag.ts                # RAG 向量检索
│   │   ├── response.ts           # API 响应
│   │   ├── skills.ts             # 技能系统
│   │   └── validation.ts         # 输入验证
│   └── __tests__/                # 测试文件
│
├── database/                     # 数据库
│   └── init.sql                  # 初始化脚本
│
├── docs/                         # RAG 知识库文档
├── skills/                       # 自定义技能目录
├── .vectra/                      # Vectra 向量索引
│
├── nuxt.config.ts                # Nuxt 配置
├── tailwind.config.ts            # Tailwind 配置
├── docker-compose.yml            # Docker Compose
├── Dockerfile                    # Docker 镜像
├── nginx.conf                    # Nginx 配置
└── vitest.config.ts              # 测试配置
```

## API 文档

### 认证接口

#### POST /api/auth/register
用户注册

**请求体:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "用户名"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "email": "...", "name": "..." },
    "token": "jwt-token"
  }
}
```

#### POST /api/auth/login
用户登录

#### GET /api/auth/me
获取当前用户信息

**Headers:** `Authorization: Bearer <token>`

### 对话接口

#### POST /api/chat
发送消息到 AI（标准模式）

**Headers:** `Authorization: Bearer <token>`

**请求体:**
```json
{
  "message": "你好",
  "conversationId": 1,
  "enableSearch": true,
  "enableThinking": false
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "conversationId": 1,
    "message": "你好！有什么可以帮助你的吗？",
    "reasoningContent": "思考过程..."
  }
}
```

#### POST /api/chat/stream
流式对话（SSE）

**Headers:** `Authorization: Bearer <token>`

**请求体:**
```json
{
  "message": "你好",
  "conversationId": 1,
  "enableSearch": true,
  "enableThinking": true
}
```

**响应:** Server-Sent Events
```
data: {"type":"conversation","conversationId":1}
data: {"type":"content","content":"你"}
data: {"type":"content","content":"好"}
data: {"type":"reasoning","content":"思考中..."}
data: {"type":"done"}
```

#### POST /api/chat/execute
执行白名单命令

**请求体:**
```json
{
  "command": "date"
}
```

#### GET /api/chat/conversations
获取用户的对话列表

#### GET /api/chat/conversations/:id
获取对话的所有消息

### 用户记忆接口

#### GET /api/memory
获取用户所有记忆

#### POST /api/memory
创建/更新记忆

**请求体:**
```json
{
  "key": "姓名",
  "value": "张三"
}
```

#### DELETE /api/memory/:key
删除指定记忆

### 管理接口

#### RAG 管理
- `GET /api/admin/rag` - 获取索引状态和文档列表
- `POST /api/admin/rag` - 重新索引文档

#### MCP 服务管理
- `GET /api/admin/mcp` - 列出所有 MCP 服务
- `POST /api/admin/mcp` - 注册新服务
- `DELETE /api/admin/mcp/:id` - 删除服务

#### 技能管理
- `GET /api/admin/skills` - 列出所有技能
- `POST /api/admin/skills/scan` - 扫描技能目录
- `DELETE /api/admin/skills/:id` - 删除技能

#### 命令白名单管理
- `GET /api/admin/commands` - 列出所有白名单命令
- `POST /api/admin/commands` - 添加命令
- `DELETE /api/admin/commands/:id` - 删除命令

### 联系表单

#### POST /api/contact
提交联系表单（无需认证）

## 数据库设计

### 数据表

| 表名 | 描述 |
|------|------|
| users | 用户信息 |
| conversations | 对话会话 |
| messages | 对话消息 |
| contacts | 联系表单 |
| user_sessions | 用户会话 |
| user_memories | 用户记忆 |
| mcp_services | MCP 服务配置 |
| skills | 技能定义 |
| whitelisted_commands | 命令白名单 |
| system_config | 系统配置 |

### ER 关系

```
users ──┬──< conversations ──< messages
        ├──< user_sessions
        └──< user_memories

mcp_services (独立)
skills (独立)
whitelisted_commands (独立)
contacts (独立)
```

## 高级功能说明

### RAG 知识库

1. 将 Markdown 文档放入 `docs/` 目录
2. 调用 `POST /api/admin/rag` 索引文档
3. 对话时自动检索相关内容注入上下文

### 用户记忆

- **自动提取**: 系统从对话中自动识别姓名、职业、公司等信息
- **手动管理**: 使用 `/remember <key> <value>` 和 `/forget <key>` 命令

### MCP 服务

支持接入任何兼容 MCP 协议的服务：
```json
{
  "name": "weather",
  "command": "npx",
  "args": ["@mcp/weather-server"],
  "env": {}
}
```

### Skills 技能

在 `skills/` 目录下创建技能：
```
skills/
└── my-skill/
    └── SKILL.md
```

SKILL.md 格式：
```markdown
# 技能名称
> 技能描述

## Triggers
- 触发条件1
- 触发条件2

## Instructions
使用说明...
```

### 命令执行

默认白名单命令：`python3`, `node`, `date`, `echo`

可通过管理接口添加/删除命令。

## 部署指南

### Docker 部署（推荐）

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 手动部署

```bash
# 构建
npm run build

# 启动
npm run preview
```

## 开发指南

### 常用命令

```bash
# 开发
npm run dev

# 类型检查
npm run typecheck

# 代码检查
npm run lint

# 运行测试
npm run test

# 测试覆盖率
npm run test:coverage
```

### 代码规范

- **TypeScript**: 严格模式，显式类型
- **Vue**: Composition API + `<script setup>`
- **CSS**: TailwindCSS 工具类
- **命名**: 
  - Vue 组件: PascalCase
  - TypeScript: camelCase
  - API 路由: REST 约定

### 设计系统

采用日系极简风格：

| 颜色 | 用途 |
|------|------|
| cream (#faf9f6) | 背景 |
| sakura (#f5ebe0) | 浅色强调 |
| indigo (#4a5568) | 主色调 |
| charcoal (#3d3d3d) | 文字 |

## 测试

### 测试统计
- **测试文件**: 9 个
- **测试用例**: 148 个

### 运行测试

```bash
# 运行所有测试
npm run test

# 带覆盖率报告
npm run test:coverage
```

### 测试文件

```
server/__tests__/
├── ai.test.ts           # AI 工具测试
├── auth.test.ts         # 认证工具测试
├── db.test.ts           # 数据库工具测试
├── validation.test.ts   # 验证工具测试
├── response.test.ts     # 响应工具测试
├── api.auth.test.ts     # 认证 API 测试
├── api.chat.test.ts     # 对话 API 测试
└── api.contact.test.ts  # 联系表单测试

app/__tests__/
└── useAuth.test.ts      # 认证 Composable 测试
```

## 许可证

© 2026 赛熠可信息技术（上海）有限公司

## 联系方式

- 邮箱: info@sayco.com.cn
- 网站: https://tomybot.com
